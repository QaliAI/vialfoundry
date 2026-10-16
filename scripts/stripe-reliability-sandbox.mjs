#!/usr/bin/env node
// Financial integration QA: real Stripe TEST Checkout + isolated embedded PG.
// No production database URL or service key is ever passed to an application.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { isolatedCommerce } from '../tests/fixtures/isolated-commerce.mjs';
import { loadTSModule } from '../tests/fixtures/load-ts-module.mjs';
import { PRODUCTS } from '../src/data/products.ts';
import { vialFoundryBrandConfig } from '../src/config/brand.ts';
import { stripeSecretMode } from '../src/lib/adapters/stripe-gating.mjs';

// Load credentials only in this opt-in runner. Never loaded by npm test/CI.
if(fs.existsSync('.env.local'))for(const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){
  const m=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].trim().replace(/^['"]|['"]$/g,'');
}
assert.equal(stripeSecretMode(),'test','REFUSED: Stripe test key required');
assert.ok(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'),'REFUSED: test publishable key required');
for(const key of Object.keys(process.env))if(key.includes('SUPABASE')||key==='DATABASE_URL')delete process.env[key];
process.env.VERCEL_ENV='development';process.env.PAYMENT_GATEWAY_TYPE='stripe';
process.env.NEXT_PUBLIC_SITE_URL='http://127.0.0.1:9001';
// This signing secret belongs only to the in-process isolated test endpoint.
process.env.STRIPE_WEBHOOK_SECRET='whsec_isolated_fixture';
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
const account=await stripe.accounts.retrieve();
assert.ok(account.charges_enabled && account.capabilities?.card_payments==='active');
assert.equal(account.id,'acct_1UEGL21yrb0MJg1w','REFUSED: expected VialFoundry sandbox');
const {db,client}=await isolatedCommerce();
const brand={...vialFoundryBrandConfig,orderNotificationEmails:['delivered@resend.dev']};
const replacements={'src/lib/supabase/admin.ts':{createAdminClient:()=>client},'src/config/brand.ts':{getBrandConfig:()=>brand}};
const checkout=loadTSModule('src/app/api/checkout/route.ts',replacements);
const webhook=loadTSModule('src/app/api/webhooks/stripe/route.ts',replacements);
const product=PRODUCTS.find(p=>p.id==='vf-std-001');
await db.query('INSERT INTO products(id,inventory_quantity) VALUES($1,10)',[product.id]);
let browser;
try{
  const request={submissionKey:crypto.randomUUID(),customerEmail:'delivered@resend.dev',customerName:'Sandbox QA',ruoAgreed:true,
    preferredPaymentMethod:'card',promoCode:'WELCOME10',shippingMethodId:'standard',
    shippingAddress:{firstName:'Sandbox',lastName:'QA',address:'123 Test St',city:'Test',state:'TX',zip:'75001',email:'delivered@resend.dev'},
    items:[{productId:product.id,productName:product.name,quantity:1}]};
  const response=await checkout.POST(new Request('http://localhost/api/checkout',{method:'POST',body:JSON.stringify(request)}));
  const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));
  const order=(await db.query('select * from manual_orders')).rows[0];
  let session=await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
  assert.equal(session.livemode,false);assert.equal(session.amount_total,order.total_amount);
  assert.equal(data.discountAmount,Math.round(product.price*100*0.1));
  console.log('PASS: actual /api/checkout persisted isolated order/items and created exact-amount WELCOME10 Stripe test session');
  const {chromium}=await import('playwright');browser=await chromium.launch({headless:true});
  const page=await browser.newPage();
  await page.route('http://127.0.0.1:9001/**',route=>route.fulfill({status:200,body:'Sandbox checkout return'}));
  await page.goto(data.checkoutUrl,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#cardNumber').fill('4242424242424242',{timeout:25000});
  await page.locator('#cardExpiry').fill('1230');await page.locator('#cardCvc').fill('123');
  if(await page.locator('#billingName').count())await page.locator('#billingName').fill('Sandbox QA');
  if(await page.locator('#billingPostalCode').count())await page.locator('#billingPostalCode').fill('75001');
  const saveWithLink=page.getByRole('checkbox',{name:/Save my information/i});
  if(await saveWithLink.count())await saveWithLink.uncheck();
  const pay=page.locator('button[type="submit"]').last();await pay.click();
  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,1000));session=await stripe.checkout.sessions.retrieve(session.id);
    if(session.payment_status==='paid')break;
  }
  if(session.payment_status!=='paid'){
    fs.mkdirSync('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/stripe-sandbox-failure.png',fullPage:true});
    console.log('Hosted checkout state:',(await page.locator('body').innerText()).slice(-1800));
  }
  assert.equal(session.payment_status,'paid');console.log('PASS: hosted Stripe Checkout test card completed; session reports paid');
  let settled;
  for(let i=0;i<10;i++){
    const events=await stripe.events.list({type:'checkout.session.completed',limit:20});
    settled=events.data.find(e=>e.data.object.id===session.id);if(settled)break;await new Promise(r=>setTimeout(r,1000));
  }
  assert.ok(settled,'Stripe completion event must exist');
  const deliver=async event=>{
    const payload=JSON.stringify(event);const signature=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
    return webhook.POST(new Request('http://localhost/api/webhooks/stripe',{method:'POST',body:payload,headers:{'stripe-signature':signature}}));
  };
  const result=await deliver(settled);assert.equal(result.status,200,await result.text());
  await Promise.all([deliver(settled),deliver(settled)]);
  const piEvents=await stripe.events.list({type:'payment_intent.succeeded',limit:20});
  const pi=piEvents.data.find(e=>e.data.object.id===session.payment_intent);assert.ok(pi);assert.equal((await deliver(pi)).status,200);
  const paid=(await db.query('select * from manual_orders')).rows[0];
  assert.equal(paid.payment_status,'paid');assert.ok(paid.inventory_decremented_at);assert.ok(paid.paid_email_sent_at);
  assert.equal((await db.query('select inventory_quantity from products')).rows[0].inventory_quantity,9);
  const outbox=(await db.query('select provider_id,sent_at from stripe_email_outbox')).rows;assert.equal(outbox.length,2);
  const {Resend}=await import('resend');const resend=new Resend(process.env.RESEND_API_KEY);
  let receipts=[];for(let attempt=0;attempt<10;attempt++){
    receipts=[];for(const message of outbox){assert.ok(message.sent_at&&message.provider_id);const receipt=await resend.emails.get(message.provider_id);assert.ok(!receipt.error);receipts.push(receipt.data?.last_event);}
    if(receipts.every(event=>event==='delivered'))break;await new Promise(r=>setTimeout(r,2000));
  }
  console.log('PASS: signed actual Stripe event settled isolated order exactly once; duplicate and second settlement event leave inventory unchanged');
  console.log('EMAIL PROVIDER STATUS:',JSON.stringify(receipts));
  fs.mkdirSync('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/stripe-sandbox-completed.png'});
  fs.writeFileSync('output/stripe-sandbox-evidence.json',JSON.stringify({account:account.id,sessionId:session.id,eventId:settled.id,paymentIntentId:session.payment_intent,livemode:false,amountTotal:session.amount_total,orderStatus:paid.status,emailProviderEvents:receipts,duplicateDeliveries:3},null,2));
}finally{if(browser)await browser.close();await db.close();}
