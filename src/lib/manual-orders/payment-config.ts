import { sanitizeEnvValue } from "../env/sanitizer";
import { getBrandConfig } from "../../config/brand";

export interface ManualPaymentRecipientConfig {
  zelleRecipientName: string;
  zelleEmail: string;
  zelleNoteFormat: string;
  venmoHandle: string;
  venmoVerificationNote: string;
}

export function getManualPaymentConfig(): ManualPaymentRecipientConfig {
  const brand = getBrandConfig();
  // No invented recipients. An unset handle stays empty so the caller can hide
  // the method rather than print an address nobody monitors.
  const zelleName =
    sanitizeEnvValue(process.env.ZELLE_RECIPIENT_NAME) ||
    brand.paymentMethods.zelle.recipientName ||
    "";

  const zelleEmail =
    sanitizeEnvValue(process.env.ZELLE_EMAIL) ||
    brand.paymentMethods.zelle.emailOrPhone ||
    "";

  const venmoHandle =
    sanitizeEnvValue(process.env.VENMO_HANDLE) ||
    brand.paymentMethods.venmo.handle ||
    "";

  return {
    zelleRecipientName: zelleName,
    zelleEmail,
    zelleNoteFormat: brand.paymentMethods.zelle.noteFormat || "VF Order #[ORDER_NUMBER]",
    venmoHandle,
    venmoVerificationNote: brand.paymentMethods.venmo.verificationNote || "Include VF Order #[ORDER_NUMBER] in note",
  };
}
