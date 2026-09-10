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
  // No invented entity. Until the real registered company name is set in
  // NEXT_PUBLIC_BRAND_LEGAL_NAME, fall back to the trading name rather than
  // presenting an LLC that may not exist.
  legalName: process.env.NEXT_PUBLIC_BRAND_LEGAL_NAME || "Vial Foundry",
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN || "vialfoundry.com",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@vialfoundry.com",
  orderNotificationEmails: (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL_TO || "orders@vialfoundry.com, admin@vialfoundry.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  logoUrl: "/brand/logo-horizontal.svg",
  faviconUrl: "/favicon.ico",
  primaryColor: "#0F2740", // Midnight (approved)
  accentColor: "#2F9E9A", // Teal (approved, accent only)
  currency: "USD",
  emailSenderName: process.env.EMAIL_SENDER_NAME || "Vial Foundry",
  emailSenderDomain: process.env.EMAIL_SENDER_DOMAIN || "vialfoundry.com",
  researchUseOnlyDisclaimer:
    "All Vial Foundry products are supplied strictly for laboratory research use. Not for human or animal consumption, and not for medical, veterinary, therapeutic or diagnostic use.",
  checkoutNotice:
    "Placing an order sends us a request. We confirm stock, then email your invoice and payment instructions.",
  paymentMethods: {
    manualInvoice: true,
    zelle: {
      enabled: Boolean(process.env.ZELLE_EMAIL),
      recipientName: process.env.ZELLE_RECIPIENT_NAME || "",
      emailOrPhone: process.env.ZELLE_EMAIL || "",
      noteFormat: "VF Order #[ORDER_NUMBER]",
    },
    venmo: {
      enabled: Boolean(process.env.VENMO_HANDLE),
      handle: process.env.VENMO_HANDLE || "",
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
      name: "Standard Shipping (3-5 days)",
      description: "Carefully packed and shipped by ground.",
      costCents: 1500,
      freeShippingThresholdCents: 20000,
    },
    {
      id: "priority",
      name: "Priority Shipping (2 days)",
      description: "Faster shipping with tracking.",
      costCents: 3500,
    },
    {
      id: "express",
      name: "Overnight Shipping (1 day)",
      description: "Next-day delivery with tracking.",
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
      name: "Research  Discount on orders +",
      fixedDiscountCents: 2500,
      minSubtotalCents: 20000,
      enabled: true,
    },
  ],
};

export function getBrandConfig(): BrandConfig {
  return vialFoundryBrandConfig;
}
