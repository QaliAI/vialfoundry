import { NextResponse } from 'next/server';
import { BATCH_RECORDS } from '../../../data/batches';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lot = searchParams.get('lot')?.toUpperCase().trim();

  if (!lot) {
    return NextResponse.json({ success: false, error: 'Lot number required' }, { status: 400 });
  }

  const batch = BATCH_RECORDS[lot];
  if (!batch) {
    return NextResponse.json({ success: false, message: `No batch found for lot ${lot}` }, { status: 404 });
  }

  return NextResponse.json({ success: true, batch });
}
