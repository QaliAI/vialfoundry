/**
 * Public checkout catalog resolution.
 *
 * A Stripe charge may only be built from a real, active catalogue product.
 * Authority is product ID and/or SKU. Customer-supplied names and prices
 * are never trusted. Unknown products are rejected — there is no custom
 * / non-catalog fallback on the public checkout route.
 */

export const UNKNOWN_PRODUCT_ERROR = "This product is not available for checkout.";

export function resolveCatalogProduct(item, products) {
  if (!item || !Array.isArray(products)) return null;

  const id = item.productId != null && String(item.productId).trim() !== ""
    ? String(item.productId).trim()
    : null;
  const sku = item.sku != null && String(item.sku).trim() !== ""
    ? String(item.sku).trim().toUpperCase()
    : null;

  if (!id && !sku) return null;

  const byId = id ? products.find((p) => p.id === id) : null;
  const bySku = sku
    ? products.find((p) => String(p.sku || "").toUpperCase() === sku)
    : null;

  if (id && sku) {
    if (!byId || !bySku || byId.id !== bySku.id) return null;
    return byId;
  }
  return byId || bySku || null;
}

export function isPubliclyPurchasable(product) {
  if (!product) return false;
  if (product.hiddenFromCatalogReason) return false;
  return true;
}

export function authoritativeUnitPriceCents(product) {
  return Math.round(Number(product.price) * 100);
}

export function validateCheckoutItem(item, products) {
  const product = resolveCatalogProduct(item, products);
  if (!product || !isPubliclyPurchasable(product)) {
    return { ok: false, error: UNKNOWN_PRODUCT_ERROR };
  }
  const quantity = Math.round(Number(item.quantity) || 0);
  if (quantity <= 0) {
    return { ok: false, error: UNKNOWN_PRODUCT_ERROR };
  }
  const unit = authoritativeUnitPriceCents(product);
  if (!Number.isInteger(unit) || unit <= 0) {
    return { ok: false, error: UNKNOWN_PRODUCT_ERROR };
  }
  return {
    ok: true,
    product,
    quantity,
    unit_price_amount: unit,
    line_total_amount: unit * quantity,
  };
}

export function assertSufficientStock(onHand, requested, productName) {
  const stock = Number(onHand);
  const qty = Number(requested);
  const name = productName || "This product";
  if (!Number.isFinite(stock) || stock <= 0) {
    return { ok: false, error: `Product "${name}" is currently out of stock.` };
  }
  if (!Number.isFinite(qty) || qty <= 0 || qty > stock) {
    return {
      ok: false,
      error: `Requested quantity for "${name}" (${qty}) exceeds available inventory (${Number.isFinite(stock) ? stock : 0}).`,
    };
  }
  return { ok: true };
}
