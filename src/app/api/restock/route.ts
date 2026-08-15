import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';
import { sendTransactionalEmail } from '../../../lib/adapters/emailAdapter';

export async function POST(req: Request) {
  try {
    const { email, productId, productName } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const supabase = createRouteClient();
    if (supabase) {
      // productId here is the static catalog id, stored in reference for admin follow-up.
      const { error } = await supabase.from('restock_requests').insert({
        email: email.trim().toLowerCase(),
        status: 'pending',
      });
      if (error) console.error('[restock] insert error', error.message);
    }

    await sendTransactionalEmail({
      to: process.env.NOTIFICATION_EMAIL_TO || 'admin@vialfoundry.com',
      subject: `[Vial Foundry] Restock request: ${productName || productId || 'product'}`,
      html: `<p><strong>${email}</strong> requested restock notification for <strong>${productName || productId}</strong>.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
