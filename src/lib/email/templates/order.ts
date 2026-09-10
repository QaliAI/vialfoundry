import { getBrandConfig } from "../../../config/brand";
import { getManualPaymentConfig } from "../../manual-orders/payment-config";
import {
  EMAIL_COLORS,
  escapeHtml,
  money,
  panel,
  panelRow,
  renderEmailShell,
  totalRow,
} from "./layout";

export function renderOrderConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; unitPriceCents?: number; lineTotalCents?: number }>;
  subtotalCents: number;
  discountCents?: number;
  shippingCents: number;
  totalCents: number;
  paymentMethod: string;
  shippingAddress: Record<string, string>;
}) {
  const brand = getBrandConfig();
  const paymentConfig = getManualPaymentConfig();

  const itemRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; font-size: 14px; color: ${EMAIL_COLORS.text};">
          ${escapeHtml(item.name)}
          <span style="color: ${EMAIL_COLORS.textMuted};">&nbsp;×&nbsp;${item.quantity}</span>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; font-size: 14px; color: ${EMAIL_COLORS.text}; white-space: nowrap;">
          ${money(item.lineTotalCents || 0)}
        </td>
      </tr>`,
    )
    .join("");

  let paymentPanel: string;
  if (params.paymentMethod === "zelle") {
    paymentPanel = panel(
      "Zelle payment instructions",
      panelRow("Recipient", escapeHtml(paymentConfig.zelleRecipientName)) +
        panelRow("Zelle email / phone", escapeHtml(paymentConfig.zelleEmail)) +
        panelRow("Required memo", escapeHtml(params.orderNumber)),
    );
  } else if (params.paymentMethod === "venmo") {
    paymentPanel = panel(
      "Venmo payment instructions",
      panelRow("Venmo handle", escapeHtml(paymentConfig.venmoHandle)) +
        panelRow("Required note", escapeHtml(params.orderNumber)),
    );
  } else {
    paymentPanel = panel(
      "Direct laboratory invoice",
      `<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};">
         Our procurement desk will confirm batch availability and issue formal payment
         instructions for order ${escapeHtml(params.orderNumber)}.
       </p>`,
    );
  }

  const addr = params.shippingAddress || {};
  const addressLines = [
    addr.name,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br />");

  const body = `
    <p style="margin: 0 0 4px 0; font-size: 16px;">Dear ${escapeHtml(params.customerName)},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: ${EMAIL_COLORS.textMuted};">
      We have received your research order request
      <strong style="color: ${EMAIL_COLORS.text};">#${escapeHtml(params.orderNumber)}</strong>.
      ${escapeHtml(brand.checkoutNotice)}
    </p>

    ${paymentPanel}

    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted}; margin: 28px 0 4px 0;">Order summary</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${itemRows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
      ${totalRow("Subtotal", money(params.subtotalCents))}
      ${params.discountCents ? totalRow("Discount", `−${money(params.discountCents)}`, { positive: true }) : ""}
      ${totalRow("Shipping", params.shippingCents === 0 ? "Included" : money(params.shippingCents))}
      ${totalRow("Total", money(params.totalCents), { emphasis: true })}
    </table>

    ${
      addressLines
        ? `<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted}; margin: 28px 0 6px 0;">Shipping to</div>
           <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.text};">${addressLines}</p>`
        : ""
    }
  `;

  return {
    html: renderEmailShell({
      eyebrow: "Order confirmation",
      preheader: `Order ${params.orderNumber} received — ${money(params.totalCents)}`,
      body,
    }),
  };
}
