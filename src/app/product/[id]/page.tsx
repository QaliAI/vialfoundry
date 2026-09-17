import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PUBLIC_PRODUCTS } from '../../../data/products';
import { productTitle, productSize } from '../../../lib/catalog-display';
import ProductClientWrapper from './ProductClientWrapper';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return Array.from(
    new Set(PUBLIC_PRODUCTS.flatMap((p) => [p.id, p.slug, p.familyId]).filter(Boolean) as string[])
  ).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const prodId = params.id;
  // Withheld SKUs are never exposed to public search engines.
  const product = PUBLIC_PRODUCTS.find(
    (p) => p.id === prodId || p.slug === prodId || p.familyId === prodId
  );

  if (!product) {
    return {
      title: 'Product Not Found | Vial Foundry',
      robots: { index: false, follow: false },
    };
  }

  const title = `${productTitle(product)} | Vial Foundry`;
  const familyVariants = PUBLIC_PRODUCTS.filter((p) => p.familyId === product.familyId);
  const sizes = familyVariants.map(productSize).join(', ');
  const description = `${productTitle(product)} research material available in ${sizes}. For qualified laboratory research use only.`;
  const canonicalUrl = `https://www.vialfoundry.com/product/${product.familyId}`;
  const imageUrl = `https://www.vialfoundry.com${product.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${productTitle(product)} - Vial Foundry`,
        },
      ],
      type: 'website',
      siteName: 'Vial Foundry',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function Page({ params }: PageProps) {
  const prodId = params.id;
  // Withheld SKUs are not reachable publicly, even by direct URL.
  const product = PUBLIC_PRODUCTS.find(
    (p) => p.id === prodId || p.slug === prodId || p.familyId === prodId
  );

  if (!product) {
    notFound();
  }

  const variants = PUBLIC_PRODUCTS.filter((p) => p.familyId === product.familyId);

  return <ProductClientWrapper product={product} variants={variants} />;
}
