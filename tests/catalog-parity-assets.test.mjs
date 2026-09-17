import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS, PUBLIC_PRODUCTS } from '../src/data/products.ts';

const manifest = JSON.parse(
  fs.readFileSync(new URL('./fixtures/goldmine-parity-manifest.json', import.meta.url), 'utf8')
);

test('required source families and configurations have public purchasable Vial SKUs', () => {
  assert.equal(manifest.configurations.length, manifest.expectedConfigurations);
  assert.equal(new Set(manifest.configurations.map((item) => item.family)).size, manifest.expectedFamilies);

  for (const required of manifest.configurations) {
    const product = PRODUCTS.find((item) => item.sku === required.vialSku);
    assert.ok(product, `Missing Vial SKU ${required.vialSku}`);
    assert.equal(product.familyId, required.family, `${required.vialSku} family mismatch`);
    assert.equal(product.displaySize, required.configuration, `${required.vialSku} configuration mismatch`);
    assert.equal(product.catalogStatus, 'public', `${required.vialSku} is unexpectedly hidden`);
    assert.equal(product.purchasable, true, `${required.vialSku} is not purchasable`);

    const skuNumber = Number(product.sku.replace('VF-SKU-', ''));
    if (skuNumber >= 1021) {
      assert.equal(product.stockCount, required.sourceInventory, `${required.vialSku} inventory mismatch`);
    }
  }
});

test('every public SKU has unique dedicated Vial assets and explicit inventory state', () => {
  const images = new Set();
  for (const product of PUBLIC_PRODUCTS) {
    assert.equal(product.catalogStatus, 'public');
    assert.equal(product.purchasable, true);
    assert.equal(typeof product.stockCount, 'number');
    assert.ok(product.stockCount >= 0);
    assert.match(product.sku, /^VF-SKU-/);
    assert.ok(!/default|fallback|generic|goldmine|resq/i.test(product.image), product.image);
    assert.ok(!images.has(product.image), `Shared public image: ${product.image}`);
    images.add(product.image);

    for (const asset of [product.image, product.transparentImage]) {
      const diskPath = path.join(process.cwd(), 'public', asset.replace(/^\//, '').replace(/^assets[\\/]/, 'assets/'));
      assert.ok(fs.existsSync(diskPath), `Missing asset ${asset}`);
      assert.ok(fs.statSync(diskPath).size > 10_000, `Asset is unexpectedly small: ${asset}`);
    }
  }
});

test('retired and hidden SKUs are never purchasable', () => {
  const legacyBac = PRODUCTS.find((product) => product.sku === 'VF-SKU-1000');
  assert.equal(legacyBac.catalogStatus, 'retired');
  assert.equal(legacyBac.purchasable, false);

  for (const product of PRODUCTS.filter((item) => item.catalogStatus !== 'public')) {
    assert.equal(product.purchasable, false, `${product.sku} must be non-purchasable`);
  }
});

test('customer-facing source contains no source-brand terminology', () => {
  const roots = ['src', 'public'];
  const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.svg', '.txt', '.css', '.html']);
  const offenders = [];

  const walk = (entry) => {
    for (const dirent of fs.readdirSync(entry, { withFileTypes: true })) {
      const file = path.join(entry, dirent.name);
      if (dirent.isDirectory()) walk(file);
      else if (textExtensions.has(path.extname(file).toLowerCase())) {
        const text = fs.readFileSync(file, 'utf8');
        if (/Goldmine Peptides|GMP-|goldmine-/i.test(text)) offenders.push(file);
      }
    }
  };

  roots.forEach((root) => walk(path.join(process.cwd(), root)));
  assert.deepEqual(offenders, []);
});
