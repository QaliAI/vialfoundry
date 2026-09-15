import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';

// Simple in-memory rate limiting: max 5 requests per 60 seconds per IP
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

    const supabase = createRouteClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const { error } = await supabase
      .from('email_subscribers')
      .insert({
        email: cleanEmail,
        source: typeof source === 'string' ? source.slice(0, 50) : 'footer_form',
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
      // Duplicate subscription returns success so customer sees clean confirmation
    }

    return NextResponse.json({ success: true, message: 'Thank you. You are subscribed.' });
  } catch (error: any) {
    console.error('[newsletter] unexpected error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}
