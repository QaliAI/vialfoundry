'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CatalogPage } from '../../views/CatalogPage';
import { Product } from '../../types';

export default function Page() {
  const router = useRouter();

  const handleSelectProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  return <CatalogPage onSelectProduct={handleSelectProduct} />;
}
