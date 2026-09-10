/**
 * Transactional email identity. Pure so it can be unit-tested without Resend.
 *
 * Defaults:
 *   From:     Vial Foundry <orders@vialfoundry.com>
 *   Reply-To: TRANSACTIONAL_EMAIL_REPLY_TO, else support@vialfoundry.com
 */
import { sanitizeEnvValue } from "../env/sanitizer.mjs";

export function resolveEmailIdentity(env = process.env, brand = {}) {
  const senderName =
    sanitizeEnvValue(env.EMAIL_SENDER_NAME) || brand.emailSenderName || "Vial Foundry";
  const senderDomain =
    sanitizeEnvValue(env.EMAIL_SENDER_DOMAIN) || brand.emailSenderDomain || "vialfoundry.com";
  const transactionalFrom = sanitizeEnvValue(env.TRANSACTIONAL_EMAIL_FROM);
  const from = transactionalFrom
    ? transactionalFrom.includes("<")
      ? transactionalFrom
      : `${senderName} <${transactionalFrom}>`
    : `${senderName} <orders@${senderDomain}>`;

  const configuredReplyTo = sanitizeEnvValue(env.TRANSACTIONAL_EMAIL_REPLY_TO);
  const replyTo = configuredReplyTo || brand.supportEmail || "support@vialfoundry.com";

  return { senderName, senderDomain, from, replyTo };
}
