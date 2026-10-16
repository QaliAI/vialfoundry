import { Resend } from "resend";
import { sanitizeEnvValue } from "../env/sanitizer";
import { getBrandConfig } from "../../config/brand";
import { resolveEmailIdentity } from "./identity.mjs";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = sanitizeEnvValue(process.env.RESEND_API_KEY);
  if (!apiKey) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function sendEmailSafely(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  idempotencyKey?: string;
  requireDelivery?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const brand = getBrandConfig();

    if (!resend) {
      if (params.requireDelivery || process.env.VERCEL_ENV === 'production') {
        return { success: false, error: 'Email provider unavailable' };
      }
      console.log('[email/mock] provider not configured');
      return { success: true, id: "mock-email-id" };
    }

    const identity = resolveEmailIdentity(process.env, brand);

    const { data, error } = await resend.emails.send({
      from: params.from || identity.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo || identity.replyTo,
    }, params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined);

    if (error) {
      console.error('[email/resend] provider rejected delivery');
      return { success: false, error: error.message };
    }

    return data?.id ? { success: true, id: data.id } : { success: false, error: 'Provider receipt missing' };
  } catch (err: any) {
    console.error('[email/resend] delivery request failed');
    // Never rethrow - preserve customer checkout success
    return { success: false, error: err.message };
  }
}
