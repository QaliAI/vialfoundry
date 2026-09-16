import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';
import { sendEmailSafely } from '../../../lib/email/resend';
import { resolveOrderNotificationEmails } from '../../../config/brand';

// In-memory sliding rate limiter (5 inquiries per 15 minutes per IP)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, validTimestamps);
    return true;
  }
  validTimestamps.push(now);
  ipRequestHistory.set(ip, validTimestamps);
  return false;
}

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Too many inquiries submitted. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, institution, email, subject, message, organization_website, website } = body;

    // 2. Anti-Spam Honeypot: Bot trapped if honeypot filled
    if (organization_website || website) {
      console.warn(`[contact] honeypot triggered by ${clientIp}`);
      // Return 200 OK silently to deceive the bot without executing any backend action
      return NextResponse.json({ success: true, message: 'Contact request recorded.' });
    }

    // 3. Strict Input Validation & Length Limits
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    const trimmedInstitution = typeof institution === 'string' ? institution.trim() : '';
    const trimmedSubject = typeof subject === 'string' ? subject.trim() : 'General Inquiry';

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json({ success: false, error: 'Missing required fields (name, email, message).' }, { status: 400 });
    }

    if (trimmedName.length > 100) {
      return NextResponse.json({ success: false, error: 'Name must be 100 characters or fewer.' }, { status: 400 });
    }

    if (trimmedInstitution.length > 150) {
      return NextResponse.json({ success: false, error: 'Company / Lab must be 150 characters or fewer.' }, { status: 400 });
    }

    if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (trimmedSubject.length > 150) {
      return NextResponse.json({ success: false, error: 'Subject must be 150 characters or fewer.' }, { status: 400 });
    }

    if (trimmedMessage.length > 3000) {
      return NextResponse.json({ success: false, error: 'Message must be 3,000 characters or fewer.' }, { status: 400 });
    }

    // 4. Record to Database
    let dbSuccess = false;
    const supabase = createRouteClient();
    if (supabase) {
      const { error } = await supabase.from('contact_requests').insert({
        name: trimmedName,
        institution: trimmedInstitution || null,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });
      if (error) {
        console.error('[contact] insert error:', error.message);
      } else {
        dbSuccess = true;
      }
    }

    // 5. Merge Order-Notification Recipients & Send Transactional Notification
    const configuredRecipients = resolveOrderNotificationEmails();
    const notificationRecipients = configuredRecipients.length > 0
      ? configuredRecipients
      : [
          process.env.ADMIN_EMAIL ||
          process.env.ADMIN_NOTIFICATION_EMAIL ||
          process.env.NOTIFICATION_EMAIL_TO ||
          process.env.NEXT_PUBLIC_HELLO_EMAIL ||
          'hello@vialfoundry.com'
        ];

    // HTML-escape all user-provided variables to prevent HTML/XSS injection in emails
    const safeName = escapeHtml(trimmedName);
    const safeInstitution = escapeHtml(trimmedInstitution || 'Not Specified');
    const safeEmail = escapeHtml(trimmedEmail);
    const safeSubject = escapeHtml(trimmedSubject);
    const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, '<br/>');

    const emailResult = await sendEmailSafely({
      to: notificationRecipients,
      replyTo: trimmedEmail,
      subject: `[Vial Foundry Contact] ${safeSubject} - ${safeInstitution !== 'Not Specified' ? safeInstitution : safeName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <h2 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">New Storefront Inquiry</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Institution / Company:</strong> ${safeInstitution}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <strong style="display: block; margin-bottom: 8px;">Message:</strong>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Submitted from IP: ${escapeHtml(clientIp)} &middot; Vial Foundry Contact Routing
          </p>
        </div>
      `,
      text: `Name: ${trimmedName}\nInstitution: ${trimmedInstitution || '-'}\nEmail: ${trimmedEmail}\nSubject: ${trimmedSubject}\n\nMessage:\n${trimmedMessage}`,
    });

    // 6. Validation: If both DB and email failed, report error
    if (!dbSuccess && !emailResult.success) {
      console.error('[contact] both DB recording and notification email failed');
      return NextResponse.json(
        { success: false, error: 'Unable to deliver contact request at this time. Please email us directly.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Contact request recorded.' });
  } catch (error: any) {
    console.error('[contact] unexpected error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
