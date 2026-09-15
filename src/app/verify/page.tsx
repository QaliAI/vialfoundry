import type { Metadata } from 'next';
import { VERIFIED_BATCH_RECORDS } from '../../data/verified-batch-records';
import VerifyClientWrapper from './VerifyClientWrapper';

const hasVerifiedRecords = Object.keys(VERIFIED_BATCH_RECORDS).length > 0;

export const metadata: Metadata = {
  title: 'Batch Documentation & Verification | Vial Foundry',
  description: 'Search and inspect authentic analytical documentation for Vial Foundry research peptide batches.',
  alternates: {
    canonical: 'https://www.vialfoundry.com/verify',
  },
  robots: hasVerifiedRecords
    ? { index: true, follow: true }
    : { index: false, follow: true },
};

export default function Page() {
  return <VerifyClientWrapper />;
}
