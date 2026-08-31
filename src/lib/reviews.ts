import { createClient } from './supabase/client';
import { Review, STATIC_REVIEWS } from '../data/reviews';

interface DbReview {
  product_slug: string | null;
  reviewer_name: string;
  reviewer_org: string | null;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean | null;
}

function mapDbReview(r: DbReview): Review {
  return {
    productSlug: r.product_slug || '',
    reviewerName: r.reviewer_name,
    reviewerOrg: r.reviewer_org || undefined,
    rating: r.rating,
    title: r.title || '',
    body: r.body,
    verified: r.verified ?? true,
  };
}

/** Fetch published verified reviews from Supabase. Returns empty array if no real reviews exist. */
export async function fetchReviews(productSlug?: string): Promise<Review[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('reviews')
      .select('product_slug, reviewer_name, reviewer_org, rating, title, body, verified')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (productSlug) query = query.eq('product_slug', productSlug);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [];
    }
    return (data as DbReview[]).map(mapDbReview);
  } catch {
    return [];
  }
}
