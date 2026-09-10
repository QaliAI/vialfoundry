import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  computeDashboardMetrics,
  computePendingCommissionCents,
  revenueByDay,
  revenueByPaymentMethod,
} from '@/lib/admin/metrics.mjs';
import { PRODUCTS } from '@/data/products';

/**
 * Everything the operator needs on opening /admin, in one request.
 * Every number is measured from real rows; nothing is estimated or seeded.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOW_STOCK_THRESHOLD = 25;

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const [ordersRes, inquiriesRes, applicationsRes] = await Promise.all([
    supabase
      .from('manual_orders')
      .select(
        'id, order_number, status, payment_status, payment_provider, preferred_payment_method, total_amount, amount_refunded, paid_at, shipped_at, created_at, customer_name, customer_email, is_test, archived_at, affiliate_status, affiliate_commission_amount, affiliate_code',
      )
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('contact_requests')
      .select('id, name, email, institution, subject, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('affiliate_applications')
      .select('id, name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const orders = ordersRes.data || [];

  const metrics = computeDashboardMetrics(orders);
  const pendingCommissionCents = computePendingCommissionCents(orders);

  // Needs-action queue: paid but unfulfilled, oldest first.
  const needsAction = orders
    .filter((o) => !o.is_test && !o.archived_at)
    .filter(
      (o) =>
        ['paid', 'preparing', 'packed'].includes(o.status) &&
        ['paid', 'partially_refunded'].includes(o.payment_status),
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 10);

  const lowStock = PRODUCTS.filter((p) => p.inStock && p.stockCount <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stockCount - b.stockCount)
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.displayName || p.name,
      stockCount: p.stockCount,
    }));

  const outOfStock = PRODUCTS.filter((p) => !p.inStock || p.stockCount <= 0).map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.displayName || p.name,
  }));

  return NextResponse.json({
    success: true,
    metrics: { ...metrics, pendingCommissionCents },
    revenueByDay: revenueByDay(orders, 14),
    revenueByPaymentMethod: revenueByPaymentMethod(orders),
    recentOrders: orders.filter((o) => !o.archived_at).slice(0, 10),
    needsAction,
    lowStock,
    outOfStock,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    inquiries: inquiriesRes.data || [],
    affiliateApplications: applicationsRes.data || [],
    // Surfaced so the UI can be honest about which panels have no data source.
    dataIssues: {
      orders: ordersRes.error?.message || null,
      inquiries: inquiriesRes.error?.message || null,
      affiliateApplications: applicationsRes.error?.message || null,
    },
  });
}
