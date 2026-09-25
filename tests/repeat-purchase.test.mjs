import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProductForReorder } from '../src/lib/commerce/repeat-purchase.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const mockCatalog = [
  {
    id: 'vf-std-001',
    sku: 'VF-BPC-5MG',
    name: 'BPC-157 5mg',
    purchasable: true,
  },
  {
    id: 'vf-std-002',
    sku: 'VF-TB-5MG',
    name: 'TB-500 5mg',
    purchasable: true,
  },
  {
    id: 'vf-std-010',
    sku: 'VF-BAC-10ML',
    name: 'Bacteriostatic Water 10ml',
    purchasable: false, // retired
  },
];

test('resolveProductForReorder matches catalog products by id, sku, or name', () => {
  // By ID
  const resolvedById = resolveProductForReorder(
    {
      productId: 'vf-std-001',
      productName: 'Different Name',
      quantity: 1,
    },
    mockCatalog,
  );
  assert.strictEqual(resolvedById?.id, 'vf-std-001');

  // By SKU
  const resolvedBySku = resolveProductForReorder(
    {
      sku: 'VF-TB-5MG',
      productName: 'Different Name',
      quantity: 1,
    },
    mockCatalog,
  );
  assert.strictEqual(resolvedBySku?.id, 'vf-std-002');

  // By Name
  const resolvedByName = resolveProductForReorder(
    {
      productName: 'bpc-157 5mg',
      quantity: 1,
    },
    mockCatalog,
  );
  assert.strictEqual(resolvedByName?.id, 'vf-std-001');
});

test('resolveProductForReorder refuses unpurchasable or retired products', () => {
  // Legacy bac water is retired/unpurchasable (vf-std-010)
  const legacy = resolveProductForReorder(
    {
      productId: 'vf-std-010',
      productName: 'Bacteriostatic Water 10ml',
      quantity: 1,
    },
    mockCatalog,
  );
  assert.strictEqual(legacy, undefined);
});

test('repeat purchase copy enforces strictly commercial language and NO medical claims', () => {
  const confirmationSrc = read('src/app/order-confirmation/[orderId]/page.tsx');
  const cartDrawerSrc = read('src/components/CartDrawer.tsx');
  const repeatHelperSrc = read('src/lib/commerce/repeat-purchase.mjs');

  const combined = `${confirmationSrc}\n${cartDrawerSrc}\n${repeatHelperSrc}`.toLowerCase();

  // Forbidden medical, dosing, clinical or therapeutic claims
  const forbiddenTerms = [
    'dosage',
    'dosing',
    'injection',
    'subcutaneous',
    'treatment',
    'cure',
    'heal',
    'bodybuilding',
    'weight loss',
    'human use',
    'protocol',
  ];

  for (const term of forbiddenTerms) {
    const occurrences = combined.split(term).length - 1;
    if (term === 'human use') {
      // Must be prefixed by "not for"
      assert.ok(
        combined.includes('not for human use'),
        'human use reference must be negative disclaimer',
      );
    } else {
      assert.strictEqual(
        occurrences,
        0,
        `Repeat purchase copy must not contain medical term "${term}"`,
      );
    }
  }

  // Commercial terms present
  assert.ok(
    combined.includes('reorder items') || combined.includes('reorder previous materials'),
    'must contain clear commercial reorder button copy',
  );
});
