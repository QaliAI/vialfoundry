export interface Review {
  productSlug: string;
  reviewerName: string;
  reviewerOrg?: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
}

/** Static fallback reviews (used when Supabase is unavailable). Slugs match productSlug(name). */
export const STATIC_REVIEWS: Review[] = [
  {
    productSlug: 'bpc-157-reference-standard',
    reviewerName: 'Dr. M. Reyes',
    reviewerOrg: 'University Analytical Core',
    rating: 5,
    title: 'Consistent lot-to-lot purity',
    body: 'COA matched our in-house HPLC within 0.2%. Reconstituted cleanly with no visible particulates. Documentation was thorough.',
    verified: true,
  },
  {
    productSlug: 'bpc-157-reference-standard',
    reviewerName: 'K. Anders',
    reviewerOrg: 'Contract Research Org',
    rating: 5,
    title: 'Reliable reference standard',
    body: 'We use this as an identity reference for method validation. Mass and retention time align with our library.',
    verified: true,
  },
  {
    productSlug: 'semaglutide-analytical-standard',
    reviewerName: 'Dr. L. Chen',
    reviewerOrg: 'Pharma QC Lab',
    rating: 5,
    title: 'Excellent for method development',
    body: 'Sharp single peak on our gradient method. Certificate traceability is exactly what we need for audits.',
    verified: true,
  },
  {
    productSlug: 'tb-500-thymosin-beta-4-fragment-standard',
    reviewerName: 'J. Whitfield',
    reviewerOrg: 'Academic Lab',
    rating: 4,
    title: 'Good purity, fast shipping',
    body: 'Lyophilized cake was intact and dissolved readily. Slightly higher residual solvent than expected but within spec.',
    verified: true,
  },
  {
    productSlug: 'semaglutide-analytical-standard',
    reviewerName: 'Dr. A. Kowalski',
    reviewerOrg: 'Analytical Services',
    rating: 5,
    title: 'Batch documentation is a standout',
    body: 'The lot verification portal made it trivial to archive the COA against our sample records.',
    verified: true,
  },
];
