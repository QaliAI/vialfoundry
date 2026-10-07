import React from 'react';
import { verifyAdminSession, requireAdminActor } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { EmailCenterClient } from './email-center-client';

export const dynamic = 'force-dynamic';

export default async function AdminEmailCenterPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const actorEmail = (await requireAdminActor()) || 'owner@vialfoundry.com';
  const supabase = createAdminClient();

  let subscribersCount = 0;
  let campaigns: any[] = [];
  let firstOrderCustomerCount = 0;
  let repeatCustomerCount = 0;

  if (supabase) {
    const [subsRes, campsRes, ordersRes] = await Promise.all([
      supabase
        .from('email_subscribers')
        .select('id, marketing_opt_in, unsubscribed_at')
        .eq('marketing_opt_in', true)
        .is('unsubscribed_at', null),
      supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('manual_orders')
        .select('customer_email, payment_status, is_test')
        .eq('payment_status', 'paid')
        .eq('is_test', false),
    ]);

    subscribersCount = subsRes.data?.length || 0;
    campaigns = campsRes.data || [];

    const orderCounts = new Map<string, number>();
    for (const o of ordersRes.data || []) {
      const em = (o.customer_email || '').toLowerCase().trim();
      if (em) orderCounts.set(em, (orderCounts.get(em) || 0) + 1);
    }

    for (const count of orderCounts.values()) {
      if (count > 1) {
        repeatCustomerCount++;
      } else {
        firstOrderCustomerCount++;
      }
    }
  }

  return (
    <EmailCenterClient
      adminEmail={actorEmail}
      audienceCounts={{
        marketing_subscribers: subscribersCount,
        first_time_buyers: firstOrderCustomerCount,
        repeat_customers: repeatCustomerCount,
      }}
      campaigns={campaigns}
    />
  );
}
