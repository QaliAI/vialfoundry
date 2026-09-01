'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BatchVerificationPage } from '../../views/BatchVerificationPage';

export default function Page() {
  const router = useRouter();
  return <BatchVerificationPage navigate={(path) => router.push(path)} />;
}
