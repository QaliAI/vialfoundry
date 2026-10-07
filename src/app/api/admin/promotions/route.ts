import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAllPromotions } from '@/lib/promotions/server';
import { normalizePromoCode } from '@/lib/promotions/promotions.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const promotions = await getAllPromotions(supabase);

  return NextResponse.json({
    success: true,
    promotions,
  });
}

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const code = normalizePromoCode(body.code);
    if (!code) {
      return NextResponse.json({ success: false, error: 'Promo code is required.' }, { status: 400 });
    }

    const payload = {
      code,
      name: String(body.name || code).trim(),
      description: body.description ? String(body.description).trim() : null,
      discount_type: body.discount_type === 'fixed_amount' ? 'fixed_amount' : 'percentage',
      discount_rate_bps: Math.max(0, Math.min(10000, Number(body.discount_rate_bps || 0))),
      fixed_discount_cents: Math.max(0, Math.round(Number(body.fixed_discount_cents || 0))),
      minimum_subtotal_cents: Math.max(0, Math.round(Number(body.minimum_subtotal_cents || 0))),
      first_order_only: Boolean(body.first_order_only),
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      enabled: body.enabled !== false,
      max_total_uses: body.max_total_uses ? Number(body.max_total_uses) : null,
      max_uses_per_customer: body.max_uses_per_customer ? Number(body.max_uses_per_customer) : 1,
      banner_enabled: Boolean(body.banner_enabled),
      banner_message: body.banner_message ? String(body.banner_message).trim() : null,
      banner_cta: body.banner_cta ? String(body.banner_cta).trim() : null,
      affiliate_stack_policy: body.affiliate_stack_policy === 'allow_override' ? 'allow_override' : 'exclusive',
      affiliate_commission_override_bps: body.affiliate_commission_override_bps
        ? Number(body.affiliate_commission_override_bps)
        : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('promotions')
      .upsert(payload, { onConflict: 'code' })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      promotion: data,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
