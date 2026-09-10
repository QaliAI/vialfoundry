import {
  EMAIL_COLORS,
  escapeHtml,
  money,
  renderEmailShell,
  totalRow,
} from "./layout";

/**
 * Internal new-order notification for the operations desk.
 *
 * Deliberately different from the customer confirmation: this one leads with
 * what the desk has to act on - who ordered, how much, how they intend to pay,
 * and whether payment has actually been received yet.
 */
export function renderInternalOrderNotificationEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  items: Array<{ name: string; quantity: number; lineTotalCents?: number; sku?: string | null }>;
  subtotalCents: number;
  discountCents?: number;
  shippingCents: number;
  totalCents: number;
  paymentMethod: string;
  /** Real payment state. Manual-invoice orders are unpaid until reconciled. */
  paymentStatus: string;
  shippingAddress: Record<string, string>;
  promoCode?: string | null;
  affiliateCode?: string | null;
  isTest?: boolean;
  notes?: string | null;
  adminOrderUrl?: string | null;
}) {
  const rows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; font-size: 14px; color: ${EMAIL_COLORS.text};">
          ${escapeHtml(item.name)}
          ${item.sku ? `<span style="color: ${EMAIL_COLORS.textMuted};"> · ${escapeHtml(item.sku)}</span>` : ""}
          <span style="color: ${EMAIL_COLORS.textMuted};">&nbsp;×&nbsp;${item.quantity}</span>
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; font-size: 14px; color: ${EMAIL_COLORS.text}; white-space: nowrap;">
          ${money(item.lineTotalCents || 0)}
        </td>
      </tr>`,
    )
    .join("");

  const addr = params.shippingAddress || {};
  const addressLines = [
    addr.firstName || addr.lastName
      ? `${addr.firstName || ""} ${addr.lastName || ""}`.trim()
      : addr.name,
    addr.company,
    addr.line1 || addr.address1 || addr.street,
    addr.line2 || addr.address2,
    [addr.city, addr.state, addr.postalCode || addr.zip].filter(Boolean).join(", "),
    addr.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br />");

  const field = (label: string, value: string) => `
    <tr>
      <td style="padding: 5px 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; width: 42%;">${label}</td>
      <td style="padding: 5px 0; font-size: 13px; color: ${EMAIL_COLORS.text}; font-weight: 600;">${value}</td>
    </tr>`;

  const unpaid = params.paymentStatus.toLowerCase() !== "paid";

  const body = `
    ${
      params.isTest
        ? `<div style="margin: 0 0 20px 0; padding: 10px 14px; border-radius: 8px; background-color: #FEF3C7; border: 1px solid #F59E0B; font-size: 13px; font-weight: 700; color: #92400E;">
             QA TEST ORDER — excluded from revenue reporting. Do not fulfil.
           </div>`
        : ""
    }

    <div style="font-size: 22px; font-weight: 700; color: ${EMAIL_COLORS.midnight}; margin: 0 0 2px 0;">
      New order ${escapeHtml(params.orderNumber)}
    </div>
    <div style="font-size: 15px; color: ${EMAIL_COLORS.textMuted}; margin: 0 0 22px 0;">
      ${escapeHtml(params.customerName)} · ${money(params.totalCents)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color: ${unpaid ? "#FFF7ED" : "#F0FDF4"}; border: 1px solid ${unpaid ? "#FDBA74" : "#86EFAC"}; border-radius: 10px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 14px 18px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${unpaid ? "#9A3412" : "#166534"};">
            Payment status
          </div>
          <div style="font-size: 16px; font-weight: 700; color: ${unpaid ? "#9A3412" : "#166534"}; margin-top: 4px;">
            ${escapeHtml(params.paymentStatus.toUpperCase())}
            <span style="font-weight: 400; font-size: 14px;"> · intends to pay by ${escapeHtml(params.paymentMethod)}</span>
          </div>
        </td>
      </tr>
    </table>

    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted}; margin: 0 0 6px 0;">Customer</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px;">
      ${field("Name", escapeHtml(params.customerName))}
      ${field("Email", `<a href="mailto:${escapeHtml(params.customerEmail)}" style="color: ${EMAIL_COLORS.teal}; text-decoration: none;">${escapeHtml(params.customerEmail)}</a>`)}
      ${params.customerPhone ? field("Phone", escapeHtml(params.customerPhone)) : ""}
      ${params.promoCode ? field("Promo code", escapeHtml(params.promoCode)) : ""}
      ${params.affiliateCode ? field("Affiliate", escapeHtml(params.affiliateCode)) : ""}
    </table>

    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted}; margin: 0 0 4px 0;">Items</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">
      ${totalRow("Subtotal", money(params.subtotalCents))}
      ${params.discountCents ? totalRow("Discount", `−${money(params.discountCents)}`, { positive: true }) : ""}
      ${totalRow("Shipping", params.shippingCents === 0 ? "Included" : money(params.shippingCents))}
      ${totalRow("Total", money(params.totalCents), { emphasis: true })}
    </table>

    ${
      addressLines
        ? `<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted}; margin: 24px 0 6px 0;">Ship to</div>
           <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.text};">${addressLines}</p>`
        : ""
    }

    ${
      params.notes
        ? `<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.textMuted}; margin: 22px 0 6px 0;">Customer notes</div>
           <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.text};">${escapeHtml(params.notes)}</p>`
        : ""
    }

    ${
      params.adminOrderUrl
        ? `<p style="margin: 28px 0 0 0;">
             <a href="${escapeHtml(params.adminOrderUrl)}"
                style="display: inline-block; background-color: ${EMAIL_COLORS.midnight}; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-size: 14px;">
               Open in admin
             </a>
           </p>`
        : ""
    }
  `;

  return {
    html: renderEmailShell({
      eyebrow: params.isTest ? "New order · QA test" : "New order",
      preheader: `${params.orderNumber} · ${params.customerName} · ${money(params.totalCents)} · ${params.paymentStatus}`,
      body,
    }),
  };
}
