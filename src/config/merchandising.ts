import type { Product } from '../types';

/**
 * Explicit, configurable merchandising system for Vial Foundry.
 * Prioritizes strong price/value, current high inventory, major catalog families,
 * and high-demand research blends.
 *
 * Truthful RUO positioning: does NOT claim "Best Sellers" without extensive sales evidence.
 */
export const FEATURED_FAMILY_IDS: string[] = [
  'bpc-157',        // Flagship reference standard, high stock (142), $54.99
  'tb-500',         // Core thymosin beta-4 fragment standard, high stock (96), $88.00
  'semaglutide',    // Primary analytical GLP-1 standard, high research interest, $112.00
  'tirzepatide',    // Dual receptor agonist standard, high research demand, $145.00
  'ghk-cu',         // High inventory (125), accessible research price, $58.00
  'wolverine',      // Wolverine blend (BPC-157 + TB-500), prominent multi-component blend, $80.00
];

export const FEATURED_PRODUCT_IDS: string[] = [
  'vf-std-001', // BPC-157 5 mg
  'vf-std-002', // TB-500 10 mg
  'vf-std-003', // Semaglutide 5 mg
  'vf-std-004', // Tirzepatide 10 mg
  'vf-std-009', // GHK-Cu 50 mg
  'vf-std-028', // BPC-157 + TB-500 Wolverine 20 mg Blend
];

export const MERCHANDISING_SECTION_TITLE = 'Featured Research Peptides';
export const MERCHANDISING_SECTION_SUBTITLE = 'Reference materials and research compounds selected for laboratory standards.';

/**
 * Resolves 4 to 6 featured products in prioritized order.
 * Ensures all returned items are public, purchasable, and in-stock where possible.
 */
export function getFeaturedProducts(products: Product[] = [], limit = 6): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const byFamily = new Map<string, Product>();

  // Map first available configuration per family
  for (const product of products) {
    if (product.purchasable !== false && product.inStock && !byFamily.has(product.familyId)) {
      byFamily.set(product.familyId, product);
    }
  }

  const featured: Product[] = [];
  const seenIds = new Set<string>();

  // 1. First priority: explicit featured product IDs
  for (const id of FEATURED_PRODUCT_IDS) {
    const match = byId.get(id);
    if (match && match.purchasable !== false && !seenIds.has(match.id)) {
      featured.push(match);
      seenIds.add(match.id);
    }
    if (featured.length >= limit) break;
  }

  // 2. Second priority: family matches if under limit
  if (featured.length < limit) {
    for (const familyId of FEATURED_FAMILY_IDS) {
      const match = byFamily.get(familyId);
      if (match && !seenIds.has(match.id)) {
        featured.push(match);
        seenIds.add(match.id);
      }
      if (featured.length >= limit) break;
    }
  }

  // 3. Fallback: pad with other available products if still under limit
  if (featured.length < limit) {
    for (const product of products) {
      if (product.purchasable !== false && !seenIds.has(product.id)) {
        featured.push(product);
        seenIds.add(product.id);
      }
      if (featured.length >= limit) break;
    }
  }

  return featured.slice(0, limit);
}
