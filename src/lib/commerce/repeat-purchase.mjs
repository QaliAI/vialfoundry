export const RECENT_ORDERS_STORAGE_KEY = 'vf_recent_orders';

/**
 * Saves a completed order to local browser storage so returning customers
 * can reorder identical reference standard items and configurations.
 *
 * @param {{ orderNumber: string, date: string, items: Array<{ productId?: string, sku?: string, productName: string, configurationLabel?: string, quantity: number, unitPriceCents?: number }> }} order
 */
export function saveRecentOrder(order) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_ORDERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((o) => o.orderNumber !== order.orderNumber);
    filtered.unshift(order);
    localStorage.setItem(RECENT_ORDERS_STORAGE_KEY, JSON.stringify(filtered.slice(0, 5)));
  } catch {
    /* storage blocked or quota exceeded: ignore gracefully */
  }
}

/**
 * Retrieves past order records for this customer browser session.
 * @returns {Array<any>}
 */
export function getRecentOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Matches an item from a historical order against current purchasable catalog SKUs.
 * Preserves exact product ID, SKU and configuration.
 *
 * @param {{ productId?: string, sku?: string, productName?: string, quantity?: number }} item
 * @param {Array<any>} catalog
 * @returns {any | undefined}
 */
export function resolveProductForReorder(item, catalog = []) {
  if (!item || !Array.isArray(catalog)) return undefined;

  if (item.productId) {
    const byId = catalog.find((p) => p.id === item.productId && p.purchasable !== false);
    if (byId) return byId;
  }

  if (item.sku) {
    const bySku = catalog.find((p) => p.sku === item.sku && p.purchasable !== false);
    if (bySku) return bySku;
  }

  if (item.productName) {
    const norm = String(item.productName).trim().toLowerCase();
    const byName = catalog.find(
      (p) => p.name && String(p.name).trim().toLowerCase() === norm && p.purchasable !== false,
    );
    if (byName) return byName;
  }

  return undefined;
}
