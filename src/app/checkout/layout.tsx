import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Secure Checkout | Vial Foundry',
  description: 'Complete your research chemical order securely.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
