import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  computeDashboardMetrics,
  computePendingCommissionCents,
  revenueByDay,
  revenueByPaymentMethod,
  topProducts,
  isCountableOrder,
} from '@/lib/admin/metrics.mjs';

/**
 * Finance + reporting.
 *
 * Reports what we have actually collected, from our own synchronized records.
 * It does not try to replace Stripe's accounting reports, and it reports no
 * profit figure because there is no cost-of-goods data in the database.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const days = Math.min(365, Math.max(7, Number(new URL(req.url).searchParams.get('days')) || 30));

  const { data: orders, error } = await supabase
    .from('manual_orders')
    .select(
      'id, order_number, status, payment_status, payment_provider, preferred_payment_method, total_amount, amount_refunded, subtotal_amount, discount_amount, shipping_amount, promo_code, paid_at, shipped_at, created_at, customer_email, is_test, archived_at, affiliate_status, affiliate_code, affiliate_commission_amount',
    )
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const rows = orders || [];
  const countable = rows.filter(isCountableOrder);
  const paidIds = countable
    .filter((o: any) => ['paid', 'partially_refunded'].includes(o.payment_status))
    .map((o: any) => o.id);

  // Line items only for paid orders, for the top-products report.
  const itemsByOrderId: Record<string, any[]> = {};
  if (paidIds.length > 0) {
    const { data: items } = await supabase
      .from('manual_order_items')
      .select('manual_order_id, product_name, sku, quantity, line_total_amount')
      .in('manual_order_id', paidIds.slice(0, 1000));
    for (const it of items || []) {
      (itemsByOrderId[(it as any).manual_order_id] ||= []).push(it);
    }
  }

  const metrics = computeDashboardMetrics(rows);

  // Promo usage across paid orders.
  const promo = new Map<string, { code: string; orders: number; revenueCents: number; discountCents: number }>();
  for (const o of countable as any[]) {
    if (!o.promo_code || !['paid', 'partially_refunded'].includes(o.payment_status)) continue;
    const cur = promo.get(o.promo_code) || { code: o.promo_code, orders: 0, revenueCents: 0, discountCents: 0 };
    cur.orders += 1;
    cur.revenueCents += (o.total_amount || 0) - (o.amount_refunded || 0);
    cur.discountCents += o.discount_amount || 0;
    promo.set(o.promo_code, cur);
  }

  // Affiliate-attributed revenue.
  const affiliate = new Map<string, { code: string; orders: number; revenueCents: number; commissionCents: number }>();
  for (const o of countable as any[]) {
    if (!o.affiliate_code || !['paid', 'partially_refunded'].includes(o.payment_status)) continue;
    const cur = affiliate.get(o.affiliate_code) || { code: o.affiliate_code, orders: 0, revenueCents: 0, commissionCents: 0 };
    cur.orders += 1;
    cur.revenueCents += (o.total_amount || 0) - (o.amount_refunded || 0);
    if (o.affiliate_status !== 'reversed') cur.commissionCents += o.affiliate_commission_amount || 0;
    affiliate.set(o.affiliate_code, cur);
  }

  // New vs returning, by email across paid orders.
  const seen = new Map<string, number>();
  for (const o of countable as any[]) {
    if (!['paid', 'partially_refunded'].includes(o.payment_status)) continue;
    const key = String(o.customer_email || '').toLowerCase();
    if (key) seen.set(key, (seen.get(key) || 0) + 1);
  }
  const returningCustomers = Array.from(seen.values()).filter((n) => n > 1).length;

  return NextResponse.json({
    success: true,
    metrics: { ...metrics, pendingCommissionCents: computePendingCommissionCents(rows) },
    revenueByDay: revenueByDay(rows, days),
    revenueByPaymentMethod: revenueByPaymentMethod(rows),
    topProducts: topProducts(rows, itemsByOrderId, 10),
    promoUsage: Array.from(promo.values()).sort((a, b) => b.revenueCents - a.revenueCents),
    affiliateRevenue: Array.from(affiliate.values()).sort((a, b) => b.revenueCents - a.revenueCents),
    customers: {
      uniquePaying: seen.size,
      returning: returningCustomers,
      new: seen.size - returningCustomers,
    },
    // Stated explicitly so nobody mistakes revenue for profit.
    notes: {
      cogs: 'No cost-of-goods data exists in the database, so no profit or margin figure is reported.',
      source: 'Figures come from Vial Foundry order records synchronized from Stripe webhooks, not from Stripe reporting.',
    },
  });
}
