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
 * Every product currently in the catalogue is a single research peptide, so
 * these labels deliberately do not imply a research area or an effect — they
 * only describe what the item physically is.
 */
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'Reference Materials': 'Research Peptides',
  'Analytical Standards': 'Peptide Standards',
  'Single Compounds': 'Single Peptides',
  'Specialty Materials': 'Specialty Peptides',
  'Lab Supplies': 'Research Supplies',
};

/** Short description shown under a category tile. Facts only. */
const CATEGORY_BLURBS: Record<ProductCategory, string> = {
  'Reference Materials': 'Our core research peptides.',
  'Analytical Standards': 'Peptides used as comparison standards.',
  'Single Compounds': 'One peptide per vial.',
  'Specialty Materials': 'Less commonly stocked peptides.',
  'Lab Supplies': 'Diluents and lab consumables.',
};

export function categoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function categoryBlurb(category: ProductCategory): string {
  return CATEGORY_BLURBS[category] ?? '';
}

/** The short name to show in listings, cards and the cart. */
export function productTitle(product: Pick<Product, 'name' | 'displayName'>): string {
  return product.displayName || product.name;
}

/** The plain size to show in listings ("5 mg vial"). */
export function productSize(product: Pick<Product, 'size' | 'displaySize'>): string {
  return product.displaySize || product.size;
}
