import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const supabase = createRouteClient();
    if (supabase) {
      const { error } = await supabase
        .from('email_subscribers')
        .insert({ email: email.trim().toLowerCase(), source: source || 'footer_form' });
      // Ignore unique-violation (already subscribed) so the UX still succeeds.
      if (error && !error.message.toLowerCase().includes('duplicate')) {
        console.error('[newsletter] insert error', error.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
