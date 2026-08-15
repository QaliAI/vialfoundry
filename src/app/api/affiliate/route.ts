import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';
import { sendTransactionalEmail } from '../../../lib/adapters/emailAdapter';

export async function POST(req: Request) {
  try {
    const { name, email, website, audience, payoutMethod } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 });
    }

    const supabase = createRouteClient();
    if (supabase) {
      const { error } = await supabase.from('affiliate_applications').insert({
        name,
        email,
        website: website || null,
        audience: audience || null,
        payout_method: payoutMethod || null,
      });
      if (error) console.error('[affiliate] insert error', error.message);
    }

    await sendTransactionalEmail({
      to: process.env.NOTIFICATION_EMAIL_TO || 'admin@vialfoundry.com',
      subject: `[Vial Foundry] New affiliate application — ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Website/Social:</strong> ${website || '-'}</p><p><strong>Audience:</strong> ${audience || '-'}</p><p><strong>Payout:</strong> ${payoutMethod || '-'}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
