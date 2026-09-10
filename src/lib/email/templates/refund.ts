import {
  EMAIL_COLORS,
  escapeHtml,
  money,
  renderEmailShell,
} from "./layout";

export function renderRefundConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  refundedCents: number;
  fullyRefunded: boolean;
}) {
  const body = `
    <p style="margin: 0 0 4px 0; font-size: 16px;">Dear ${escapeHtml(params.customerName || "researcher")},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: ${EMAIL_COLORS.textMuted};">
      ${
        params.fullyRefunded
          ? `We have refunded order <strong style="color: ${EMAIL_COLORS.text};">#${escapeHtml(params.orderNumber)}</strong> in full.`
          : `A partial refund has been issued on order <strong style="color: ${EMAIL_COLORS.text};">#${escapeHtml(params.orderNumber)}</strong>.`
      }
    </p>
    <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${EMAIL_COLORS.midnight};">
      Refund amount: ${money(params.refundedCents)}
    </p>
    <p style="margin: 16px 0 0 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">
      It can take a few business days to appear on the original payment method.
    </p>
  `;

  return {
    html: renderEmailShell({
      eyebrow: params.fullyRefunded ? "Refund issued" : "Partial refund issued",
      preheader: `Refund of ${money(params.refundedCents)} for order ${params.orderNumber}`,
      body,
    }),
  };
}
