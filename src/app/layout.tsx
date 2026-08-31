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
  logo: `${SITE_URL}/assets/vials/single-vial-dark.png`,
  description:
    'Precision-built research materials supported by batch documentation, HPLC identity verification, and independent analytical testing. For research use only.',
  email: 'support@vialfoundry.com',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vialfoundry.com'),
  title: 'Vial Foundry — Precision-built research materials.',
  description: 'Vial Foundry delivers batch-documented research materials, HPLC identity verification, independent analytical testing, and complete lot traceability.',
  keywords: ['research materials', 'analytical standards', 'batch verification', 'HPLC testing', 'LC-MS analysis', 'reference compounds'],
  openGraph: {
    title: 'Vial Foundry — Precision-built research materials.',
    description: 'Carefully manufactured research materials supported by batch documentation and independent analytical testing.',
    url: 'https://vialfoundry.com/',
    siteName: 'Vial Foundry',
    images: [{ url: '/assets/vials/single-vial-dark.png' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vial Foundry — Precision-built research materials.',
    description: 'Carefully manufactured research materials supported by batch documentation and independent analytical testing.',
    images: ['/assets/vials/single-vial-dark.png'],
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
      <body className="bg-[#FAFAF9] text-slate-900 font-sans antialiased selection:bg-cyan-100 selection:text-cyan-900 min-h-screen flex flex-col justify-between">
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

