import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../src/data/products.ts';
import { loadTSModule } from './fixtures/load-ts-module.mjs';
import { isolatedCommerce } from './fixtures/isolated-commerce.mjs';
import { vialFoundryBrandConfig as brand } from '../src/config/brand.ts';
import { calculateShipping } from '../src/lib/manual-orders/shipping.mjs';

export function checkoutRequest(product,overrides={}) {
  return {submissionKey:crypto.randomUUID(),customerEmail:'qa@example.invalid',customerName:'QA Fixture',ruoAgreed:true,
    preferredPaymentMethod:'card',promoCode:'WELCOME10',shippingMethodId:'standard',
    shippingAddress:{firstName:'QA',lastName:'Fixture',address:'123 Test St',city:'Test',state:'TX',zip:'75001',email:'qa@example.invalid'},
    items:[{productId:product.id,productName:product.name,quantity:1}],...overrides};
}
test('actual checkout route enforces totals, first-order eligibility, persistence and aggregate stock',async()=>{
  const {db,client}=await isolatedCommerce();
  const original={...process.env};Object.assign(process.env,{PAYMENT_GATEWAY_TYPE:'stripe',STRIPE_SECRET_KEY:'sk_test_fixture',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',VERCEL_ENV:'production'});
  // The adapter is a boundary replacement here; the sandbox runner uses it live.
  const product=PRODUCTS.find(p=>p.purchasable!==false&&p.catalogStatus==='public'&&p.stockCount>=10);
  await db.query('INSERT INTO products(id,inventory_quantity) VALUES($1,3)',[product.id]);
  let savedInput;let stripeCalls=0;let selectedClient=client;
  const {POST}=loadTSModule('src/app/api/checkout/route.ts',{
    'src/lib/supabase/admin.ts':{createAdminClient:()=>selectedClient},
    'src/lib/supabase/operational.mjs':{isSupabaseOperational:()=>true,isProductionRuntime:()=>true},
    'src/lib/adapters/stripe-gating.mjs':{isStripeEnabled:()=>true,stripeSecretMode:()=> 'live'},
    'src/lib/adapters/stripeAdapter.ts':{StripePaymentAdapter:class {async createOrderCheckoutSession(input){stripeCalls++;savedInput=input;return {sessionId:'cs_test_'+input.orderId,url:'https://checkout.stripe.com/test',amountTotal:input.invoice.total_amount};}}},
  });
  const submit=async body=>{const response=await POST(new Request('http://localhost/api/checkout',{method:'POST',body:JSON.stringify(body)}));return {status:response.status,body:await response.json()};};
  try {
    const request=checkoutRequest(product,{preferredPaymentMethod:'cashapp',isTest:true});
    const response=await submit(request);assert.equal(response.status,200);
    const price=Math.round(product.price*100);const discount=Math.round(price*0.1);
    const shipping=calculateShipping(price,'standard',brand.shippingOptions).amountCents;
    assert.equal(savedInput.invoice.discount_amount,discount);assert.equal(savedInput.invoice.total_amount,price-discount+shipping);
    const order=(await db.query('select * from manual_orders')).rows[0];assert.equal(order.is_test,false);assert.equal(order.payment_status,'unpaid');
    assert.equal(Number((await db.query('select count(*) n from manual_order_items')).rows[0].n),1);
    assert.equal((await submit(request)).status,409);assert.equal(stripeCalls,1);
    const excessive=checkoutRequest(product,{items:[{productId:product.id,productName:product.name,quantity:2},{productId:product.id,productName:product.name,quantity:2}]});
    assert.equal((await submit(excessive)).status,400);assert.equal(stripeCalls,1);
    await db.query("update manual_orders set payment_status='paid' where id=$1",[order.id]);
    assert.equal((await submit(checkoutRequest(product))).status,400);assert.equal(stripeCalls,1);
    selectedClient=null;assert.equal((await submit(checkoutRequest(product,{promoCode:null}))).status,503);
  } finally {await db.close();for(const k of Object.keys(process.env))if(!(k in original))delete process.env[k];Object.assign(process.env,original);}
});
