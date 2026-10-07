import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '../../../lib/supabase/admin';
import { sendEmailSafely } from '../../../lib/email/resend';
import { renderWelcomeEmail } from '../../../lib/email/templates/welcome';

// In-memory rate limiting: max 5 requests per 60 seconds per IP
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 5;

  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, source } = body;

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const unsubscribeToken = crypto.randomUUID();

    // Check if subscriber exists
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id, welcome_email_sent_at, unsubscribe_token')
      .eq('email', cleanEmail)
      .maybeSingle();

    let activeToken = existing?.unsubscribe_token || unsubscribeToken;
    let shouldSendWelcome = !existing?.welcome_email_sent_at;

    if (existing) {
      await supabase
        .from('email_subscribers')
        .update({
          marketing_opt_in: true,
          unsubscribed_at: null,
          marketing_opt_in_at: new Date().toISOString(),
          marketing_source: typeof source === 'string' ? source.slice(0, 50) : 'footer_form',
        })
        .eq('id', existing.id);
    } else {
      const { error } = await supabase.from('email_subscribers').insert({
        email: cleanEmail,
        source: typeof source === 'string' ? source.slice(0, 50) : 'footer_form',
        marketing_source: typeof source === 'string' ? source.slice(0, 50) : 'footer_form',
        marketing_opt_in: true,
        marketing_opt_in_at: new Date().toISOString(),
        unsubscribe_token: unsubscribeToken,
      });

      if (error) {
        const isDuplicate =
          error.code === '23505' ||
          error.message?.toLowerCase().includes('duplicate') ||
          error.message?.toLowerCase().includes('unique');

        if (!isDuplicate) {
          console.error('[newsletter] persistence failure:', error.message);
          return NextResponse.json(
            { success: false, error: 'Unable to complete subscription. Please try again later.' },
            { status: 500 }
          );
        }
      }
    }

    // Trigger Welcome Email sequence if first time
    if (shouldSendWelcome) {
      const { html, text } = renderWelcomeEmail({
        customerEmail: cleanEmail,
        unsubscribeToken: activeToken,
      });

      const emailResult = await sendEmailSafely({
        to: cleanEmail,
        subject: 'Welcome to Vial Foundry — 20% Off Your First Research Order',
        html,
        text,
      });

      if (emailResult.success) {
        await supabase
          .from('email_subscribers')
          .update({ welcome_email_sent_at: new Date().toISOString() })
          .eq('email', cleanEmail);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you. You are subscribed and your 20% first-order privilege has been sent.',
    });
  } catch (error: any) {
    console.error('[newsletter] unexpected error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}
