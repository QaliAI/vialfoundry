import React from 'react';
import type { Metadata } from 'next';
import { BulkInquiryPage } from '../../views/BulkInquiryPage';

export const metadata: Metadata = {
  title: 'Institutional & Bulk Research Orders — Vial Foundry',
  description:
    'Tiered volume pricing, batch reservations, and custom quotation for academic labs and research institutions.',
};

export default function Page() {
  return <BulkInquiryPage />;
}
