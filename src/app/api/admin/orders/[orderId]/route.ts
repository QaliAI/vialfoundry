import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchOrderEvents } from '@/lib/admin/order-events';

/**
 * Full operational detail for one order: everything an operator needs to
 * answer a customer question or a payment dispute, in one request.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { orderId: string } }) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  // Accept either the UUID or the human order number.
  const key = params.orderId;
  const byNumber = key.startsWith('VF-');
  const { data: order, error } = await supabase
    .from('manual_orders')
    .select('*')
    .eq(byNumber ? 'order_number' : 'id', key)
    .maybeSingle();

  if (error) {
    console.error('[admin/orders/detail] lookup failed:', error.message);
    return NextResponse.json({ success: false, error: 'Lookup failed' }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  const [{ data: items }, events] = await Promise.all([
    supabase
      .from('manual_order_items')
      .select('*')
      .eq('manual_order_id', order.id)
      .order('created_at', { ascending: true }),
    fetchOrderEvents(order.id),
  ]);

  return NextResponse.json({
    success: true,
    order,
    items: items || [],
    events,
  });
}
