import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '../../../lib/adapters/emailAdapter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, institution, email, subject, message } = body;

    await sendTransactionalEmail({
      to: process.env.NOTIFICATION_EMAIL_TO || 'admin@vialfoundry.com',
      subject: `[Vial Foundry Contact] ${subject} - ${institution || name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Institution:</strong> ${institution}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
    });

    return NextResponse.json({ success: true, message: 'Contact request recorded.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
