/**
 * Builds Stripe Checkout amounts from a server-authoritative invoice.
 *
 * THE INVARIANT THIS FILE EXISTS TO PROTECT:
 *
 *     Stripe amount_total === order.total_amount === server invoice total
 *
 * exactly, to the cent, for every order.
 *
 * The previous adapter built line items from product unit prices alone, which
 * silently dropped shipping and every discount — it would have charged the
 * wrong amount on any order with a promo code or paid shipping.
 *
 * Everything here is integer cents. No floats, no client input: `invoice` comes
 * from `recalculateInvoice()` and `items` are the server-validated catalogue
 * lines. Kept dependency-free (.mjs) so the arithmetic is unit-testable without
 * the Stripe SDK or a network call.
 */

/** Stripe rejects a zero-amount line, and we never want a $0 product line. */
function assertPositiveInt(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`[stripe-amounts] ${label} must be a non-negative integer of cents, got ${value}`);
  }
}

/**
 * @param {object} args
 * @param {Array}  args.items    server-validated line items (unit_price_amount in cents)
 * @param {object} args.invoice  result of recalculateInvoice()
 * @param {string} args.currency e.g. "USD"
 * @param {string} [args.shippingLabel]
 * @returns {{ line_items: Array, discountCents: number, expectedTotalCents: number }}
 */
export function buildStripeCheckoutAmounts({ items, invoice, currency, shippingLabel = 'Shipping' }) {
  if (!invoice || invoice.pricingPending) {
    throw new Error('[stripe-amounts] cannot charge an invoice with pending pricing');
  }

  const cur = String(currency || 'USD').toLowerCase();
  const line_items = [];
  let lineSum = 0;

  for (const item of items) {
    const unit = Number(item.unit_price_amount);
    const qty = Number(item.quantity);
    assertPositiveInt(unit, `unit price for "${item.productName}"`);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error(`[stripe-amounts] quantity for "${item.productName}" must be a positive integer`);
    }
    // A zero-priced line is legitimate internally but Stripe will reject it.
    if (unit === 0) continue;

    lineSum += unit * qty;
    line_items.push({
      quantity: qty,
      price_data: {
        currency: cur,
        unit_amount: unit,
        product_data: {
          name: item.displayName || item.productName,
          ...(item.sku ? { metadata: { sku: String(item.sku) } } : {}),
        },
      },
    });
  }

  const shipping = Number(invoice.shipping_amount || 0);
  assertPositiveInt(shipping, 'shipping');
  if (shipping > 0) {
    lineSum += shipping;
    line_items.push({
      quantity: 1,
      price_data: {
        currency: cur,
        unit_amount: shipping,
        product_data: { name: shippingLabel },
      },
    });
  }

  const tax = Number(invoice.tax_amount || 0);
  assertPositiveInt(tax, 'tax');
  if (tax > 0) {
    lineSum += tax;
    line_items.push({
      quantity: 1,
      price_data: { currency: cur, unit_amount: tax, product_data: { name: 'Tax' } },
    });
  }

  // Stripe has no negative line items, so a discount is applied as a one-off
  // coupon (amount_off). Subtotal - discount + shipping + tax must reproduce
  // the server total exactly.
  const discountCents = Number(invoice.discount_amount || 0);
  assertPositiveInt(discountCents, 'discount');

  const expectedTotalCents = lineSum - discountCents;
  const serverTotal = Number(invoice.total_amount);

  if (expectedTotalCents !== serverTotal) {
    throw new Error(
      `[stripe-amounts] refusing to charge: computed ${expectedTotalCents} != server total ${serverTotal}. ` +
        `lines=${lineSum} discount=${discountCents} shipping=${shipping} tax=${tax}`,
    );
  }
  if (expectedTotalCents <= 0) {
    throw new Error(`[stripe-amounts] refusing to create a Stripe session for a non-positive total (${expectedTotalCents})`);
  }
  if (discountCents >= lineSum) {
    throw new Error('[stripe-amounts] discount cannot meet or exceed the line total');
  }

  return { line_items, discountCents, expectedTotalCents };
}

/**
 * Final guard, run against what Stripe actually created. Even with correct
 * inputs we verify the session Stripe returned rather than assuming.
 */
export function assertStripeTotalMatches(sessionAmountTotal, orderTotalCents) {
  if (Number(sessionAmountTotal) !== Number(orderTotalCents)) {
    throw new Error(
      `[stripe-amounts] Stripe session amount_total ${sessionAmountTotal} != order total ${orderTotalCents}`,
    );
  }
  return true;
}
