import { Resend } from "resend";
import { sanitizeEnvValue } from "../env/sanitizer";
import { getBrandConfig } from "../../config/brand";

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
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const brand = getBrandConfig();

    if (!resend) {
      console.log(`[email/mock] sendEmailSafely to: ${params.to} | subject: "${params.subject}" (RESEND_API_KEY not configured)`);
      return { success: true, id: "mock-email-id" };
    }

    const senderName = sanitizeEnvValue(process.env.EMAIL_SENDER_NAME) || brand.emailSenderName || "Vial Foundry Procurement";
    const senderDomain = sanitizeEnvValue(process.env.EMAIL_SENDER_DOMAIN) || brand.emailSenderDomain || "vialfoundry.com";
    const defaultFrom = `${senderName} <orders@${senderDomain}>`;

    const { data, error } = await resend.emails.send({
      from: params.from || defaultFrom,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo || brand.supportEmail || "support@vialfoundry.com",
    });

    if (error) {
      console.error("[email/resend] send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[email/resend] exception in sendEmailSafely:", err);
    // Never rethrow - preserve customer checkout success
    return { success: false, error: err.message };
  }
}
