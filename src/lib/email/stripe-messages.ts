import { getBrandConfig } from '../../config/brand';
import { renderOrderConfirmationEmail } from './templates/order';
import { renderInternalOrderNotificationEmail } from './templates/internal-order';
import { renderRefundConfirmationEmail } from './templates/refund';

/** Render once from the transaction's immutable snapshot; persist before send. */
export async function renderStripeMessage(job: any) {
  const { order, items: lines } = job.snapshot;
  const brand = getBrandConfig();
  const owner = job.kind.endsWith('_owner');
  const to = owner ? brand.orderNotificationEmails : order.customer_email;
  if (!to || (Array.isArray(to) && to.length === 0)) throw new Error('notification_recipient_missing');
  if (job.kind.startsWith('refund_')) {
    const fullyRefunded = job.revision >= order.total_amount;
    const refund = renderRefundConfirmationEmail({
      orderNumber: order.order_number, customerName: order.customer_name,
      refundedCents: job.revision, fullyRefunded,
    });
    return { to, subject: `[Vial Foundry] ${fullyRefunded ? 'Refund issued' : 'Partial refund issued'} — order ${order.order_number}`, html: refund.html };
  }
  const shared = {
    orderNumber: order.order_number, customerName: order.customer_name,
    items: (lines || []).map((line: any) => ({ name: line.product_name, sku: line.sku,
      quantity: line.quantity, unitPriceCents: line.unit_price_amount, lineTotalCents: line.line_total_amount })),
    subtotalCents: order.subtotal_amount + order.discount_amount,
    discountCents: order.discount_amount, shippingCents: order.shipping_amount,
    totalCents: order.total_amount, shippingAddress: order.shipping_address_snapshot,
  };
  const fulfillmentNextStep = order.status === 'waiting_inventory'
    ? 'WAITING ON INVENTORY: Replenishment required before packing.'
    : 'PAID — READY TO PICK AND PACK. Verify items and generate shipping label.';
  const content = owner ? renderInternalOrderNotificationEmail({
    ...shared, customerEmail: order.customer_email, customerPhone: order.customer_phone,
    paymentMethod: 'card (Stripe)', paymentStatus: 'paid', fulfillmentNextStep,
    promoCode: order.promo_code, affiliateCode: order.affiliate_code,
    isTest: order.is_test || order.stripe_livemode === false,
    adminOrderUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vialfoundry.com').replace(/\/$/,'')}/admin/orders?order=${encodeURIComponent(order.order_number)}`,
  }) : renderOrderConfirmationEmail({ ...shared, paymentMethod: 'card', paymentState: 'paid' });
  return { to, subject: owner
    ? `${order.is_test || order.stripe_livemode === false ? '[TEST] ' : ''}[PAID] ${order.order_number}`
    : `[Vial Foundry] Payment received — order ${order.order_number}`, html: content.html };
}
