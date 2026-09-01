'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CatalogPage } from '../../views/CatalogPage';
import { Product } from '../../types';

function CatalogRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  return (
    <CatalogPage
      onSelectProduct={handleSelectProduct}
      initialCategory={searchParams.get('category') ?? undefined}
    />
  );
}

export default function Page() {
  // useSearchParams needs a Suspense boundary to keep the route statically renderable.
  return (
    <Suspense fallback={null}>
      <CatalogRoute />
    </Suspense>
  );
}
