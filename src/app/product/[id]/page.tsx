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
  return PUBLIC_PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const prodId = params.id;
  // Withheld SKUs are never exposed to public search engines.
  const product = PUBLIC_PRODUCTS.find((p) => p.id === prodId || p.slug === prodId);

  if (!product) {
    return {
      title: 'Product Not Found | Vial Foundry',
      robots: { index: false, follow: false },
    };
  }

  const title = `${productTitle(product)} Research Peptide | Vial Foundry`;
  const description = `${productTitle(product)} analytical reference standard (${productSize(product)}). Lyophilized research peptide for laboratory and in vitro research use only. CAS ${product.casNumber}.`;
  const canonicalUrl = `https://www.vialfoundry.com/product/${product.id}`;
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
  const product = PUBLIC_PRODUCTS.find((p) => p.id === prodId || p.slug === prodId);

  if (!product) {
    notFound();
  }

  return <ProductClientWrapper product={product} />;
}
