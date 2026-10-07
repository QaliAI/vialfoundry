import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || '').trim();
    const email = String(body.email || '').trim().toLowerCase();

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'A valid unsubscribe token or email is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    const now = new Date().toISOString();

    if (token) {
      await supabase
        .from('email_subscribers')
        .update({
          marketing_opt_in: false,
          unsubscribed_at: now,
        })
        .eq('unsubscribe_token', token);
    } else if (email) {
      await supabase
        .from('email_subscribers')
        .update({
          marketing_opt_in: false,
          unsubscribed_at: now,
        })
        .eq('email', email);
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from all marketing communications.',
    });
  } catch (err: any) {
    console.error('[api/unsubscribe] Error:', err);
    return NextResponse.json({ success: false, error: 'Unsubscribe failed.' }, { status: 500 });
  }
}
