import { renderEmailShell, panel, panelRow, escapeHtml, EMAIL_COLORS } from './layout';

export interface AffiliateInviteEmailProps {
  partnerName: string;
  partnerEmail: string;
  referralCode: string;
  commissionRatePercent: number; // e.g. 25
  customerDiscountPercent: number; // e.g. 10
  setupUrl: string;
  referralUrl: string;
  portalUrl: string;
}

export function renderAffiliateInviteEmail(props: AffiliateInviteEmailProps): { html: string; text: string } {
  const {
    partnerName,
    referralCode,
    commissionRatePercent,
    customerDiscountPercent,
    setupUrl,
    referralUrl,
    portalUrl,
  } = props;

  const safeName = escapeHtml(partnerName);
  const safeCode = escapeHtml(referralCode.toUpperCase());
  const safeReferralUrl = escapeHtml(referralUrl);
  const safeSetupUrl = escapeHtml(setupUrl);
  const safePortalUrl = escapeHtml(portalUrl);

  const innerPanel = `
    ${panelRow('Partner Referral Code', safeCode)}
    ${panelRow('Your Commission Rate', `${commissionRatePercent}% on qualified research orders`)}
    ${panelRow('Audience Privilege', `${customerDiscountPercent}% discount applied at checkout`)}
    ${panelRow('Attribution Window', '30-Day Cookie Tracking')}
    ${panelRow('Direct Referral Link', `<a href="${safeReferralUrl}" style="color: ${EMAIL_COLORS.teal}; word-break: break-all;">${safeReferralUrl}</a>`)}
  `;

  const body = `
    <p style="margin: 0 0 18px 0; font-size: 16px; font-weight: 600; color: ${EMAIL_COLORS.midnight};">
      Welcome, ${safeName},
    </p>

    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: ${EMAIL_COLORS.text};">
      We are pleased to welcome you as a research partner with <strong>Vial Foundry</strong>. Your dedicated affiliate partner account has been configured with an incentive commission rate of <strong>${commissionRatePercent}%</strong> across all qualified research material orders.
    </p>

    ${panel('Partner Account Details', innerPanel)}

    <h3 style="margin: 28px 0 12px 0; font-size: 15px; font-weight: 700; color: ${EMAIL_COLORS.midnight}; letter-spacing: -0.01em;">
      How to Use Your Custom Affiliate Code &amp; Link
    </h3>

    <ol style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: ${EMAIL_COLORS.text};">
      <li style="margin-bottom: 10px;">
        <strong>Share Your Custom Tracking Link:</strong> Direct your audience to <a href="${safeReferralUrl}" style="color: ${EMAIL_COLORS.teal}; font-weight: 600; text-decoration: underline;">${safeReferralUrl}</a>. When visitors arrive via this URL, our system automatically sets a 30-day attribution cookie and connects their orders to your account.
      </li>
      <li style="margin-bottom: 10px;">
        <strong>Provide Your Promo Code:</strong> Researchers can also manually enter your code <strong style="font-family: monospace; background-color: ${EMAIL_COLORS.cloud}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${EMAIL_COLORS.border}; font-size: 13px;">${safeCode}</strong> in the cart or checkout promo code box to receive <strong>${customerDiscountPercent}% off</strong> their order, guaranteeing immediate attribution to you.
      </li>
      <li style="margin-bottom: 10px;">
        <strong>Earn ${commissionRatePercent}% Commission:</strong> You earn ${commissionRatePercent}% of the net product subtotal on all referred orders (shipping fees excluded from the commission base).
      </li>
    </ol>

    <div style="margin: 32px 0; text-align: center;">
      <a href="${safeSetupUrl}"
         style="display: inline-block; padding: 14px 32px; background-color: ${EMAIL_COLORS.midnight}; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(15, 39, 64, 0.15);">
        Activate Partner Dashboard &amp; Set Password &rarr;
      </a>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted};">
        Link active for 14 days. Once activated, log in anytime at <a href="${safePortalUrl}" style="color: ${EMAIL_COLORS.teal}; text-decoration: underline;">${safePortalUrl}</a>.
      </p>
    </div>

    <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: ${EMAIL_COLORS.textMuted};">
      Our partner portal provides real-time reporting on click counts, order volume, pending commissions, and payouts. If you have any questions or require custom assets, please reply directly to this email.
    </p>
  `;

  const html = renderEmailShell({
    eyebrow: 'Research Partner Invitation',
    preheader: `Welcome to the Vial Foundry Partner Program. Your custom referral code is ${referralCode.toUpperCase()}.`,
    body,
  });

  const text = `
Welcome to Vial Foundry, ${partnerName}!

Your research affiliate account is now active with an incentive commission rate of ${commissionRatePercent}%.

Your Partner Details:
- Referral Code: ${referralCode.toUpperCase()}
- Commission Rate: ${commissionRatePercent}% on qualified research materials
- Customer Discount: ${customerDiscountPercent}% off for your audience
- Referral Link: ${referralUrl}

How to use your link and code:
1. Share your link: ${referralUrl}
   Visitors clicking your link automatically receive a 30-day attribution cookie.
2. Share your promo code: ${referralCode.toUpperCase()}
   Researchers entering this code in cart/checkout receive ${customerDiscountPercent}% off and attribute the order to you.
3. Earn ${commissionRatePercent}% commission on all referred product subtotals (excluding shipping).

Activate Your Partner Portal:
Please set your password using this secure link (valid for 14 days):
${setupUrl}

Once activated, you can access your dashboard anytime at:
${portalUrl}

For research use only. Not for human or animal application.
Vial Foundry LLC · Research Materials
Support: support@vialfoundry.com
  `.trim();

  return { html, text };
}
