import type { MetadataRoute } from 'next';
import { PRODUCTS } from '../data/products';
import { RESEARCH_ARTICLES } from '../data/articles';
import { LEGAL_SLUGS } from '../data/legal';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://vialfoundry.com';
  const now = new Date();

  const staticRoutes = ['', '/catalog', '/quality', '/verify', '/resources', '/about', '/contact', '/affiliates'].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    })
  );

  const productRoutes = PRODUCTS.map((p) => ({
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
