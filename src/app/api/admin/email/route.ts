import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, requireAdminActor } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmailSafely } from '@/lib/email/resend';
import { logAdminAudit } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

const PROHIBITED_RUO_TERMS = [
  'human use',
  'human consumption',
  'dose',
  'dosing',
  'inject',
  'injection',
  'cure',
  'treatment',
  'therapy',
  'patient',
  'subcutaneous',
  'intramuscular',
  'clinical outcome',
];

function checkRuoViolations(text: string): string[] {
  const lower = text.toLowerCase();
  return PROHIBITED_RUO_TERMS.filter((term) => lower.includes(term));
}

function renderCampaignHtml(campaign: any, recipientEmail: string, unsubscribeToken?: string): string {
  const bodyText = campaign.content?.body || '';
  const ctaLabel = campaign.content?.ctaLabel || 'View Research Catalog';
  const ctaUrl = campaign.content?.ctaUrl || 'https://www.vialfoundry.com/catalog';
  const unsubscribeUrl = unsubscribeToken
    ? `https://www.vialfoundry.com/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : `https://www.vialfoundry.com/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0f1115; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #161922; border-radius: 16px; border: 1px solid #232836; overflow: hidden; text-align: left;">
          <tr>
            <td style="padding: 32px 36px; border-bottom: 1px solid #232836; background-color: #12141c;">
              <span style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; font-family: monospace;">VIAL FOUNDRY · RESEARCH MATERIALS</span>
              <h1 style="margin: 12px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">${campaign.subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <div style="font-size: 15px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap;">${bodyText}</div>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${ctaUrl}" style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #0f1115; text-decoration: none; font-weight: 700; font-size: 13px; border-radius: 10px;">
                  ${ctaLabel} →
                </a>
              </div>

              <div style="margin-top: 32px; padding: 14px; background-color: #12141c; border-left: 3px solid #64748b; border-radius: 6px; font-size: 11px; line-height: 1.5; color: #94a3b8;">
                <strong style="color: #f1f5f9;">RESEARCH USE ONLY:</strong> All materials are strictly for in vitro laboratory and academic analysis. Not intended for human or animal application.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px; background-color: #101218; border-top: 1px solid #232836; text-align: center; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 6px 0;">Vial Foundry LLC · Research Materials</p>
              <p style="margin: 0;"><a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from marketing emails</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const actor = (await requireAdminActor()) || 'admin';
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { operation, campaign, id, recipient } = body;

    if (operation === 'campaign_create') {
      const violations = checkRuoViolations(`${campaign.subject} ${campaign.content?.body || ''}`);
      if (violations.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `RUO Safeguard Violation: The email content contains prohibited terms [${violations.join(', ')}]. Please remove medical/dosing claims before saving.`,
          },
          { status: 400 }
        );
      }

      const slug = (campaign.name || 'campaign')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .concat(`-${Date.now().toString().slice(-4)}`);

      const { data: created, error } = await supabase
        .from('marketing_campaigns')
        .insert({
          name: campaign.name,
          slug,
          subject: campaign.subject,
          preheader: campaign.preheader || null,
          audience_type: campaign.audience_type || 'marketing_subscribers',
          content: campaign.content || {},
          status: 'draft',
          created_by: actor,
        })
        .select()
        .single();

      if (error) throw error;

      await logAdminAudit({
        actor,
        action: 'MARKETING_CAMPAIGN_CREATE',
        entityType: 'marketing_campaign',
        entityId: created.id,
        after: created,
      });

      return NextResponse.json({ success: true, campaign: created });
    }

    if (operation === 'campaign_test') {
      const targetEmail = recipient || process.env.ADMIN_NOTIFICATION_EMAIL || 'support@vialfoundry.com';

      // Load campaign
      const { data: campRow, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !campRow) {
        return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
      }

      const html = renderCampaignHtml(campRow, targetEmail);
      const res = await sendEmailSafely({
        to: targetEmail,
        subject: `[TEST PREVIEW] ${campRow.subject}`,
        html,
      });

      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error || 'Test send failed' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Test email dispatched to ${targetEmail}` });
    }

    if (operation === 'campaign_send') {
      const { data: campRow, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !campRow) {
        return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
      }

      const violations = checkRuoViolations(`${campRow.subject} ${campRow.content?.body || ''}`);
      if (violations.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `RUO Guard Blocked Send: Content contains prohibited terms [${violations.join(', ')}].`,
          },
          { status: 400 }
        );
      }

      // Fetch opted-in subscribers
      const { data: subscribers, error: subErr } = await supabase
        .from('email_subscribers')
        .select('email, unsubscribe_token')
        .eq('marketing_opt_in', true)
        .is('unsubscribed_at', null);

      if (subErr || !Array.isArray(subscribers) || subscribers.length === 0) {
        return NextResponse.json({ success: false, error: 'No active opted-in subscribers found' }, { status: 400 });
      }

      let delivered = 0;
      let failed = 0;

      for (const sub of subscribers) {
        const html = renderCampaignHtml(campRow, sub.email, sub.unsubscribe_token);
        const res = await sendEmailSafely({
          to: sub.email,
          subject: campRow.subject,
          html,
        });

        if (res.success) {
          delivered++;
        } else {
          failed++;
        }
      }

      await supabase
        .from('marketing_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipient_count: subscribers.length,
          delivered_count: delivered,
          failed_count: failed,
        })
        .eq('id', id);

      await logAdminAudit({
        actor,
        action: 'MARKETING_CAMPAIGN_SEND',
        entityType: 'marketing_campaign',
        entityId: id,
        after: { recipients: subscribers.length, delivered, failed },
      });

      return NextResponse.json({
        success: true,
        message: `Campaign broadcast complete: ${delivered} delivered, ${failed} failed.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid operation' }, { status: 400 });
  } catch (err: any) {
    console.error('[api/admin/email] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
