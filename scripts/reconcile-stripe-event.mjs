#!/usr/bin/env node
// Controlled replay through the same verified webhook. Dry-run by default.
// Never modifies payments, re-charges a card or directly edits order/stock rows.
import Stripe from 'stripe';
import { spawnSync } from 'node:child_process';
import { stripeSecretMode } from '../src/lib/adapters/stripe-gating.mjs';
const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
const id=arg('--event');const endpoint=arg('--endpoint');
if(!/^evt_[A-Za-z0-9_]+$/.test(id||''))throw Error('--event evt_... is required');
const mode=stripeSecretMode();if(!mode)throw Error('Explicit STRIPE_SECRET_KEY required');
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
const account=await stripe.accounts.retrieve();
if(account.id!==(mode==='live'?'acct_1UEGKt1aZD5Fnc5X':'acct_1UEGL21yrb0MJg1w'))throw Error('REFUSED: expected VialFoundry merchant or sandbox');
const event=await stripe.events.retrieve(id);
if(event.livemode!==(mode==='live'))throw Error('Event/key mode mismatch');
console.log(JSON.stringify({eventId:event.id,type:event.type,mode,action:process.argv.includes('--apply')?'retry_via_verified_endpoint':'dry_run'}));
if(process.argv.includes('--apply')){
  const url=new URL(endpoint||'');
  if(url.protocol!=='https:' || url.pathname!=='/api/webhooks/stripe')throw Error('Explicit HTTPS webhook endpoint required');
  if(mode==='live'&&url.hostname!=='www.vialfoundry.com')throw Error('Live events may only reach Vial Foundry production');
  if(mode==='test'&&['www.vialfoundry.com','vialfoundry.com'].includes(url.hostname))throw Error('Test events must never target production');
  const webhookEndpoint=arg('--webhook-endpoint');
  if(!/^we_[A-Za-z0-9]+$/.test(webhookEndpoint||''))throw Error('--webhook-endpoint we_... is required');
  const registered=await stripe.webhookEndpoints.retrieve(webhookEndpoint);
  if(registered.url!==url.href || registered.status!=='enabled')throw Error('Registered enabled endpoint must match');
  // Ask Stripe itself to resend; its signing secret never leaves Stripe.
  const args=['events','resend',id,'--webhook-endpoint',webhookEndpoint,'--confirm',...(mode==='live'?['--live']:[])];
  const response=spawnSync('stripe',args,{env:{...process.env,STRIPE_API_KEY:process.env.STRIPE_SECRET_KEY},encoding:'utf8'});
  if(response.status!==0)throw Error('Stripe CLI resend failed; verify CLI authentication and endpoint access');
  console.log('Replay requested. Verify receipt result, outbox delivery and processing health; legacy/ambiguous records remain held.');
}
