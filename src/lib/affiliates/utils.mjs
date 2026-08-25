export const AFFILIATE_RULES_TEXT =
  "I understand that Vial Foundry affiliate partners may not make human-use, animal-use, dosing, reconstitution, injection, weight-loss, healing/recovery, muscle/performance, anti-aging, before/after, medical, therapeutic, or disease claims. Affiliate promotion must strictly remain in an in vitro research and analytical laboratory context.";

export const DEFAULT_AFFILIATE_COMMISSION_RATE_BPS = 1000;
export const DEFAULT_AFFILIATE_COMMISSION_PERCENT = 10;
export const AFFILIATE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function percentToBps(percent) {
  const value = typeof percent === "string" ? Number(percent.trim()) : Number(percent);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return null;
  }
  return Math.round(value * 100);
}

export function bpsToPercent(bps) {
  const value = typeof bps === "string" ? Number(bps.trim()) : Number(bps);
  if (!Number.isFinite(value) || value < 0 || value > 10000) {
    return null;
  }
  return Math.round(value) / 100;
}

export function sanitizeCommissionRateBps(bps) {
  const value = typeof bps === "string" ? Number(bps.trim()) : Number(bps);
  if (!Number.isFinite(value) || value < 0 || value > 10000) {
    return null;
  }
  return Math.round(value);
}

export const starterAffiliates = [
  { code: "PARTNER01", affiliate_code: "PARTNER01", display_name: "Research Partner 1", name: "Research Partner 1", email: "partner1@vialfoundry.com", status: "active", commission_rate_bps: 1000, commission_rate: 0.10 },
  { code: "PARTNER02", affiliate_code: "PARTNER02", display_name: "Research Partner 2", name: "Research Partner 2", email: "partner2@vialfoundry.com", status: "active", commission_rate_bps: 1000, commission_rate: 0.10 },
  { code: "LABS10", affiliate_code: "LABS10", display_name: "BioLabs Network", name: "BioLabs Network", email: "affiliates@biolabs.org", status: "active", commission_rate_bps: 1000, commission_rate: 0.10 },
];

export const starterAffiliateCodes = starterAffiliates.map((a) => a.code);

const aliasMap = {
  vf01: "PARTNER01",
  vf02: "PARTNER02",
  labs: "LABS10",
};

export function resolveAliasCode(code) {
  const normalized = String(code ?? "").trim().toLowerCase();
  return aliasMap[normalized] ?? normalized;
}

export function normalizeAffiliateCode(source) {
  const normalized = String(source ?? "")
    .trim()
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-(LLC|INC|LTD|CO|CORP)$/g, "")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 32)
    .replace(/-+$/g, "");

  return normalized || "FOUNDRY";
}

export function generateAffiliateCode(input, existingCodes = new Set()) {
  const base = normalizeAffiliateCode(input?.company || input?.name || "Foundry");
  const existing = new Set(Array.from(existingCodes, (code) => String(code).toUpperCase()));

  if (!existing.has(base)) {
    return base;
  }

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString(36).toUpperCase()}`;
}

export function formatReferralLink(code, origin = "https://vialfoundry.com") {
  const baseUrl = String(origin || "https://vialfoundry.com").replace(/\/+$/g, "");
  return `${baseUrl}/r/${encodeURIComponent(String(code ?? "").trim())}`;
}

export function getStarterAffiliateByCode(code) {
  if (!code) return null;
  const aliasResolved = resolveAliasCode(code);
  const uppercased = aliasResolved.toUpperCase();
  return starterAffiliates.find((a) => a.code.toUpperCase() === uppercased || a.affiliate_code.toUpperCase() === uppercased) ?? null;
}

export function isStarterAffiliateCode(code) {
  return Boolean(getStarterAffiliateByCode(code));
}

export function resolveAffiliateReferral(code, options = {}) {
  const normalized = normalizeAffiliateCode(code);
  const aliasResolved = resolveAliasCode(normalized);
  const activeCodes = options.activeCodes
    ? new Set(Array.from(options.activeCodes, (item) => normalizeAffiliateCode(item)))
    : new Set(starterAffiliateCodes.map((c) => c.toUpperCase()));
  const redirectTo = options.redirectTo || "/catalog";

  if (!normalized || !activeCodes.has(aliasResolved.toUpperCase())) {
    return { ok: false, code: "", redirectTo };
  }

  return { ok: true, code: aliasResolved.toUpperCase(), redirectTo };
}

export function calculateCommissionAmount(grossRevenue, commissionRate = DEFAULT_AFFILIATE_COMMISSION_RATE_BPS / 10000) {
  const gross = Number(grossRevenue) || 0;
  const rate = Number(commissionRate) || 0;
  return Math.round(gross * rate * 100) / 100;
}

export function calculateOrderAffiliateCommission(input = {}) {
  const productSubtotalCents = Math.max(0, Number(input.productSubtotalCents ?? 0));
  const shippingCents = Math.max(0, Number(input.shippingCents ?? 0));
  const rateBps = Math.max(0, Number(input.rateBps ?? DEFAULT_AFFILIATE_COMMISSION_RATE_BPS));
  return {
    rateBps,
    productSubtotalCents,
    shippingCentsExcluded: shippingCents,
    commissionCents: Math.round(productSubtotalCents * (rateBps / 10000)),
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}
