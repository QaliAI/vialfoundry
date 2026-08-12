'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HomePage } from '../views/HomePage';
import { Product } from '../types';

export default function Page() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  const handleSelectProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleSelectArticle = (slug: string) => {
    router.push(`/resources/${slug}`);
  };

  return (
    <HomePage
      navigate={navigate}
      onSelectProduct={handleSelectProduct}
      onSelectArticle={handleSelectArticle}
    />
  );
}
