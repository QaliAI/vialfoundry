import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';
import { sendTransactionalEmail } from '../../../lib/adapters/emailAdapter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, institution, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = createRouteClient();
    if (supabase) {
      const { error } = await supabase.from('contact_requests').insert({
        name,
        institution: institution || null,
        email,
        subject: subject || 'General Inquiry',
        message,
      });
      if (error) console.error('[contact] insert error', error.message);
    }

    await sendTransactionalEmail({
      to: process.env.NOTIFICATION_EMAIL_TO || 'admin@vialfoundry.com',
      subject: `[Vial Foundry Contact] ${subject || 'Inquiry'} - ${institution || name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Institution:</strong> ${institution || '-'}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    });

    return NextResponse.json({ success: true, message: 'Contact request recorded.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
