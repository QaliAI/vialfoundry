import { NextResponse } from 'next/server';
import { requireAdminActor, verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAudit } from '@/lib/admin/audit';

/**
 * Contact and bulk-order enquiries.
 *
 * Deliberately not a CRM — the only job here is that a lead is impossible to
 * lose: list them, and move one through new -> open -> responded -> closed.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'open', 'responded', 'closed'] as const;

export async function GET(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const status = new URL(req.url).searchParams.get('status');

  let contacts = supabase
    .from('contact_requests')
    .select('id, name, email, institution, subject, message, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && (STATUSES as readonly string[]).includes(status)) {
    contacts = contacts.eq('status', status);
  }

  const [contactRes, restockRes] = await Promise.all([
    contacts,
    supabase
      .from('restock_requests')
      .select('id, email, product_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  return NextResponse.json({
    success: true,
    inquiries: (contactRes.data || []).map((c: any) => ({ ...c, source: 'contact' })),
    restockRequests: restockRes.data || [],
    error: contactRes.error?.message || null,
  });
}

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const actor = (await requireAdminActor()) || 'admin';

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  if (!body.id || !body.status || !(STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json(
      { success: false, error: `status must be one of ${STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const { error } = await supabase
    .from('contact_requests')
    .update({ status: body.status })
    .eq('id', body.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await logAdminAudit({
    actor,
    action: 'INQUIRY_STATUS_UPDATE',
    entityType: 'contact_request',
    entityId: body.id,
    after: { status: body.status },
  });

  return NextResponse.json({ success: true });
}
