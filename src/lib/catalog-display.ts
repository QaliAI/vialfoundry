import type { Product, ProductCategory } from '../types';

/**
 * Customer-facing wording for the catalogue.
 *
 * Internal record values (`name`, `size`, `category`) stay exactly as they are
 * so SKUs, order records and admin keep their precise titles. These helpers
 * are the only thing the storefront should render.
 */

/**
 * Plain-English label for each internal category key.
 *
 * Merges overlapping internal laboratory categories into clean public categories:
 * - 'Reference Materials', 'Analytical Standards', 'Single Compounds' -> 'Research Peptides'
 * - 'Specialty Materials' -> 'Specialty Products'
 * - 'Lab Supplies' -> 'Research Supplies'
 */
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'Reference Materials': 'Research Peptides',
  'Analytical Standards': 'Research Peptides',
  'Single Compounds': 'Research Peptides',
  'Specialty Materials': 'Specialty Products',
  'Lab Supplies': 'Research Supplies',
};

/** Short factual description shown under each category tile. */
const CATEGORY_BLURBS: Record<string, string> = {
  'Research Peptides': 'Lyophilized research peptides for laboratory research.',
  'Specialty Products': 'Specialty research peptides and specialized sequences.',
  'Research Supplies': 'Laboratory reconstitution reagents and consumables.',
};

export function categoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category] ?? 'Research Peptides';
}

export function categoryBlurb(categoryOrLabel: string): string {
  if (CATEGORY_BLURBS[categoryOrLabel]) return CATEGORY_BLURBS[categoryOrLabel];
  const mapped = CATEGORY_LABELS[categoryOrLabel as ProductCategory];
  return mapped ? CATEGORY_BLURBS[mapped] || '' : '';
}

/** The short name to show in listings, cards and the cart. */
export function productTitle(product: Pick<Product, 'name' | 'displayName'>): string {
  return product.displayName || product.name;
}

/** The plain size to show in listings ("5 mg vial"). */
export function productSize(product: Pick<Product, 'size' | 'displaySize'>): string {
  return product.displaySize || product.size;
}

/**
 * Matches a product category against a user-selected category filter.
 * Resolves both customer-facing names ('Research Peptides', 'Specialty Products')
 * and legacy internal keys ('Reference Materials', etc.) seamlessly.
 */
export function matchesCustomerCategory(productCategory: ProductCategory, selectedCategory: string): boolean {
  if (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'All Products') {
    return true;
  }
  const publicLabel = categoryLabel(productCategory);
  if (publicLabel.toLowerCase() === selectedCategory.toLowerCase()) {
    return true;
  }
  if (productCategory.toLowerCase() === selectedCategory.toLowerCase()) {
    return true;
  }
  return false;
}
