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
  image: `${SITE_URL}/brand/og-image.png`,
  description:
    'Shop research peptides with clear product details, batch numbers and documents when available. For research use only.',
  email: 'support@vialfoundry.com',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vialfoundry.com'),
  title: 'Vial Foundry — Research Peptides',
  description: 'Shop research peptides with clear product details, batch numbers and documents when available. For research use only.',
  keywords: ['research peptides', 'buy research peptides', 'batch documents', 'peptide vials', 'RUO peptides'],
  openGraph: {
    title: 'Vial Foundry — Research Peptides',
    description: 'Shop research peptides with clear product details, batch numbers and documents when available. For research use only.',
    url: 'https://vialfoundry.com/',
    siteName: 'Vial Foundry',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'Vial Foundry — Research Peptides' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vial Foundry — Research Peptides',
    description: 'Shop research peptides with clear product details, batch numbers and documents when available. For research use only.',
    images: ['/brand/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/brand/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0F2740" />
      </head>
      <body className="bg-brand-canvas text-brand-ink font-sans antialiased selection:bg-brand-teal selection:text-white min-h-screen flex flex-col justify-between">
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
