import { NextRequest, NextResponse } from 'next/server';
import { lookupAffiliateByCode } from '@/lib/affiliates/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params?.code ? String(params.code).trim().toUpperCase() : '';
  const redirectUrl = new URL('/catalog', req.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  const affiliate = await lookupAffiliateByCode(code);

  if (affiliate && affiliate.status === 'active') {
    const supabase = createAdminClient();
    if (supabase && affiliate.id) {
      try {
        const { data: affRow } = await supabase
          .from('affiliates')
          .select('total_clicks_count')
          .eq('id', affiliate.id)
          .single();

        if (affRow) {
          await supabase
            .from('affiliates')
            .update({
              total_clicks_count: (affRow.total_clicks_count || 0) + 1,
              last_active_at: new Date().toISOString(),
            })
            .eq('id', affiliate.id);
        }
      } catch (err) {
        console.warn('[affiliates:clicks] Click count error:', err);
      }
    }

    redirectUrl.searchParams.set('ref', affiliate.code);
    const response = NextResponse.redirect(redirectUrl);

    // Set 30-day affiliate cookie
    response.cookies.set('vf_affiliate_code', affiliate.code, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  }

  return NextResponse.redirect(redirectUrl);
}
