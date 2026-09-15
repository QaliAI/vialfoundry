import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');

  const { data, error } = await supabase
    .from('email_subscribers')
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/subscribers] query error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const subscribers = data || [];

  if (format === 'csv') {
    const csvRows = [
      'ID,Email,Source,Created At',
      ...subscribers.map(
        (s: any) =>
          `"${s.id}","${String(s.email).replace(/"/g, '""')}","${String(s.source || '').replace(/"/g, '""')}","${s.created_at || ''}"`
      ),
    ];
    const csvContent = csvRows.join('\n');
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="vialfoundry-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    count: subscribers.length,
    subscribers,
  });
}
