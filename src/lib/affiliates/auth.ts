import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  AFFILIATE_SESSION_COOKIE_NAME,
  AFFILIATE_SESSION_MAX_AGE_SECONDS,
  hashAffiliatePassword,
  verifyAffiliatePassword,
  generateAffiliateSessionToken,
  verifyAffiliateSessionToken,
} from './auth-tokens.mjs';

export {
  AFFILIATE_SESSION_COOKIE_NAME,
  AFFILIATE_SESSION_MAX_AGE_SECONDS,
  hashAffiliatePassword,
  verifyAffiliatePassword,
};

function getSecretKey(): string {
  return (
    process.env.AFFILIATE_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'vf-affiliate-session-token-secret-2026'
  );
}

export interface AffiliateSessionData {
  affiliateId: string;
  email: string;
  code: string;
  name: string;
  iat: number;
  exp: number;
}

export function createAffiliateSessionCookie(affiliate: {
  id: string;
  email: string;
  referral_code?: string;
  code?: string;
  name: string;
}): string {
  return generateAffiliateSessionToken(
    {
      id: affiliate.id,
      email: affiliate.email,
      affiliateCode: affiliate.referral_code || affiliate.code || '',
      name: affiliate.name,
    },
    getSecretKey()
  );
}

export async function getAffiliateSession(): Promise<AffiliateSessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AFFILIATE_SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAffiliateSessionToken(token, getSecretKey()) as AffiliateSessionData | null;
  } catch {
    return null;
  }
}

export async function requireAffiliateSession(): Promise<AffiliateSessionData> {
  const session = await getAffiliateSession();
  if (!session) {
    redirect('/affiliates/login');
  }
  return session;
}

export async function authenticateAffiliate(
  email: string,
  passwordPlain: string
): Promise<{ success: boolean; error?: string; affiliate?: any }> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = createAdminClient();
  if (!supabase) {
    return { success: false, error: 'Database service is currently unavailable.' };
  }

  try {
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error || !affiliate) {
      return { success: false, error: 'No partner account exists for this email address.' };
    }

    if (affiliate.status !== 'active') {
      return { success: false, error: 'Your affiliate account is not currently active.' };
    }

    if (!affiliate.password_hash || !affiliate.password_salt) {
      return {
        success: false,
        error: 'Your account has not set a password yet. Please use your setup invite link or request a new one.',
      };
    }

    const valid = verifyAffiliatePassword(passwordPlain, affiliate.password_salt, affiliate.password_hash);
    if (!valid) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    return { success: true, affiliate };
  } catch (err: any) {
    console.error('[affiliates:auth] Error during authenticateAffiliate:', err);
    return { success: false, error: 'Authentication service error.' };
  }
}

export async function setupAffiliatePassword(
  inviteToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; affiliate?: any }> {
  if (!inviteToken || !newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { success: false, error: 'Database client unavailable.' };
  }

  try {
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('invite_token', inviteToken.trim())
      .maybeSingle();

    if (error || !affiliate) {
      return { success: false, error: 'Invalid or expired setup token.' };
    }

    if (affiliate.invite_token_expires_at && new Date(affiliate.invite_token_expires_at) < new Date()) {
      return { success: false, error: 'This setup link has expired. Please contact support for a new link.' };
    }

    const { salt, hash } = hashAffiliatePassword(newPassword);

    const { data: updated, error: updateErr } = await supabase
      .from('affiliates')
      .update({
        password_salt: salt,
        password_hash: hash,
        invite_token: null,
        invite_token_expires_at: null,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', affiliate.id)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: 'Failed to update credentials. Please try again.' };
    }

    return { success: true, affiliate: updated };
  } catch (err: any) {
    console.error('[affiliates:setup] Error:', err);
    return { success: false, error: 'Internal setup error.' };
  }
}

export async function generateAffiliateInviteToken(affiliateId: string): Promise<string | null> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const supabase = createAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from('affiliates')
      .update({
        invite_token: token,
        invite_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', affiliateId);

    if (error) {
      console.error('[affiliates:invite] Error saving invite token:', error);
      return null;
    }
  }

  return token;
}
