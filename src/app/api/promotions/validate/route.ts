import { NextResponse } from 'next/server';
import { validatePromotionServerSide } from '@/lib/promotions/server';
import { lookupAffiliateByCode } from '@/lib/affiliates/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawCode = String(body.code ?? '').trim();
    const subtotalCents = Math.max(0, Math.round(Number(body.subtotalCents ?? 0)));
    const customerEmail = body.customerEmail ? String(body.customerEmail).trim().toLowerCase() : null;

    if (!rawCode) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Please enter a promo or partner code.',
      });
    }

    const supabase = createAdminClient();

    // 1. Check database/configured promotions first
    const promoResult = await validatePromotionServerSide(
      rawCode,
      subtotalCents,
      customerEmail,
      supabase
    );

    if (promoResult.valid && promoResult.code) {
      return NextResponse.json({
        success: true,
        valid: true,
        code: promoResult.code,
        name: promoResult.name,
        description: promoResult.description,
        discountType: promoResult.discountType,
        discountRateBps: promoResult.discountRateBps,
        fixedDiscountCents: promoResult.fixedDiscountCents,
        discountCents: promoResult.discountCents,
        firstOrderOnly: promoResult.firstOrderOnly,
        isAffiliate: false,
      });
    }

    // If promo failed with a specific error (e.g. first-order restriction or subtotal minimum), return that error
    if (!promoResult.valid && promoResult.error && promoResult.error !== 'This promo code is currently inactive.') {
      return NextResponse.json({
        success: true,
        valid: false,
        code: rawCode.toUpperCase(),
        error: promoResult.error,
      });
    }

    // 2. Check partner / affiliate codes as customer discount
    const partner = await lookupAffiliateByCode(rawCode);
    if (partner && partner.status === 'active') {
      const discountRateBps = partner.customerDiscountBps || 1000; // default 10%
      const discountCents = Math.round(subtotalCents * (discountRateBps / 10000));

      return NextResponse.json({
        success: true,
        valid: true,
        code: partner.code.toUpperCase(),
        name: `${partner.name} Partner Discount`,
        description: `Official referral discount from ${partner.name}`,
        discountType: 'percentage',
        discountRateBps,
        fixedDiscountCents: 0,
        discountCents,
        firstOrderOnly: false,
        isAffiliate: true,
        affiliateCode: partner.code.toUpperCase(),
      });
    }

    return NextResponse.json({
      success: true,
      valid: false,
      code: rawCode.toUpperCase(),
      error: promoResult.error || 'Invalid promotional or partner code.',
    });
  } catch (error: any) {
    console.error('[api/promotions/validate] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
