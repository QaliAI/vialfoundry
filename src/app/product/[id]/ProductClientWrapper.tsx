'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductDetailPage } from '../../../views/ProductDetailPage';
import { Product } from '../../../types';

interface ProductClientWrapperProps {
  product: Product;
  variants: Product[];
}

export default function ProductClientWrapper({ product, variants }: ProductClientWrapperProps) {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  const handleSelectProduct = (p: Product) => {
    router.push(`/product/${p.id}`);
  };

  return (
    <ProductDetailPage
      product={product}
      variants={variants}
      navigate={navigate}
      onSelectProduct={handleSelectProduct}
    />
  );
}
