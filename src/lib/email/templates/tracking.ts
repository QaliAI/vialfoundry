import { getBrandConfig } from "../../../config/brand";

export function renderTrackingUpdateEmail(params: {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier?: string;
}) {
  const brand = getBrandConfig();
  const carrier = params.carrier || "USPS";
  const trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(params.trackingNumber)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="background-color: #08090b; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0d1117; border: 1px solid #1e293b; border-radius: 12px; padding: 32px;">
        
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #06b6d4; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">${brand.name.toUpperCase()}</h1>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Fulfillment &amp; Cold-Chain Tracking Update</p>
        </div>

        <p style="font-size: 15px; color: #e2e8f0;">Dear ${params.customerName},</p>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
          Your research order <strong>#${params.orderNumber}</strong> has shipped with temperature-controlled cold packaging.
        </p>

        <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-family: monospace;">${carrier} Tracking Number</div>
          <div style="font-size: 18px; font-weight: bold; color: #38bdf8; font-family: monospace; margin: 8px 0;">${params.trackingNumber}</div>
          <a href="${trackingUrl}" style="display: inline-block; background-color: #06b6d4; color: #08090b; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; margin-top: 8px;">
            Track Shipment &rarr;
          </a>
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
