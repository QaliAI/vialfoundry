import { getBrandConfig } from "../../../config/brand";

/**
 * Shared Vial Foundry transactional email shell.
 *
 * Approved identity only: Midnight header band with the reversed lockup,
 * white body, Mist rules, Teal used as a small accent. No large graphical
 * headers - the order data is the content.
 *
 * Layout uses tables and inline styles because Outlook and several webmail
 * clients ignore flexbox and <style> blocks.
 */

export const EMAIL_COLORS = {
  midnight: "#0F2740",
  midnightDeep: "#0A1D30",
  teal: "#2F9E9A",
  slate: "#6B8FA1",
  mist: "#C9D6DD",
  cloud: "#F4F7F9",
  text: "#0F2740",
  textMuted: "#5B7183",
  border: "#DFE7EC",
} as const;

function siteUrl(): string {
  const brand = getBrandConfig();
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return `https://${brand.domain}`;
}

export function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A label/value row for the totals block. `emphasis` renders the grand total. */
export function totalRow(
  label: string,
  value: string,
  opts: { emphasis?: boolean; positive?: boolean } = {},
): string {
  const color = opts.emphasis
    ? EMAIL_COLORS.midnight
    : opts.positive
      ? "#1F7A5C"
      : EMAIL_COLORS.textMuted;
  const weight = opts.emphasis ? "700" : "400";
  const size = opts.emphasis ? "17px" : "14px";
  const pad = opts.emphasis
    ? `padding: 12px 0 0 0; border-top: 1px solid ${EMAIL_COLORS.border};`
    : "padding: 4px 0;";
  return `
    <tr>
      <td style="${pad} color: ${color}; font-size: ${size}; font-weight: ${weight};">${label}</td>
      <td align="right" style="${pad} color: ${color}; font-size: ${size}; font-weight: ${weight};">${value}</td>
    </tr>`;
}

/** A bordered callout used for payment instructions and tracking. */
export function panel(title: string, innerHtml: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color: ${EMAIL_COLORS.cloud}; border: 1px solid ${EMAIL_COLORS.border}; border-radius: 10px; margin: 24px 0;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.teal}; margin-bottom: 10px;">${title}</div>
          ${innerHtml}
        </td>
      </tr>
    </table>`;
}

export function panelRow(label: string, value: string): string {
  return `<p style="margin: 3px 0; font-size: 14px; color: ${EMAIL_COLORS.text};">
    <span style="color: ${EMAIL_COLORS.textMuted};">${label}:</span> <strong>${value}</strong>
  </p>`;
}

export function renderEmailShell(params: {
  /** Short line under the logo, e.g. "Order confirmation". */
  eyebrow: string;
  preheader: string;
  body: string;
}): string {
  const brand = getBrandConfig();
  const url = siteUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(brand.name)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.cloud}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(params.preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color: ${EMAIL_COLORS.cloud}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width: 100%; max-width: 600px; background-color: #FFFFFF; border: 1px solid ${EMAIL_COLORS.border}; border-radius: 14px; overflow: hidden;">

          <tr>
            <td style="background-color: ${EMAIL_COLORS.midnight}; padding: 28px 32px;">
              <a href="${url}" style="text-decoration: none;">
                <img src="${url}/brand/logo-email.png" width="220" height="33"
                     alt="${escapeHtml(brand.name)} — Research Peptides"
                     style="display: block; border: 0; width: 220px; height: auto;" />
              </a>
              <div style="margin-top: 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${EMAIL_COLORS.teal};">
                ${escapeHtml(params.eyebrow)}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${EMAIL_COLORS.text}; font-size: 15px; line-height: 1.6;">
              ${params.body}
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px 32px; border-top: 1px solid ${EMAIL_COLORS.border}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.6; color: ${EMAIL_COLORS.textMuted};">
                <strong style="color: ${EMAIL_COLORS.text};">For research use only.</strong>
                ${escapeHtml(brand.researchUseOnlyDisclaimer)}
              </p>
              <p style="margin: 0; font-size: 11px; color: ${EMAIL_COLORS.textMuted};">
                Questions? <a href="mailto:${brand.supportEmail}" style="color: ${EMAIL_COLORS.teal}; text-decoration: none;">${brand.supportEmail}</a>
                &nbsp;·&nbsp; <a href="${url}" style="color: ${EMAIL_COLORS.teal}; text-decoration: none;">${brand.domain}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
