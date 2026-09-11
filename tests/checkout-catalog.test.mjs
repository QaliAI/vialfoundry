import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS } from "../src/data/products.ts";
import {
  UNKNOWN_PRODUCT_ERROR,
  resolveCatalogProduct,
  validateCheckoutItem,
  authoritativeUnitPriceCents,
  assertSufficientStock,
} from "../src/lib/manual-orders/checkout-catalog.mjs";

const bpc = PRODUCTS.find((p) => p.id === "vf-std-001");

test("unknown product id is rejected", () => {
  const r = validateCheckoutItem({ productId: "no-such-product", quantity: 1, unitPriceAmount: 1 }, PRODUCTS);
  assert.equal(r.ok, false);
  assert.equal(r.error, UNKNOWN_PRODUCT_ERROR);
});

test("unknown SKU is rejected", () => {
  const r = validateCheckoutItem({ sku: "FAKE-SKU-000", quantity: 1, unitPriceAmount: 99999 }, PRODUCTS);
  assert.equal(r.ok, false);
  assert.equal(r.error, UNKNOWN_PRODUCT_ERROR);
});

test("product name is not sufficient authority", () => {
  assert.equal(resolveCatalogProduct({ productName: bpc.name, quantity: 1 }, PRODUCTS), null);
  const r = validateCheckoutItem({ productName: bpc.name, quantity: 1, unitPriceAmount: 1 }, PRODUCTS);
  assert.equal(r.ok, false);
});

test("mismatched id and SKU is rejected", () => {
  const other = PRODUCTS.find((p) => p.id !== bpc.id);
  const r = validateCheckoutItem(
    { productId: bpc.id, sku: other.sku, quantity: 1, unitPriceAmount: 1 },
    PRODUCTS,
  );
  assert.equal(r.ok, false);
});

test("client price manipulation is ignored; real SKU is charged catalog price", () => {
  const r = validateCheckoutItem(
    { productId: bpc.id, sku: bpc.sku, quantity: 2, unitPriceAmount: 1 },
    PRODUCTS,
  );
  assert.equal(r.ok, true);
  assert.equal(r.unit_price_amount, authoritativeUnitPriceCents(bpc));
  assert.equal(r.unit_price_amount, Math.round(bpc.price * 100));
  assert.notEqual(r.unit_price_amount, 1);
  assert.equal(r.line_total_amount, Math.round(bpc.price * 100) * 2);
});

test("hidden catalog SKUs cannot be purchased on the public checkout", () => {
  const hidden = PRODUCTS.find((p) => p.hiddenFromCatalogReason);
  assert.ok(hidden);
  const r = validateCheckoutItem({ productId: hidden.id, quantity: 1 }, PRODUCTS);
  assert.equal(r.ok, false);
  assert.equal(r.error, UNKNOWN_PRODUCT_ERROR);
});

test("live on-hand stock, not build-time stockCount, gates checkout", () => {
  assert.equal(assertSufficientStock(10, 11, "BPC-157").ok, false);
  assert.equal(assertSufficientStock(10, 10, "BPC-157").ok, true);
  assert.equal(assertSufficientStock(0, 1, "BPC-157").ok, false);
  assert.equal(assertSufficientStock(50, 1, "BPC-157").ok, true);
});
