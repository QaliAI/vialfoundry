import React from 'react';
import { redirect } from 'next/navigation';
import { getAffiliateSession } from '@/lib/affiliates/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { AffiliatePortalClient } from './portal-client';

export const dynamic = 'force-dynamic';

export default async function AffiliatePortalPage() {
  const session = await getAffiliateSession();
  if (!session) {
    redirect('/affiliates/login');
  }

  const supabase = createAdminClient();
  let affiliateData: any = null;
  let revenueRows: any[] = [];

  if (supabase) {
    const { data: aff } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', session.affiliateId)
      .maybeSingle();

    affiliateData = aff;

    if (aff?.id) {
      // ZERO PII: query referral_revenue table only
      const { data: orders } = await supabase
        .from('referral_revenue')
        .select('id, order_number, created_at, product_subtotal_cents, commission_rate_bps, commission_amount_cents, status')
        .eq('affiliate_id', aff.id)
        .order('created_at', { ascending: false })
        .limit(50);

      revenueRows = orders || [];
    }
  }

  if (!affiliateData) {
    // If not found in DB, use session snapshot
    affiliateData = {
      id: session.affiliateId,
      name: session.name,
      email: session.email,
      referral_code: session.code,
      status: 'active',
      commission_rate_bps: 1000,
      customer_discount_bps: 1000,
      total_clicks_count: 0,
      total_orders_count: 0,
      lifetime_earnings_cents: 0,
      pending_commission_cents: 0,
      paid_commission_cents: 0,
      payout_method: 'ACH / Wire',
    };
  }

  return (
    <AffiliatePortalClient
      partner={{
        id: affiliateData.id,
        name: affiliateData.name,
        email: affiliateData.email,
        code: affiliateData.referral_code || affiliateData.code || session.code,
        status: affiliateData.status || 'active',
        commissionRateBps: affiliateData.commission_rate_bps || 1000,
        customerDiscountBps: affiliateData.customer_discount_bps || 1000,
        payoutMethod: affiliateData.payout_method || 'Configured via Admin',
      }}
      metrics={{
        clicksCount: affiliateData.total_clicks_count || 0,
        ordersCount: affiliateData.total_orders_count || revenueRows.length,
        lifetimeEarningsCents: affiliateData.lifetime_earnings_cents || 0,
        pendingCommissionCents: affiliateData.pending_commission_cents || 0,
        paidCommissionCents: affiliateData.paid_commission_cents || 0,
      }}
      orders={revenueRows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        createdAt: r.created_at,
        subtotalCents: r.product_subtotal_cents || 0,
        commissionRateBps: r.commission_rate_bps || 1000,
        commissionCents: r.commission_amount_cents || 0,
        status: r.status || 'pending_payment',
      }))}
    />
  );
}
