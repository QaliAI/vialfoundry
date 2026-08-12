'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArticleDetailPage } from '../../../views/ArticleDetailPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const slug = params?.slug as string;

  const navigate = (path: string) => {
    router.push(path);
  };

  return <ArticleDetailPage slug={slug} navigate={navigate} />;
}
