import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BatchVerificationPage } from './pages/BatchVerificationPage';
import { QualityPage } from './pages/QualityPage';
import { AboutPage } from './pages/AboutPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ContactPage } from './pages/ContactPage';
import { Product } from './types';
import { PRODUCTS } from './data/products';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || '/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  const handleSelectArticle = (slug: string) => {
    setSelectedArticleSlug(slug);
    navigate(`/resources/${slug}`);
  };

  // Render Page View based on route
  const renderContent = () => {
    if (currentPath.startsWith('/product/')) {
      const prodId = currentPath.replace('/product/', '');
      const prod = selectedProduct || PRODUCTS.find((p) => p.id === prodId) || PRODUCTS[0];
      return (
        <ProductDetailPage
          product={prod}
          navigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    if (currentPath.startsWith('/resources/')) {
      const slug = currentPath.replace('/resources/', '');
      return <ArticleDetailPage slug={slug} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/catalog':
        return <CatalogPage onSelectProduct={handleSelectProduct} />;
      case '/verify':
        return <BatchVerificationPage />;
      case '/quality':
        return <QualityPage />;
      case '/about':
        return <AboutPage />;
      case '/resources':
        return <ResourcesPage onSelectArticle={handleSelectArticle} />;
      case '/contact':
        return <ContactPage />;
      case '/':
      default:
        return (
          <HomePage
            navigate={navigate}
            onSelectProduct={handleSelectProduct}
            onSelectArticle={handleSelectArticle}
          />
        );
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col justify-between bg-[#08090B] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar currentPath={currentPath} navigate={navigate} />

        <main className="flex-1">
          {renderContent()}
        </main>

        <Footer navigate={navigate} />

        {/* Global Overlays */}
        <CartDrawer navigate={navigate} />
        <SearchModal navigate={navigate} onSelectProduct={handleSelectProduct} />
      </div>
    </CartProvider>
  );
}
