'use client';

export function parseUtmParams(urlStringOrSearch?: string): Record<string, string | null> {
  if (!urlStringOrSearch) return {};
  try {
    const search = urlStringOrSearch.includes('?')
      ? urlStringOrSearch.slice(urlStringOrSearch.indexOf('?'))
      : (urlStringOrSearch.includes('=') ? `?${urlStringOrSearch}` : '');
    const params = new URLSearchParams(search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
    };
  } catch {
    return {};
  }
}

export interface AttributionTouch {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  affiliateCode?: string | null;
  promoCode?: string | null;
  timestamp?: string;
}

export interface OrderAttributionSnapshot {
  firstTouchSource?: string | null;
  firstTouchMedium?: string | null;
  firstTouchCampaign?: string | null;
  firstTouchContent?: string | null;
  firstTouchTerm?: string | null;
  lastTouchSource?: string | null;
  lastTouchMedium?: string | null;
  lastTouchCampaign?: string | null;
  lastTouchContent?: string | null;
  lastTouchTerm?: string | null;
  landingPage?: string | null;
  referrerUrl?: string | null;
}

const FIRST_TOUCH_KEY = 'vf_attr_first_touch';
const LAST_TOUCH_KEY = 'vf_attr_last_touch';
const LANDING_PAGE_KEY = 'vf_attr_landing_page';

function readStoredTouch(key: string): AttributionTouch | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredTouch(key: string, data: AttributionTouch) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function captureFirstPartyAttribution(): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');
    const promoParam = params.get('promo') || params.get('code');
    const affiliateParam = params.get('ref') || params.get('partner');

    // Read affiliate code from cookie or local storage if previously tracked
    const partnerCookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('vf_ref_partner='));
    const storedPartner = partnerCookie
      ? decodeURIComponent(partnerCookie.split('=')[1] || '')
      : localStorage.getItem('vf_ref_partner');

    const effectiveAffiliate = affiliateParam || storedPartner || null;

    // Check external referrer
    let externalReferrer: string | null = null;
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin !== window.location.origin) {
          externalReferrer = refUrl.origin;
        }
      } catch {}
    }

    const currentPath = window.location.pathname;

    // Store landing page on initial visit
    if (!localStorage.getItem(LANDING_PAGE_KEY)) {
      try {
        localStorage.setItem(LANDING_PAGE_KEY, currentPath);
      } catch {}
    }

    const hasAttributionSignals = Boolean(
      utmSource || utmCampaign || externalReferrer || effectiveAffiliate || promoParam
    );

    const touchData: AttributionTouch = {
      source: utmSource || (externalReferrer ? 'referral' : 'direct'),
      medium: utmMedium || (externalReferrer ? 'web' : 'direct'),
      campaign: utmCampaign || null,
      content: utmContent || null,
      term: utmTerm || null,
      referrer: externalReferrer || null,
      landingPage: currentPath,
      affiliateCode: effectiveAffiliate,
      promoCode: promoParam || null,
      timestamp: new Date().toISOString(),
    };

    // First Touch (Write once, never overwrite)
    const existingFirst = readStoredTouch(FIRST_TOUCH_KEY);
    if (!existingFirst) {
      writeStoredTouch(FIRST_TOUCH_KEY, touchData);
    }

    // Last Touch (Update whenever new attribution signals or campaign visit occurs)
    if (hasAttributionSignals || !readStoredTouch(LAST_TOUCH_KEY)) {
      writeStoredTouch(LAST_TOUCH_KEY, touchData);
    }
  } catch (err) {
    console.warn('[attribution] Error capturing touch state:', err);
  }
}

export function getOrderAttributionSnapshot(): OrderAttributionSnapshot {
  if (typeof window === 'undefined') return {};

  const first = readStoredTouch(FIRST_TOUCH_KEY);
  const last = readStoredTouch(LAST_TOUCH_KEY);
  const landing = localStorage.getItem(LANDING_PAGE_KEY) || first?.landingPage || null;

  return {
    firstTouchSource: first?.source || null,
    firstTouchMedium: first?.medium || null,
    firstTouchCampaign: first?.campaign || null,
    firstTouchContent: first?.content || null,
    firstTouchTerm: first?.term || null,
    lastTouchSource: last?.source || first?.source || null,
    lastTouchMedium: last?.medium || first?.medium || null,
    lastTouchCampaign: last?.campaign || first?.campaign || null,
    lastTouchContent: last?.content || first?.content || null,
    lastTouchTerm: last?.term || first?.term || null,
    landingPage: landing,
    referrerUrl: last?.referrer || first?.referrer || null,
  };
}
