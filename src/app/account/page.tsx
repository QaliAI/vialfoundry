import React from 'react';
import type { Metadata } from 'next';
import { getCustomerSession } from '@/lib/customer/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerAccountClient } from './account-client';
import { CustomerLoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Research Account & Orders — Vial Foundry',
  description: 'View past research material orders, shipping tracking, and fast reorder.',
};

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    return <CustomerLoginForm />;
  }

  const supabase = createAdminClient();
  let orders: any[] = [];
  let customerProfile: any = null;
  let isSubscribed = true;

  if (supabase) {
    const cleanEmail = session.email.toLowerCase().trim();

    const [ordersRes, custRes, subRes] = await Promise.all([
      supabase
        .from('manual_orders')
        .select('*, manual_order_items(*)')
        .ilike('customer_email', cleanEmail)
        .order('created_at', { ascending: false }),
      supabase
        .from('customers')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle(),
      supabase
        .from('email_subscribers')
        .select('marketing_opt_in, unsubscribed_at')
        .ilike('email', cleanEmail)
        .maybeSingle(),
    ]);

    orders = ordersRes.data || [];
    customerProfile = custRes.data;
    if (subRes.data) {
      isSubscribed = subRes.data.marketing_opt_in && !subRes.data.unsubscribed_at;
    }
  }

  return (
    <CustomerAccountClient
      sessionEmail={session.email}
      profile={customerProfile}
      isMarketingSubscribed={isSubscribed}
      orders={orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: o.total_amount || 0,
        subtotalAmount: o.subtotal_amount || 0,
        shippingAmount: o.shipping_amount || 0,
        discountAmount: o.discount_amount || 0,
        trackingNumber: o.tracking_number,
        trackingUrl: o.tracking_url,
        shippingCarrier: o.shipping_carrier,
        items: (o.manual_order_items || []).map((i: any) => ({
          productId: i.product_id,
          productName: i.product_name,
          configurationLabel: i.configuration_label,
          sku: i.sku,
          quantity: i.quantity,
          unitPriceAmount: i.unit_price_amount,
          lineTotalAmount: i.line_total_amount,
        })),
      }))}
    />
  );
}
