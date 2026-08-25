import { getBrandConfig } from "../../../config/brand";
import { getManualPaymentConfig } from "../../manual-orders/payment-config";

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
        <td style="padding: 10px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-family: monospace; font-size: 13px;">
          <strong>${item.name}</strong> × ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #1e293b; text-align: right; color: #38bdf8; font-family: monospace; font-size: 13px;">
          $${((item.lineTotalCents || 0) / 100).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  let paymentInstructionsHtml = "";
  if (params.paymentMethod === "zelle") {
    paymentInstructionsHtml = `
      <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #38bdf8; margin-top: 0; font-family: sans-serif; font-size: 16px;">Zelle Payment Instructions</h3>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Recipient Name:</strong> ${paymentConfig.zelleRecipientName}</p>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Zelle Email / Phone:</strong> ${paymentConfig.zelleEmail}</p>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Required Memo:</strong> ${params.orderNumber}</p>
      </div>
    `;
  } else if (params.paymentMethod === "venmo") {
    paymentInstructionsHtml = `
      <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #38bdf8; margin-top: 0; font-family: sans-serif; font-size: 16px;">Venmo Payment Instructions</h3>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Venmo Handle:</strong> ${paymentConfig.venmoHandle}</p>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Required Note:</strong> Include ${params.orderNumber} in note</p>
      </div>
    `;
  } else {
    paymentInstructionsHtml = `
      <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #38bdf8; margin-top: 0; font-family: sans-serif; font-size: 16px;">Direct Laboratory Invoice</h3>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;">Our procurement desk will verify batch availability and issue formal payment instructions.</p>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="background-color: #08090b; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0d1117; border: 1px solid #1e293b; border-radius: 12px; padding: 32px;">
        
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #06b6d4; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">${brand.name.toUpperCase()}</h1>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Research Materials &amp; Reference Standards Procurement</p>
        </div>

        <p style="font-size: 15px; color: #e2e8f0;">Dear ${params.customerName},</p>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
          Your research order request <strong>#${params.orderNumber}</strong> has been received and logged in our system.
        </p>

        ${paymentInstructionsHtml}

        <h3 style="color: #f8fafc; font-size: 15px; margin-top: 24px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          ${itemRows}
        </table>

        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #1e293b; font-family: monospace; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
            <span>Subtotal:</span>
            <span>$${(params.subtotalCents / 100).toFixed(2)}</span>
          </div>
          ${
            params.discountCents
              ? `<div style="display: flex; justify-content: space-between; color: #34d399; margin-bottom: 4px;">
                  <span>Discount:</span>
                  <span>-$${(params.discountCents / 100).toFixed(2)}</span>
                </div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
            <span>Shipping:</span>
            <span>$${(params.shippingCents / 100).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #38bdf8; font-weight: bold; font-size: 15px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #334155;">
            <span>Total:</span>
            <span>$${(params.totalCents / 100).toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; line-height: 1.4;">
          <p><strong>Research Use Only:</strong> ${brand.researchUseOnlyDisclaimer}</p>
          <p>Questions? Contact <a href="mailto:${brand.supportEmail}" style="color: #38bdf8;">${brand.supportEmail}</a></p>
        </div>

      </div>
    </body>
    </html>
  `;

  return { html };
}
