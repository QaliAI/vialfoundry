'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductDetailPage } from '../../../views/ProductDetailPage';
import { PRODUCTS } from '../../../data/products';
import { Product } from '../../../types';

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const prodId = params?.id as string;
  const product = PRODUCTS.find((p) => p.id === prodId || p.slug === prodId) || PRODUCTS[0];

  const navigate = (path: string) => {
    router.push(path);
  };

  const handleSelectProduct = (p: Product) => {
    router.push(`/product/${p.id}`);
  };

  return (
    <ProductDetailPage
      product={product}
      navigate={navigate}
      onSelectProduct={handleSelectProduct}
    />
  );
}
