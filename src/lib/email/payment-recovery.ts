import { createAdminClient } from '../supabase/admin';
import { sendEmailSafely } from './resend';
import { renderOrderConfirmationEmail } from './templates/order';
import { recordOrderEvent } from '../admin/order-events';

export interface PaymentReminderResult {
  success: boolean;
  error?: string;
  orderNumber?: string;
}

/**
 * Sends a courteous, authoritative payment instructions reminder for unpaid orders.
 *
 * Safeguards:
 * - Order must be unpaid (payment_status !== 'paid' and status !== 'canceled').
 * - Rate limited: at least 24 hours between reminders.
 * - Maximum 2 reminders per order lifetime.
 * - Keeps analytical, professional tone.
 */
export async function sendPaymentReminder(
  orderIdOrNumber: string,
  supabase = createAdminClient()
): Promise<PaymentReminderResult> {
  if (!supabase) {
    return { success: false, error: 'Database service unavailable' };
  }

  try {
    const { data: order, error } = await supabase
      .from('manual_orders')
      .select('*, manual_order_items(*)')
      .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`)
      .maybeSingle();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.payment_status === 'paid' || order.status === 'canceled') {
      return { success: false, error: `Order is already ${order.payment_status || order.status}.` };
    }

    // Rate-limiting check: at least 24 hours since last reminder
    const now = new Date();
    if (order.payment_recovery_email_sent_at) {
      const lastSent = new Date(order.payment_recovery_email_sent_at);
      const hoursSince = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return {
          success: false,
          error: `A reminder was already sent ${Math.round(hoursSince)} hours ago. Minimum interval is 24 hours.`,
        };
      }
    }

    // Check maximum 2 reminders guard via order_events
    const { data: pastReminders } = await supabase
      .from('order_events')
      .select('id')
      .eq('order_id', order.id)
      .eq('type', 'payment_reminder_sent');

    if (pastReminders && pastReminders.length >= 2) {
      return {
        success: false,
        error: 'Maximum 2 reminders reached for this order to prevent customer harassment.',
      };
    }

    // Render email using existing authoritative order template with awaiting_payment state
    const items = (order.manual_order_items || []).map((i: any) => ({
      name: i.product_name,
      quantity: i.quantity,
      unitPriceCents: i.unit_price_amount,
      lineTotalCents: i.line_total_amount,
    }));

    const { html } = renderOrderConfirmationEmail({
      orderNumber: order.order_number,
      customerName: order.customer_name || 'Researcher',
      items,
      subtotalCents: order.subtotal_amount || 0,
      discountCents: order.discount_amount || 0,
      shippingCents: order.shipping_amount || 0,
      totalCents: order.total_amount || 0,
      paymentMethod: order.preferred_payment_method || 'manual_invoice',
      shippingAddress: (order.shipping_address_snapshot as Record<string, string>) || {},
      paymentState: 'awaiting_payment',
    });

    const sendRes = await sendEmailSafely({
      to: order.customer_email,
      subject: `Payment Instructions Reminder — Vial Foundry Order ${order.order_number}`,
      html,
    });

    if (!sendRes.success) {
      return { success: false, error: sendRes.error || 'Email dispatch failed.' };
    }

    // Update timestamp
    await supabase
      .from('manual_orders')
      .update({ payment_recovery_email_sent_at: now.toISOString() })
      .eq('id', order.id);

    // Record audit event
    await recordOrderEvent({
      orderId: order.id,
      type: 'email_sent',
      actor: 'admin',
      message: `Payment reminder sent to ${order.customer_email} for order ${order.order_number}`,
      metadata: {
        template: 'payment_reminder',
        method: order.preferred_payment_method,
        total_cents: order.total_amount,
        reminder_number: (pastReminders?.length || 0) + 1,
      },
    });

    return { success: true, orderNumber: order.order_number };
  } catch (err: any) {
    console.error('[payment-recovery] Error:', err);
    return { success: false, error: err.message };
  }
}
