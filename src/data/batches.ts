import type { BatchRecord, DocumentationStatus, Product } from '../types/index';
import { PRODUCTS } from './products';
import { VERIFIED_BATCH_RECORDS } from './verified-batch-records';

/**
 * Lot documentation lookup.
 *
 * This module deliberately contains no record generation. Documentation status is
 * a fact about what has been supplied, so it is derived only from
 * `VERIFIED_BATCH_RECORDS` and the catalog's own lot numbers.
 */

/** Records backed by an authentic supplied document. May legitimately be empty. */
export const BATCH_RECORDS: Record<string, BatchRecord> = VERIFIED_BATCH_RECORDS;

export function normalizeLot(lot: string): string {
  return lot.trim().toUpperCase();
}

/** Returns the authentic record for a lot, or null when none has been supplied. */
export function getBatchRecord(lot: string | undefined | null): BatchRecord | null {
  if (!lot) return null;
  return BATCH_RECORDS[normalizeLot(lot)] ?? null;
}

export function getDocumentationStatus(product: Pick<Product, 'lotNumber'>): DocumentationStatus {
  if (!product.lotNumber) return 'none';
  return getBatchRecord(product.lotNumber) ? 'verified' : 'pending';
}

export function getDocumentationStatusForLot(lot: string): DocumentationStatus {
  const normalized = normalizeLot(lot);
  if (getBatchRecord(normalized)) return 'verified';
  return PRODUCTS.some((p) => normalizeLot(p.lotNumber || '') === normalized) ? 'pending' : 'none';
}

/** The catalog product carrying this lot, if any. */
export function getProductForLot(lot: string): Product | null {
  const normalized = normalizeLot(lot);
  return PRODUCTS.find((p) => normalizeLot(p.lotNumber || '') === normalized) ?? null;
}

/** Number of lots with authentic documentation on file. Safe to display. */
export const VERIFIED_LOT_COUNT = Object.keys(BATCH_RECORDS).length;

/** Number of catalog lots awaiting authentic documentation. Safe to display. */
export const PENDING_LOT_COUNT = PRODUCTS.filter(
  (p) => p.lotNumber && !getBatchRecord(p.lotNumber)
).length;

export const HAS_VERIFIED_DOCUMENTATION = VERIFIED_LOT_COUNT > 0;

export const DOCUMENTATION_STATUS_LABEL: Record<DocumentationStatus, string> = {
  verified: 'Documentation on file',
  pending: 'Documentation pending',
  none: 'No lot record',
};
