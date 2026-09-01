import { NextResponse } from 'next/server';
import {
  getBatchRecord,
  getProductForLot,
  normalizeLot,
} from '../../../data/batches';

/**
 * Lot documentation lookup.
 *
 * Returns one of three explicit states. A lot we ship but hold no certificate for
 * is `pending` — never an implied pass, and never a generated record.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('lot');

  if (!raw || !raw.trim()) {
    return NextResponse.json({ success: false, error: 'Lot number required' }, { status: 400 });
  }

  const lot = normalizeLot(raw);
  const batch = getBatchRecord(lot);

  if (batch) {
    return NextResponse.json({ success: true, status: 'verified', lot, batch });
  }

  const product = getProductForLot(lot);
  if (product) {
    return NextResponse.json({
      success: true,
      status: 'pending',
      lot,
      product: { id: product.id, name: product.name },
      message: `Lot ${lot} is a catalog lot, but no certificate of analysis has been supplied for it yet.`,
    });
  }

  return NextResponse.json(
    { success: false, status: 'none', lot, message: `No lot matching ${lot} in the catalog.` },
    { status: 404 }
  );
}
