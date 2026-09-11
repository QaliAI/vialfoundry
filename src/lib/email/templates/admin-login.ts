import { escapeHtml, renderEmailShell } from "./layout";

export function renderAdminLoginEmail(params: {
  name: string;
  loginUrl: string;
  expiresMinutes: number;
}) {
  const body = `
    <p style="margin: 0 0 4px 0; font-size: 16px;">Hello ${escapeHtml(params.name || "there")},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px;">
      Use this single-use link to sign in to the Vial Foundry Admin Console.
      It expires in ${params.expiresMinutes} minutes.
    </p>
    <p style="margin: 0 0 24px 0;">
      <a href="${escapeHtml(params.loginUrl)}"
         style="display: inline-block; background-color: #0F2740; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-size: 14px;">
        Sign in to Admin
      </a>
    </p>
    <p style="margin: 0; font-size: 13px; color: #5B7183;">
      If you did not request this, you can ignore the email. The link cannot be reused.
    </p>
  `;

  return {
    html: renderEmailShell({
      eyebrow: "Admin sign-in",
      preheader: "Your Vial Foundry admin login link",
      body,
    }),
  };
}

export function renderAdminInviteEmail(params: {
  name: string;
  loginUrl: string;
  supportEmail: string;
}) {
  const body = `
    <p style="margin: 0 0 4px 0; font-size: 16px;">Hello ${escapeHtml(params.name)},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px;">
      You have been granted access to the Vial Foundry Admin Console.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px;">
      Sign in with your email at
      <a href="${escapeHtml(params.loginUrl)}" style="color: #2F9E9A; font-weight: 600;">${escapeHtml(params.loginUrl)}</a>.
      We will email you a single-use login link each time. There is no shared password.
    </p>
    <p style="margin: 0; font-size: 13px; color: #5B7183;">
      Questions? ${escapeHtml(params.supportEmail)}
    </p>
  `;

  return {
    html: renderEmailShell({
      eyebrow: "Admin access",
      preheader: "You have been granted access to the Vial Foundry Admin Console.",
      body,
    }),
  };
}
