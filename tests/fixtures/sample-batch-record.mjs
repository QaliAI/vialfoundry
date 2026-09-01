/**
 * TEST FIXTURE ONLY — NOT PRODUCTION DATA. NEVER IMPORT THIS FROM src/.
 *
 * This record is fictional and is labelled as such in every field so it cannot be
 * mistaken for, or accidentally shipped as, a real Certificate of Analysis. It
 * exists so the documentation-status logic can be tested with a "verified" lot
 * present, without any fabricated record living in customer-facing code.
 */
export const FIXTURE_LOT = 'FIXTURE-LOT-0000';

export const FIXTURE_BATCH_RECORD = {
  lotNumber: FIXTURE_LOT,
  productId: 'fixture-product',
  productName: 'Fixture Product (test data, not a real material)',
  issuedBy: 'Fixture Laboratory (test data, not a real laboratory)',
  testingDate: '2000-01-01',
  analyticalMethod: 'Fixture method (test data)',
  purity: 1,
};
