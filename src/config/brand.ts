export interface BrandPaymentMethods {
  manualInvoice: boolean;
  zelle: {
    enabled: boolean;
    recipientName?: string;
    emailOrPhone?: string;
    noteFormat?: string;
  };
  venmo: {
    enabled: boolean;
    handle?: string;
    verificationNote?: string;
  };
  customProcessor?: {
    enabled: boolean;
    providerName?: string;
  };
}

export interface BrandAffiliateSettings {
  defaultCommissionRateBps: number; // e.g. 1000 for 10%
  promoCodeOverrideBps: Record<string, number>; // e.g. { FOUNDRY10: 800 }
  attributionCookieDays: number;
  cookieName: string;
}

export interface BrandShippingOption {
  id: string;
  name: string;
  description: string;
  costCents: number;
  freeShippingThresholdCents?: number;
}

export interface BrandPromoConfig {
  code: string;
  name?: string;
  discountRateBps?: number; // e.g. 1000 for 10%
  fixedDiscountCents?: number;
  minSubtotalCents?: number;
  affiliateCommissionRateBps?: number;
  enabled?: boolean;
}

export interface BrandConfig {
  brandId: string;
  name: string;
  legalName: string;
  domain: string;
  supportEmail: string;
  orderNotificationEmails: string[];
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  currency: string;
  emailSenderName: string;
  emailSenderDomain: string;
  researchUseOnlyDisclaimer: string;
  checkoutNotice: string;
  paymentMethods: BrandPaymentMethods;
  affiliateSettings: BrandAffiliateSettings;
  shippingOptions: BrandShippingOption[];
  promotions: BrandPromoConfig[];
}

export const vialFoundryBrandConfig: BrandConfig = {
  brandId: process.env.NEXT_PUBLIC_BRAND_ID || "vial-foundry",
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "Vial Foundry",
  legalName: process.env.NEXT_PUBLIC_BRAND_LEGAL_NAME || "Vial Foundry Laboratories LLC",
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN || "vialfoundry.com",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@vialfoundry.com",
  orderNotificationEmails: (process.env.ADMIN_NOTIFICATION_EMAIL || "orders@vialfoundry.com, admin@vialfoundry.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  logoUrl: "/brand/vialfoundry-logo.svg",
  faviconUrl: "/favicon.ico",
  primaryColor: "#08090B",
  accentColor: "#06b6d4",
  currency: "USD",
  emailSenderName: process.env.EMAIL_SENDER_NAME || "Vial Foundry Procurement",
  emailSenderDomain: process.env.EMAIL_SENDER_DOMAIN || "vialfoundry.com",
  researchUseOnlyDisclaimer:
    "All Vial Foundry materials and reference standards are strictly synthesized and supplied for qualified in vitro laboratory and analytical research. Not for human, veterinary, therapeutic, or diagnostic administration.",
  checkoutNotice:
    "Orders submit a formal research procurement request. Formal quotes, invoices, and secure payment verification instructions will be issued promptly.",
  paymentMethods: {
    manualInvoice: true,
    zelle: {
      enabled: true,
      recipientName: process.env.ZELLE_RECIPIENT_NAME || "Vial Foundry LLC",
      emailOrPhone: process.env.ZELLE_EMAIL || "payments@vialfoundry.com",
      noteFormat: "VF Order #[ORDER_NUMBER]",
    },
    venmo: {
      enabled: true,
      handle: process.env.VENMO_HANDLE || "@VialFoundry",
      verificationNote: "Include VF Order #[ORDER_NUMBER] in note",
    },
  },
  affiliateSettings: {
    defaultCommissionRateBps: 1000, // 10.00%
    promoCodeOverrideBps: {
      FOUNDRY10: 800, // 8.00% on discounted orders
      SAVE10: 800,
    },
    attributionCookieDays: 30,
    cookieName: "vf_ref_partner",
  },
  shippingOptions: [
    {
      id: "standard",
      name: "Standard Ground (3-5 Days)",
      description: "Temperature-monitored ground shipping with cold insulation pack.",
      costCents: 1500,
      freeShippingThresholdCents: 20000,
    },
    {
      id: "priority",
      name: "Priority Air (2-Day)",
      description: "Expedited cold-chain transit with guaranteed delivery window.",
      costCents: 3500,
    },
    {
      id: "express",
      name: "Express Overnight (1-Day)",
      description: "Next-day priority delivery with thermal ice insulation.",
      costCents: 6500,
    },
  ],
  promotions: [
    {
      code: "FOUNDRY10",
      name: "Foundry 10% Discount",
      discountRateBps: 1000,
      affiliateCommissionRateBps: 800,
      enabled: true,
    },
    {
      code: "RESEARCH25",
      name: "Research $25 Discount on orders $200+",
      fixedDiscountCents: 2500,
      minSubtotalCents: 20000,
      enabled: true,
    },
  ],
};

export function getBrandConfig(): BrandConfig {
  return vialFoundryBrandConfig;
}
