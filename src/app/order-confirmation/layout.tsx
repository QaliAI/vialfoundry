import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Order Confirmation | Vial Foundry',
  description: 'View your order confirmation details and instructions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
