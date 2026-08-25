export const FREE_STANDARD_SHIPPING_THRESHOLD_CENTS = 20000;

export const defaultShippingOptions = [
  {
    id: "standard",
    label: "Standard Shipping (3-5 Days)",
    priceCents: 1500,
    eta: "3-5 business days",
    description: "Temperature-monitored ground shipping with cold insulation pack",
    freeShippingThresholdCents: 20000,
  },
  {
    id: "priority",
    label: "Priority Shipping (2-Day)",
    priceCents: 3500,
    eta: "2 business days",
    description: "Expedited cold-chain transit with guaranteed delivery window",
  },
  {
    id: "express",
    label: "Express Shipping (1-Day)",
    priceCents: 6500,
    eta: "1 business day",
    description: "Next-day priority delivery with thermal ice insulation",
  },
];

export const shippingOptions = defaultShippingOptions;

export function getShippingOption(id, customOptions = null) {
  const options = Array.isArray(customOptions) && customOptions.length > 0 ? customOptions : defaultShippingOptions;
  return options.find((option) => option.id === id) || options[0];
}

export function calculateShipping(subtotalCents, id = "standard", customOptions = null) {
  const option = getShippingOption(id, customOptions);
  const threshold = option.freeShippingThresholdCents ?? FREE_STANDARD_SHIPPING_THRESHOLD_CENTS;
  const standardUnlocked =
    option.id === "standard" &&
    typeof subtotalCents === "number" &&
    subtotalCents >= threshold;
  const amountCents = standardUnlocked ? 0 : (option.priceCents ?? option.costCents ?? 0);

  return {
    ...option,
    amountCents,
    displayPrice: amountCents === 0 ? "FREE" : `$${(amountCents / 100).toFixed(2)}`,
  };
}

export function formatShippingLineLabel(shipping) {
  const label = shipping.label || shipping.name || "Shipping";
  const eta = shipping.eta ? ` (${shipping.eta})` : "";
  return `${label}${eta}`;
}

export function getFreeShippingMessage(subtotalCents, thresholdCents = FREE_STANDARD_SHIPPING_THRESHOLD_CENTS) {
  if (typeof subtotalCents !== "number") {
    return `Free Standard Shipping over $${(thresholdCents / 100).toFixed(0)}.`;
  }

  if (subtotalCents >= thresholdCents) {
    return "Free Standard Shipping unlocked.";
  }

  const remaining = thresholdCents - subtotalCents;
  return `You're $${(remaining / 100).toFixed(2)} away from free Standard Shipping.`;
}
