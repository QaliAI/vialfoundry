import React from 'react';
import type { Metadata } from 'next';
import { AffiliatesPage } from '../../views/AffiliatesPage';

export const metadata: Metadata = {
  title: 'Affiliate Program — Vial Foundry',
  description:
    'Join the Vial Foundry affiliate program and earn commission referring researchers to batch-documented research materials.',
};

export default function Page() {
  return <AffiliatesPage />;
}
