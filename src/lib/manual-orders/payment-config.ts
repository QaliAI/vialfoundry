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
  const zelleName =
    sanitizeEnvValue(process.env.ZELLE_RECIPIENT_NAME) ||
    brand.paymentMethods.zelle.recipientName ||
    "Vial Foundry LLC";

  const zelleEmail =
    sanitizeEnvValue(process.env.ZELLE_EMAIL) ||
    brand.paymentMethods.zelle.emailOrPhone ||
    "payments@vialfoundry.com";

  const venmoHandle =
    sanitizeEnvValue(process.env.VENMO_HANDLE) ||
    brand.paymentMethods.venmo.handle ||
    "@VialFoundry";

  return {
    zelleRecipientName: zelleName,
    zelleEmail,
    zelleNoteFormat: brand.paymentMethods.zelle.noteFormat || "VF Order #[ORDER_NUMBER]",
    venmoHandle,
    venmoVerificationNote: brand.paymentMethods.venmo.verificationNote || "Include VF Order #[ORDER_NUMBER] in note",
  };
}
