import type { MetadataRoute } from 'next';
import { PUBLIC_PRODUCTS } from '../data/products';
import { RESEARCH_ARTICLES } from '../data/articles';
import { LEGAL_SLUGS } from '../data/legal';
import { VERIFIED_BATCH_RECORDS } from '../data/verified-batch-records';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vialfoundry.com').replace(/\/$/, '');
  const now = new Date();

  const staticPaths = ['', '/catalog', '/quality', '/resources', '/about', '/contact', '/affiliates'];
  // When VERIFIED_BATCH_RECORDS count === 0, /verify is removed from sitemap
  if (Object.keys(VERIFIED_BATCH_RECORDS).length > 0) {
    staticPaths.push('/verify');
  }

  const staticRoutes = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const productRoutes = PUBLIC_PRODUCTS.map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const articleRoutes = RESEARCH_ARTICLES.map((a) => ({
    url: `${base}/resources/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const legalRoutes = LEGAL_SLUGS.map((slug) => ({
    url: `${base}/legal/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes, ...legalRoutes];
}
