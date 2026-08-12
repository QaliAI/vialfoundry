export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendTransactionalEmail(email: TransactionalEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRANSACTIONAL_EMAIL_FROM || 'support@vialfoundry.com';

  if (!apiKey) {
    console.log(`[Email Adapter Log] Simulating email to ${email.to}: Subject "${email.subject}"`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        html: email.html
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[Email Adapter Error]', err);
    return false;
  }
}
