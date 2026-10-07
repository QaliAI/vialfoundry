import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmailSafely } from '@/lib/email/resend';

export const CUSTOMER_SESSION_COOKIE_NAME = 'vf_customer_session';
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey(): string {
  return (
    process.env.CUSTOMER_AUTH_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'vf-customer-auth-session-key-2026'
  );
}

export interface CustomerSessionData {
  customerId: string;
  email: string;
  iat: number;
  exp: number;
}

export function generateCustomerToken(customerId: string, email: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + CUSTOMER_SESSION_MAX_AGE_SECONDS;
  const payload = { customerId, email: email.toLowerCase().trim(), iat, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecretKey()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyCustomerToken(token: string): CustomerSessionData | null {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', getSecretKey()).update(body).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
}

export async function sendCustomerLoginCode(
  rawEmail: string
): Promise<{ success: boolean; error?: string; codeForTest?: string }> {
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { success: false, error: 'Database service is unavailable.' };
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  try {
    // Find or create customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (customer?.id) {
      await supabase
        .from('customers')
        .update({
          login_token_hash: tokenHash,
          login_token_expires_at: expiresAt,
        })
        .eq('id', customer.id);
    } else {
      await supabase.from('customers').insert({
        email,
        login_token_hash: tokenHash,
        login_token_expires_at: expiresAt,
      });
    }

    // Send email
    const subject = `Your Vial Foundry Sign-In Code: ${code}`;
    const html = `<!DOCTYPE html>
<html>
<body style="background: #0f1115; color: #f1f5f9; font-family: sans-serif; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #161922; border: 1px solid #232836; border-radius: 12px; padding: 32px;">
    <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-family: monospace;">VIAL FOUNDRY · RESEARCH MATERIALS</div>
    <h2 style="color: #ffffff; margin: 12px 0;">Sign In to Your Account</h2>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
      Enter the 6-digit verification code below to view your order history and manage your research preferences.
    </p>
    <div style="margin: 24px 0; padding: 18px; background: #0f1115; border: 1px solid #334155; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 0.2em; color: #10b981;">
      ${code}
    </div>
    <p style="font-size: 12px; color: #64748b;">
      This code is valid for 15 minutes. If you did not request this email, you can safely disregard it.
    </p>
  </div>
</body>
</html>`;

    await sendEmailSafely({
      to: email,
      subject,
      html,
      text: `Your Vial Foundry verification code is: ${code} (valid for 15 minutes).`,
    });

    return {
      success: true,
      codeForTest: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  } catch (err: any) {
    console.error('[customer:auth] send code error:', err);
    return { success: false, error: 'Failed to dispatch verification code.' };
  }
}

export async function verifyCustomerLoginCode(
  rawEmail: string,
  code: string
): Promise<{ success: boolean; error?: string; token?: string; customerId?: string }> {
  const email = String(rawEmail || '').trim().toLowerCase();
  const cleanCode = String(code || '').trim();

  if (!email || !cleanCode) {
    return { success: false, error: 'Email and verification code are required.' };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { success: false, error: 'Database service is unavailable.' };
  }

  const expectedHash = crypto.createHash('sha256').update(cleanCode).digest('hex');

  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, login_token_hash, login_token_expires_at')
      .ilike('email', email)
      .maybeSingle();

    if (error || !customer || !customer.login_token_hash) {
      return { success: false, error: 'Invalid or expired code. Please request a new one.' };
    }

    if (customer.login_token_expires_at && new Date(customer.login_token_expires_at) < new Date()) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (customer.login_token_hash !== expectedHash) {
      return { success: false, error: 'Invalid verification code.' };
    }

    // Clear code on success
    await supabase
      .from('customers')
      .update({
        login_token_hash: null,
        login_token_expires_at: null,
      })
      .eq('id', customer.id);

    const token = generateCustomerToken(customer.id, email);
    return { success: true, token, customerId: customer.id };
  } catch (err: any) {
    console.error('[customer:auth] verification error:', err);
    return { success: false, error: 'Verification error.' };
  }
}
