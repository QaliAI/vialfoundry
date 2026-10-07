export interface WelcomeEmailProps {
  unsubscribeToken?: string;
  customerEmail: string;
}

export function renderWelcomeEmail({ unsubscribeToken, customerEmail }: WelcomeEmailProps) {
  const unsubscribeUrl = unsubscribeToken
    ? `https://www.vialfoundry.com/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : `https://www.vialfoundry.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Vial Foundry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f1115; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f1115; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #161922; border-radius: 16px; border: 1px solid #232836; overflow: hidden; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; border-bottom: 1px solid #232836; background-color: #12141c;">
              <span style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; font-family: monospace;">VIAL FOUNDRY · RESEARCH MATERIALS</span>
              <h1 style="margin: 12px 0 0 0; font-size: 24px; font-weight: 700; color: #ffffff;">Welcome to Vial Foundry</h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Thank you for joining our research community. Vial Foundry provides standardized, lot-documented research peptides and analytical biochemicals for verified laboratory and institutional investigation.
              </p>

              <!-- Promo Code Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0; background-color: #0f1115; border: 1px solid #334155; border-radius: 12px; text-align: center;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #10b981; font-weight: 600;">First Order Privilege</div>
                    <div style="margin: 8px 0 4px 0; font-size: 28px; font-weight: 800; font-family: monospace; color: #ffffff; letter-spacing: 0.05em;">FOUNDRY20</div>
                    <div style="font-size: 14px; color: #94a3b8;">Take 20% off your initial order of research materials</div>
                    <div style="margin-top: 20px;">
                      <a href="https://www.vialfoundry.com/catalog?promo=FOUNDRY20" style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #0f1115; text-decoration: none; font-weight: 700; font-size: 13px; border-radius: 10px;">
                        Explore Research Catalog →
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Research Standards -->
              <h2 style="margin: 32px 0 12px 0; font-size: 16px; font-weight: 700; color: #ffffff;">Our Analytical Safeguards</h2>
              <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #94a3b8;">
                <li><strong style="color: #cbd5e1;">Lot-Specific Traceability:</strong> Every batch is documented with independent analytical testing records.</li>
                <li><strong style="color: #cbd5e1;">Transparent Quality Verification:</strong> Identity confirmed by Mass Spectrometry (MS) and purity by HPLC.</li>
                <li><strong style="color: #cbd5e1;">Rapid Standard Fulfillment:</strong> Secure temperature-managed shipping across the United States.</li>
              </ul>

              <!-- RUO Notice -->
              <div style="margin-top: 28px; padding: 16px; background-color: #12141c; border-left: 3px solid #64748b; border-radius: 6px; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                <strong style="color: #f1f5f9;">RESEARCH USE ONLY (RUO):</strong> All products offered by Vial Foundry are strictly intended for in vitro laboratory research and academic analysis. Products are not drugs, foods, cosmetics, or medical devices and are not intended for human or animal application.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #101218; border-top: 1px solid #232836; text-align: center; font-size: 11px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 8px 0;">Vial Foundry LLC · Research Materials Division</p>
              <p style="margin: 0;">
                You received this email because you subscribed on vialfoundry.com. 
                <br>
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from marketing emails</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to Vial Foundry.

Thank you for joining our research community. Vial Foundry provides standardized, lot-documented research peptides and analytical biochemicals for laboratory and institutional investigation.

YOUR FIRST ORDER PRIVILEGE:
Use code FOUNDRY20 at checkout for 20% off your initial order of research materials.
Explore catalog: https://www.vialfoundry.com/catalog?promo=FOUNDRY20

RESEARCH USE ONLY (RUO):
All materials are strictly for in vitro laboratory research and academic analysis. Not for human or animal consumption.

To unsubscribe from marketing emails:
${unsubscribeUrl}
`;

  return { html, text };
}
