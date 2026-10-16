import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import Stripe from 'stripe';
import { applySettlement, deliverStripeMessages } from '../src/lib/adapters/stripe-settlement.mjs';
import { loadTSModule } from './fixtures/load-ts-module.mjs';

let db;
const orderId='00000000-0000-4000-8000-000000000001';
const affiliateId='00000000-0000-4000-8000-000000000002';
const migration='supabase/migrations/20261016231001_stripe_atomic_settlement.sql';
const q=(sql,params=[])=>db.query(sql,params);
before(async()=>{
  if(process.env.TEST_DATABASE_URL) {
    const u=new URL(process.env.TEST_DATABASE_URL);
    assert.ok(['localhost','127.0.0.1'].includes(u.hostname) && u.pathname==='/vf_commerce_test','Isolated local test database required');
    db=new pg.Pool({connectionString:u.href});
  } else db=new PGlite();
  const exec=sql=>db.exec?db.exec(sql):db.query(sql);
  await exec(fs.readFileSync('tests/fixtures/stripe-settlement-schema.sql','utf8'));
  for(const name of ['05_commerce_core.sql','06_stripe_commerce.sql','07_stripe_lifecycle.sql'])
    await exec(fs.readFileSync('supabase/migrations/'+name,'utf8'));
  // Reproduce Supabase's pre-migration public insert grants so the revocation
  // assertions fail if the migration ever leaves the original bypass open.
  await exec('GRANT INSERT ON manual_orders,manual_order_items TO anon,authenticated');
  await exec(fs.readFileSync(migration,'utf8'));
});
after(async()=>{if(db)await (db.close?db.close():db.end());});
beforeEach(async()=>{
  await q('TRUNCATE stripe_email_outbox,stripe_webhook_events,inventory_transactions,order_events,referral_revenue,manual_order_items,manual_orders,products,promotions,affiliates CASCADE');
  await q('INSERT INTO affiliates(id) VALUES($1)',[affiliateId]);
  await q("INSERT INTO products VALUES('sku-a',10,now()),('sku-b',10,now())");
  await q("INSERT INTO promotions(code) VALUES('WELCOME10')");
  await q(`INSERT INTO manual_orders(id,order_number,customer_email,customer_name,checkout_mode,payment_provider,stripe_livemode,
    stripe_checkout_session_id,total_amount,subtotal_amount,discount_amount,shipping_amount,promo_code,affiliate_id,affiliate_commission_amount,affiliate_commission_rate_bps,is_test)
    VALUES($1,'VF-TEST','qa@example.invalid','QA','stripe','stripe',false,'cs_test_a',1000,900,100,100,'WELCOME10',$2,90,1000,true)`,[orderId,affiliateId]);
  await q("INSERT INTO manual_order_items(manual_order_id,product_id,product_name,quantity,unit_price_amount,line_total_amount) VALUES($1,'sku-a','A',2,300,600),($1,'sku-b','B',1,400,400)",[orderId]);
});
function event(type='checkout.session.completed',id='evt_a',extra={}) {
  const session=type.startsWith('checkout.session.');
  return {id,type,livemode:false,data:{object:{id:session?'cs_test_a':type==='charge.refunded'?'ch_test_a':'pi_test_a',
    metadata:{orderId},client_reference_id:orderId,payment_intent:'pi_test_a',payment_status:'paid',amount_total:1000,amount_received:1000,amount:1000,currency:'usd',...extra}}};
}
const database={rpc:async(name,params)=>{try{
  const names={apply_stripe_event:['p_event'],record_stripe_failure:['p_id','p_type'],claim_stripe_email:['p_id','p_token'],prepare_stripe_email:['p_id','p_token','p_payload'],finish_stripe_email:['p_id','p_token','p_provider_id']};
  const args=names[name];const r=await q(`select ${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args.map(k=>params[k]));return {data:r.rows[0].result,error:null};
}catch(error){return {data:null,error};}},from:()=>({select:()=>({eq:(_,id)=>({is:async()=>({data:(await q('select id from stripe_email_outbox where manual_order_id=$1 and sent_at is null',[id])).rows})})})})};
const apply=e=>applySettlement(database,e);
const order=async()=> (await q('select * from manual_orders where id=$1',[orderId])).rows[0];
const count=async table=>Number((await q('select count(*) as n from '+table)).rows[0].n);
async function inject(table,operation,body,condition='') {
  await q(`CREATE FUNCTION fail_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected failure'; END $$`);
  await q(`CREATE TRIGGER fail_test BEFORE ${operation} ON ${table} FOR EACH ROW ${condition} EXECUTE FUNCTION fail_test()`);
  try{await body();}finally{await q(`DROP TRIGGER fail_test ON ${table}`);await q('DROP FUNCTION fail_test()');}
}

test('missing database never acknowledges an unapplied settlement',async()=>{
  await assert.rejects(applySettlement(null,event()),/database_unavailable/);
});
for(const [table,op] of [['stripe_webhook_events','INSERT'],['manual_orders','UPDATE'],['inventory_transactions','INSERT'],['order_events','INSERT'],['stripe_email_outbox','INSERT']])
test(`${table} ${op} failure rolls back payment, every inventory line, promotion and commission`,async()=>{
  await inject(table,op,async()=>{await assert.rejects(apply(event()),/database_failure/);});
  assert.equal((await order()).payment_status,'unpaid');
  assert.equal((await order()).inventory_decremented_at,null);
  assert.deepEqual((await q('select inventory_quantity from products order by id')).rows.map(x=>x.inventory_quantity),[10,10]);
  assert.equal(await count('referral_revenue'),0);
  assert.equal((await q('select times_used from promotions')).rows[0].times_used,0);
  assert.equal((await apply(event())).outcome,'settled');
});
test('signed success + duplicate and concurrent events settle exactly once',async()=>{
  const stripe=new Stripe('sk_test_fixture');const payload=JSON.stringify(event());const secret='whsec_fixture';
  const signature=stripe.webhooks.generateTestHeaderString({payload,secret});
  const signed=stripe.webhooks.constructEvent(payload,signature,secret);
  assert.throws(()=>stripe.webhooks.constructEvent(payload+' ',signature,secret));
  await Promise.all([apply(signed),apply(signed),apply(event('payment_intent.succeeded','evt_b'))]);
  assert.equal((await order()).payment_status,'paid');assert.ok((await order()).inventory_decremented_at);
  assert.deepEqual((await q('select inventory_quantity from products order by id')).rows.map(x=>x.inventory_quantity),[8,9]);
  assert.equal(await count('referral_revenue'),1);assert.equal(await count('inventory_transactions'),2);
  assert.equal(await count('stripe_email_outbox'),2);
  assert.equal((await q('select times_used from promotions')).rows[0].times_used,1);
});
test('failure on the second inventory line rolls back the first line and its ledger',async()=>{
  await inject('inventory_transactions','INSERT',async()=>await assert.rejects(apply(event())),"WHEN (NEW.product_id='sku-b')");
  assert.deepEqual((await q('select inventory_quantity from products order by id')).rows.map(x=>x.inventory_quantity),[10,10]);
  assert.equal(await count('inventory_transactions'),0);assert.equal((await order()).inventory_decremented_at,null);
  assert.equal((await apply(event())).outcome,'settled');
});
test('processing failures and overdue emails reach the existing health probe',async()=>{
  await database.rpc('record_stripe_failure',{p_id:'evt_failure',p_type:'payment_intent.succeeded'});
  const health=await q('select stripe_processing_health() result');assert.equal(health.rows[0].result.retryPending,1);
  await apply(event());await q("update stripe_email_outbox set created_at=now()-interval '11 minutes'");
  assert.equal((await q('select stripe_processing_health() result')).rows[0].result.messagesPending,2);
});
test('missing attributed order retries; unknown unattributed event is identified',async()=>{
  await assert.rejects(apply(event(undefined,undefined,{metadata:{orderId:'00000000-0000-4000-8000-000000000099'},client_reference_id:null,id:'cs_unknown',payment_intent:'pi_unknown'})));
  const unknown=await apply(event(undefined,'evt_unknown',{metadata:{},client_reference_id:null,id:'cs_unknown',payment_intent:'pi_unknown'}));
  assert.equal(unknown.outcome,'unknown_unattributed_event');
  assert.equal(Number((await q("select count(*) n from stripe_webhook_events where id='evt_unknown'")).rows[0].n),0);
});
test('legacy claimed event and already-paid partial effects are held for review',async()=>{
  await q("insert into stripe_webhook_events(id,event_type,manual_order_id) values('evt_a','checkout.session.completed',$1)",[orderId]);
  assert.equal((await apply(event())).review,true);
  await q("update manual_orders set payment_status='paid' where id=$1",[orderId]);
  assert.equal((await apply(event('payment_intent.succeeded','evt_b'))).review,true);
  assert.equal(await count('inventory_transactions'),0);
});
test('amount, missing amount, currency, mode and identity mismatch never settle',async()=>{
  for(const change of [{amount_total:999},{amount_total:null},{currency:'eur'},{payment_intent:null}])
    await assert.rejects(apply(event(undefined,undefined,change)));
  await assert.rejects(apply({...event(),livemode:true}));
  await q("update manual_orders set stripe_payment_intent_id='pi_other' where id=$1",[orderId]);
  await assert.rejects(apply(event()));assert.equal((await order()).payment_status,'unpaid');
});
test('unpaid completed session waits; asynchronous settlement is supported',async()=>{
  assert.equal((await apply(event(undefined,undefined,{payment_status:'unpaid'}))).outcome,'ignored');
  assert.equal((await order()).payment_status,'unpaid');
  assert.equal((await apply(event('checkout.session.async_payment_succeeded','evt_async'))).outcome,'settled');
});
test('failed/expired events cannot regress a successful payment or fulfilment',async()=>{
  await apply(event('payment_intent.payment_failed','evt_fail'));assert.equal((await order()).payment_status,'failed');
  await apply(event('checkout.session.expired','evt_expire'));assert.equal((await order()).status,'canceled');
  await apply(event());await q("update manual_orders set status='shipped' where id=$1",[orderId]);
  await Promise.all([apply(event('checkout.session.expired','evt_expire2')),apply(event('payment_intent.payment_failed','evt_fail2')),apply(event('payment_intent.succeeded','evt_pi'))]);
  assert.equal((await order()).status,'shipped');assert.equal((await order()).payment_status,'paid');
});
test('oversell commits payment and puts order in waiting_inventory',async()=>{
  await q("update products set inventory_quantity=0 where id='sku-a'");await apply(event());
  assert.equal((await order()).status,'waiting_inventory');assert.ok((await order()).stripe_settled_at);
});
test('incomplete lines or missing stock do not stamp inventory completion',async()=>{
  await q('update manual_order_items set product_id=null where product_id=$1',['sku-b']);
  await assert.rejects(apply(event()));assert.equal((await order()).inventory_decremented_at,null);
});
test('refunds are monotonic and late success never resurrects a partial refund',async()=>{
  await apply(event());await apply(event('charge.refunded','evt_refund',{amount_refunded:500}));
  await apply(event('payment_intent.succeeded','evt_late'));
  assert.equal((await order()).payment_status,'partially_refunded');assert.equal((await order()).affiliate_commission_amount,45);
  await apply(event('charge.refunded','evt_smaller',{amount_refunded:200}));assert.equal((await order()).amount_refunded,500);
  await apply(event('charge.refunded','evt_full',{amount_refunded:1000}));assert.equal((await order()).payment_status,'refunded');
  assert.equal((await order()).affiliate_commission_amount,0);assert.equal(await count('inventory_transactions'),2);
});
test('separate customer/owner deliveries retry safely and stamp only after both succeed',async()=>{
  await apply(event());const keys=new Set();let ownerFails=true;
  const render=async job=>({to:job.kind,subject:'fixture',html:'fixture'});
  const send=async p=>{assert.ok(p.requireDelivery);keys.add(p.idempotencyKey);return {success:!(p.to==='paid_owner'&&ownerFails),id:p.to==='paid_owner'&&ownerFails?undefined:p.to};};
  await assert.rejects(deliverStripeMessages(database,orderId,render,send));assert.equal((await order()).paid_email_sent_at,null);
  assert.equal(Number((await q('select count(*) n from stripe_email_outbox where sent_at is not null')).rows[0].n),1);
  ownerFails=false;await deliverStripeMessages(database,orderId,render,send);
  assert.ok((await order()).paid_email_sent_at);assert.equal(keys.size,2);
  await deliverStripeMessages(database,orderId,render,()=>{throw Error('duplicate send');});
});
test('provider success followed by DB failure reuses same message and key within dedupe window',async()=>{
  await apply(event());const seen=[];const render=async job=>({to:job.kind,subject:'fixture',html:'fixture'});
  const send=async p=>{seen.push(p);return {success:true,id:'provider-id'};};
  await inject('order_events','INSERT',async()=>{await assert.rejects(deliverStripeMessages(database,orderId,render,send));});
  await q("update stripe_email_outbox set lease_until=now()-interval '1 second'");
  await deliverStripeMessages(database,orderId,async job=>{
    assert.notEqual(`stripe-email/${job.id}`,seen[0].idempotencyKey,'prepared message must reuse payload');
    return render(job);
  },send);
  const replay=seen.slice(1).find(p=>p.idempotencyKey===seen[0].idempotencyKey);
  assert.ok(replay);assert.equal(seen[0].html,replay.html);
});
test('ambiguous delivery older than provider dedupe window is held, never resent',async()=>{
  await apply(event());await q("update stripe_email_outbox set first_attempt_at=now()-interval '24 hours'");
  await assert.rejects(deliverStripeMessages(database,orderId,()=>{throw Error('rendered');},()=>{throw Error('sent');}));
  assert.equal((await q('select distinct last_error from stripe_email_outbox')).rows[0].last_error,'delivery_ambiguous_review');
});
test('financial RPC and outbox are service role only',async()=>{
  for(const role of ['anon','authenticated']) {
    const r=await q("select has_function_privilege($1,'apply_stripe_event(jsonb)','EXECUTE') allowed,has_table_privilege($1,'stripe_email_outbox','SELECT') readable",[role]);
    assert.equal(r.rows[0].allowed,false);assert.equal(r.rows[0].readable,false);
    const insert=await q("select has_table_privilege($1,'manual_orders','INSERT') orders,has_table_privilege($1,'manual_order_items','INSERT') items",[role]);
    assert.equal(insert.rows[0].orders,false);assert.equal(insert.rows[0].items,false);
  }
});

test('missing email provider never claims delivery for a Stripe job or production email',async()=>{
  const key=process.env.RESEND_API_KEY;const environment=process.env.VERCEL_ENV;
  delete process.env.RESEND_API_KEY;
  const {sendEmailSafely}=loadTSModule('src/lib/email/resend.ts');
  try {
    assert.equal((await sendEmailSafely({to:'qa@example.invalid',subject:'QA',html:'QA',requireDelivery:true})).success,false);
    process.env.VERCEL_ENV='production';
    assert.equal((await sendEmailSafely({to:'qa@example.invalid',subject:'QA',html:'QA'})).success,false);
  } finally {
    if(key===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=key;
    if(environment===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=environment;
  }
});

test('real webhook route verifies signature, returns 503 on DB/lookup failures, and retries delivery',async()=>{
  const original={...process.env};
  Object.assign(process.env,{PAYMENT_GATEWAY_TYPE:'stripe',STRIPE_SECRET_KEY:'sk_test_fixture',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',VERCEL_ENV:'preview'});
  let client=database;let failDelivery=true;
  const {POST}=loadTSModule('src/app/api/webhooks/stripe/route.ts',{
    'src/lib/supabase/admin.ts':{createAdminClient:()=>client},
    'src/lib/email/resend.ts':{sendEmailSafely:async()=>({success:!failDelivery,id:failDelivery?undefined:'provider-id'})},
    'src/lib/email/stripe-messages.ts':{renderStripeMessage:async job=>({to:job.kind,subject:'QA',html:'QA'})},
  });
  const stripe=new Stripe('sk_test_fixture');
  const request=(e=event(),valid=true)=>{const payload=JSON.stringify(e);return new Request('http://localhost/api/webhooks/stripe',{method:'POST',body:payload,headers:{'stripe-signature':valid?stripe.webhooks.generateTestHeaderString({payload,secret:'whsec_fixture'}):'invalid'}});};
  try {
    assert.equal((await POST(request(event(),false))).status,400);
    client=null;assert.equal((await POST(request())).status,503);
    client=database;assert.equal((await POST(request(event(undefined,'evt_missing',{metadata:{orderId:'00000000-0000-4000-8000-000000000099'},client_reference_id:null,id:'cs_missing',payment_intent:'pi_missing'})))).status,503);
    assert.equal((await POST(request())).status,503);assert.equal((await order()).payment_status,'paid');
    failDelivery=false;assert.equal((await POST(request())).status,200);
    assert.equal((await POST(request())).status,200);assert.equal(await count('inventory_transactions'),2);
    assert.ok((await order()).paid_email_sent_at);
  } finally {for(const key of Object.keys(process.env))if(!(key in original))delete process.env[key];Object.assign(process.env,original);}
});
