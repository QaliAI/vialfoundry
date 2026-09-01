import type { BatchRecord } from '../types/index';

/**
 * AUTHENTIC BATCH RECORDS — the only source of "verified documentation" on this site.
 *
 * Add an entry here ONLY when you physically hold the corresponding signed
 * Certificate of Analysis for that exact lot, and transcribe it field-for-field.
 * Put the source document in `public/documents/coa/` and reference it as
 * `documentUrl` so buyers can read the original rather than our transcription.
 *
 * Rules, in order of importance:
 *   1. Never add a record for a lot you do not hold a document for.
 *   2. Never estimate, interpolate, round or "fill in" a field. Omit it instead.
 *   3. Never name a testing laboratory that did not perform the test.
 *
 * Anything not listed here renders as DOCUMENTATION PENDING, which is an honest
 * and perfectly saleable state. A fabricated certificate is not.
 *
 * Keys are lot numbers, uppercased, matching `Product.lotNumber`.
 */
export const VERIFIED_BATCH_RECORDS: Record<string, BatchRecord> = {
  // Example of the expected shape (kept commented so it can never render):
  //
  // 'LOT-VF-8842': {
  //   lotNumber: 'LOT-VF-8842',
  //   productId: 'vf-std-001',
  //   productName: 'BPC-157 Reference Standard',
  //   issuedBy: 'Name exactly as printed on the certificate',
  //   testingDate: '2026-07-14',
  //   analyticalMethod: 'RP-HPLC (UV 214 nm)',
  //   purity: 99.64,
  //   documentUrl: '/documents/coa/LOT-VF-8842.pdf',
  // },
};
