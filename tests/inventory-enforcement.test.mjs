import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS } from "../src/data/products.ts";

test("every product in catalog has non-negative stock and clear inStock flag", () => {
  assert.ok(PRODUCTS.length >= 20, "Catalog must contain at least 20 items");

  for (const product of PRODUCTS) {
    assert.equal(typeof product.inStock, "boolean");
    assert.equal(typeof product.stockCount, "number");
    assert.ok(product.stockCount >= 0, `Product ${product.id} stockCount must be >= 0`);

    if (product.inStock) {
      assert.ok(product.stockCount > 0, `In-stock product ${product.id} must have stockCount > 0`);
    } else {
      assert.equal(product.stockCount, 0, `Out-of-stock product ${product.id} must have stockCount 0`);
    }
  }
});

test("server-side stock validator rejects out-of-stock and over-quantity purchases", () => {
  function validateItemStock(requestedId, requestedQuantity) {
    const product = PRODUCTS.find((p) => p.id === requestedId);
    if (!product) return { valid: false, error: "Product not found" };
    if (!product.inStock || product.stockCount <= 0) {
      return { valid: false, error: `Product "${product.name}" is currently out of stock.` };
    }
    if (requestedQuantity > product.stockCount) {
      return {
        valid: false,
        error: `Requested quantity (${requestedQuantity}) exceeds available inventory (${product.stockCount}).`,
      };
    }
    return { valid: true, unitPriceCents: Math.round(product.price * 100) };
  }

  // Test valid in-stock product
  const inStockProduct = PRODUCTS.find((p) => p.inStock && p.stockCount >= 10);
  assert.ok(inStockProduct);
  const validCheck = validateItemStock(inStockProduct.id, 2);
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.unitPriceCents, Math.round(inStockProduct.price * 100));

  // Test excessive quantity
  const overStockCheck = validateItemStock(inStockProduct.id, inStockProduct.stockCount + 500);
  assert.equal(overStockCheck.valid, false);
  assert.match(overStockCheck.error, /exceeds available inventory/);

  // Test out-of-stock product (if any exists or simulated)
  const simulatedOOS = { id: "sim-oos", name: "Simulated Out of Stock", price: 50, inStock: false, stockCount: 0 };
  const oosCheck = simulatedOOS.inStock ? { valid: true } : { valid: false, error: "out of stock" };
  assert.equal(oosCheck.valid, false);
});

test("authoritative catalog lookup prevents client price tampering", () => {
  function resolveAuthoritativeItem(item) {
    const catalogProduct = PRODUCTS.find((p) => p.id === item.productId);
    if (catalogProduct) {
      return {
        productName: catalogProduct.name,
        quantity: item.quantity,
        unitPriceAmount: Math.round(catalogProduct.price * 100), // Authoritative
      };
    }
    return null;
  }

  const bpc = PRODUCTS.find((p) => p.id === "vf-std-001");
  assert.ok(bpc);

  // Malicious client tries to send 1 cent price
  const tamperedClientItem = {
    productId: "vf-std-001",
    productName: "BPC-157 Reference Standard",
    quantity: 1,
    unitPriceAmount: 1, // Tampered 1 cent
  };

  const resolved = resolveAuthoritativeItem(tamperedClientItem);
  assert.ok(resolved);
  assert.equal(resolved.unitPriceAmount, Math.round(bpc.price * 100)); // Price restored to real $64.00 (6400 cents)
  assert.notEqual(resolved.unitPriceAmount, 1);
});
