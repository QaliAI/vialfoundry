'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ResourcesPage } from '../../pages/ResourcesPage';

export default function Page() {
  const router = useRouter();

  const handleSelectArticle = (slug: string) => {
    router.push(`/resources/${slug}`);
  };

  return <ResourcesPage onSelectArticle={handleSelectArticle} />;
}
