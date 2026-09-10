export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendTransactionalEmail(email: TransactionalEmail): Promise<boolean> {
  const { sendEmailSafely } = await import('../email/resend');
  const result = await sendEmailSafely({
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
  return result.success;
}
