import { NextResponse } from 'next/server';
import { requireAdminActor, verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAudit } from '@/lib/admin/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const actor = (await requireAdminActor()) || 'admin';
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const { data: before, error: findErr } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (findErr || !before) {
      return NextResponse.json({ success: false, error: 'Promotion not found' }, { status: 404 });
    }

    const body = await req.json();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.enabled === 'boolean') updatePayload.enabled = body.enabled;
    if (typeof body.banner_enabled === 'boolean') {
      updatePayload.banner_enabled = body.banner_enabled;
      // If enabling banner for this promotion, disable banner on all other promotions
      if (body.banner_enabled === true) {
        await supabase.from('promotions').update({ banner_enabled: false }).neq('id', params.id);
      }
    }
    if (typeof body.first_order_only === 'boolean') updatePayload.first_order_only = body.first_order_only;
    if (body.banner_message !== undefined) updatePayload.banner_message = body.banner_message ? String(body.banner_message).trim() : null;
    if (body.banner_cta !== undefined) updatePayload.banner_cta = body.banner_cta ? String(body.banner_cta).trim() : null;
    if (body.name !== undefined) updatePayload.name = String(body.name).trim();
    if (body.description !== undefined) updatePayload.description = body.description ? String(body.description).trim() : null;
    if (body.discount_type !== undefined) updatePayload.discount_type = body.discount_type === 'fixed_amount' ? 'fixed_amount' : 'percentage';
    if (body.discount_rate_bps !== undefined) updatePayload.discount_rate_bps = Math.max(0, Math.min(10000, Number(body.discount_rate_bps)));
    if (body.fixed_discount_cents !== undefined) updatePayload.fixed_discount_cents = Math.max(0, Math.round(Number(body.fixed_discount_cents)));
    if (body.minimum_subtotal_cents !== undefined) updatePayload.minimum_subtotal_cents = Math.max(0, Math.round(Number(body.minimum_subtotal_cents)));
    if (body.starts_at !== undefined) updatePayload.starts_at = body.starts_at || null;
    if (body.ends_at !== undefined) updatePayload.ends_at = body.ends_at || null;
    if (body.max_total_uses !== undefined) updatePayload.max_total_uses = body.max_total_uses ? Number(body.max_total_uses) : null;
    if (body.affiliate_stack_policy !== undefined) updatePayload.affiliate_stack_policy = body.affiliate_stack_policy;
    if (body.affiliate_commission_override_bps !== undefined) {
      updatePayload.affiliate_commission_override_bps = body.affiliate_commission_override_bps
        ? Number(body.affiliate_commission_override_bps)
        : null;
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updatePayload)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logAdminAudit({
      actor,
      action: 'PROMOTION_UPDATE',
      entityType: 'promotion',
      entityId: params.id,
      before,
      after: data,
    });

    return NextResponse.json({ success: true, promotion: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const actor = (await requireAdminActor()) || 'admin';
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const { data: before } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!before) {
    return NextResponse.json({ success: false, error: 'Promotion not found' }, { status: 404 });
  }

  const { error } = await supabase.from('promotions').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await logAdminAudit({
    actor,
    action: 'PROMOTION_DELETE',
    entityType: 'promotion',
    entityId: params.id,
    before,
    after: null,
  });

  return NextResponse.json({ success: true });
}
