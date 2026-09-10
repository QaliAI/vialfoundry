import {
  EMAIL_COLORS,
  escapeHtml,
  renderEmailShell,
} from "./layout";

export function renderTrackingUpdateEmail(params: {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier?: string;
}) {
  const carrier = params.carrier || "USPS";
  const trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(params.trackingNumber)}`;

  const body = `
    <p style="margin: 0 0 4px 0; font-size: 16px;">Dear ${escapeHtml(params.customerName)},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: ${EMAIL_COLORS.textMuted};">
      Your research order
      <strong style="color: ${EMAIL_COLORS.text};">#${escapeHtml(params.orderNumber)}</strong>
      has shipped.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color: ${EMAIL_COLORS.cloud}; border: 1px solid ${EMAIL_COLORS.border}; border-radius: 10px;">
      <tr>
        <td align="center" style="padding: 24px 20px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted};">
            ${escapeHtml(carrier)} tracking number
          </div>
          <div style="font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.midnight}; margin: 10px 0 18px 0; letter-spacing: 0.02em;">
            ${escapeHtml(params.trackingNumber)}
          </div>
          <a href="${trackingUrl}"
             style="display: inline-block; background-color: ${EMAIL_COLORS.midnight}; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-size: 14px;">
            Track shipment
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted};">
      Tracking can take up to 24 hours to update after we ship.
    </p>
  `;

  return {
    html: renderEmailShell({
      eyebrow: "Your order has shipped",
      preheader: `Order ${params.orderNumber} shipped — ${carrier} ${params.trackingNumber}`,
      body,
    }),
  };
}
