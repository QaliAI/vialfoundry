'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { Product } from '../types';

export const AppNavigationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = pathname?.startsWith('/admin');

  const navigate = (path: string) => {
    router.push(path);
  };

  const handleSelectProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  if (isAdminRoute) {
    return <div className="min-h-screen bg-[#08090B] text-slate-100">{children}</div>;
  }

  return (
    <>
      <Navbar currentPath={pathname || '/'} navigate={navigate} />
      <main className="flex-1">{children}</main>
      <Footer navigate={navigate} />
      <CartDrawer navigate={navigate} />
      <SearchModal navigate={navigate} onSelectProduct={handleSelectProduct} />
    </>
  );
};
