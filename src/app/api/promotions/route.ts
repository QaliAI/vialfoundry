import { NextResponse } from 'next/server';
import { getActiveBannerCampaign, getAllPromotions } from '@/lib/promotions/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const [banner, all] = await Promise.all([
      getActiveBannerCampaign(supabase),
      getAllPromotions(supabase),
    ]);

    // Filter to active public promos, excluding internal codes or inactive ones
    const publicPromotions = all
      .filter((p) => p.enabled)
      .map((p) => ({
        code: p.code,
        name: p.name,
        description: p.description,
        discountType: p.discount_type,
        discountRateBps: p.discount_rate_bps,
        fixedDiscountCents: p.fixed_discount_cents,
        minSubtotalCents: p.minimum_subtotal_cents,
        firstOrderOnly: p.first_order_only,
        endsAt: p.ends_at,
      }));

    return NextResponse.json({
      success: true,
      banner,
      promotions: publicPromotions,
    });
  } catch (error: any) {
    console.error('[api/promotions] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
