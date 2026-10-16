import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { sqlClient } from './sql-client.mjs';
export async function isolatedCommerce() {
  const db=new PGlite();
  await db.exec(fs.readFileSync('tests/fixtures/stripe-settlement-schema.sql','utf8'));
  for(const name of ['05_commerce_core.sql','06_stripe_commerce.sql','07_stripe_lifecycle.sql'])await db.exec(fs.readFileSync('supabase/migrations/'+name,'utf8'));
  await db.exec(fs.readFileSync('supabase/migrations/20261016231001_stripe_atomic_settlement.sql','utf8'));
  // Checkout attribution columns from migration 10; no customer data is copied.
  for(const col of ['first_touch_source','first_touch_medium','first_touch_campaign','first_touch_content','first_touch_term','last_touch_source','last_touch_medium','last_touch_campaign','last_touch_content','last_touch_term','landing_page','referrer_url'])
    await db.exec(`ALTER TABLE manual_orders ADD COLUMN ${col} text`);
  await db.exec('ALTER TABLE manual_orders ADD COLUMN customer_affiliate_discount_amount integer');
  await db.exec('DROP TABLE promotions');
  const promotionDDL=fs.readFileSync('supabase/migrations/10_growth_promotions_affiliates_crm.sql','utf8').match(/CREATE TABLE IF NOT EXISTS public.promotions \([\s\S]*?\n\);/)[0];
  await db.exec(promotionDDL);
  await db.exec("INSERT INTO promotions(code,name,discount_rate_bps,first_order_only) VALUES('WELCOME10','Welcome',1000,true)");
  return {db,client:sqlClient(db)};
}
