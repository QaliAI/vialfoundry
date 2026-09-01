export interface Review {
  productSlug: string;
  reviewerName: string;
  reviewerOrg?: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
}

/**
 * Reviews come exclusively from the `reviews` table in Supabase, written by real
 * customers. There is deliberately no hardcoded fallback: an empty review list is
 * accurate, and invented testimonials are not an acceptable substitute for one.
 */
