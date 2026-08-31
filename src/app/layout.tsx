import type { Metadata } from 'next';
import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import '../index.css';
import { CartProvider } from '../context/CartContext';
import { AppNavigationWrapper } from '../components/AppNavigationWrapper';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vialfoundry.com';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vial Foundry',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-horizontal.svg`,
  description:
    'Precision research materials and reference compounds supported by lot-specific documentation and analytical verification. For research use only.',
  email: 'support@vialfoundry.com',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vialfoundry.com'),
  title: 'Vial Foundry — Precision-built research materials.',
  description: 'Precision-manufactured research materials, reference standards, and batch documentation for qualified research applications.',
  keywords: ['research materials', 'reference standards', 'batch documentation', 'analytical verification', 'peptide compounds'],
  openGraph: {
    title: 'Vial Foundry — Precision-built research materials.',
    description: 'Precision-manufactured research materials and reference standards supported by lot-specific documentation.',
    url: 'https://vialfoundry.com/',
    siteName: 'Vial Foundry',
    images: [{ url: '/brand/logo-horizontal.svg' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vial Foundry — Precision-built research materials.',
    description: 'Precision-manufactured research materials and reference standards supported by lot-specific documentation.',
    images: ['/brand/logo-horizontal.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-brand-canvas text-brand-ink font-sans antialiased selection:bg-brand-mineral selection:text-white min-h-screen flex flex-col justify-between">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <AppNavigationWrapper>
            {children}
          </AppNavigationWrapper>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
