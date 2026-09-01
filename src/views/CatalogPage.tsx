'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { getBatchRecord, getDocumentationStatus } from '../data/batches';
import { COAModal } from '../components/COAModal';
import { Search, ArrowUpDown } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface CatalogPageProps {
  onSelectProduct: (product: Product) => void;
  /** Category to preselect, e.g. from a homepage tile's ?category= link. */
  initialCategory?: string;
}

const CATEGORIES = [
  'All',
  'Reference Materials',
  'Analytical Standards',
  'Single Compounds',
  'Specialty Materials',
  'Lab Supplies',
];

type DocFilter = 'any' | 'verified' | 'pending';

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectProduct, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && CATEGORIES.includes(initialCategory) ? initialCategory : 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [docFilter, setDocFilter] = useState<DocFilter>('any');
  const [activeCOALot, setActiveCOALot] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('catalog_viewed', { category: selectedCategory });
    // Fires once per catalog entry, not on every filter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const documentedCount = useMemo(
    () => PRODUCTS.filter((p) => getDocumentationStatus(p) === 'verified').length,
    []
  );

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.casNumber.toLowerCase().includes(q) ||
        product.lotNumber.toLowerCase().includes(q) ||
        (product.sequence && product.sequence.toLowerCase().includes(q));
      const matchesDocs = docFilter === 'any' || getDocumentationStatus(product) === docFilter;
      return matchesCategory && matchesSearch && matchesDocs;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy, docFilter]);

  const applyCategory = (cat: string) => {
    setSelectedCategory(cat);
    trackEvent('catalog_filtered', { category: cat, documentation: docFilter });
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-brand-canvas">

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          Catalog
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Research Materials &amp; Reference Standards
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal max-w-2xl leading-relaxed">
          {PRODUCTS.length} materials in stock or on backorder. Each card states whether we hold a
          certificate of analysis for that lot, so you know before you order.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs">

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => applyCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-brand-paper font-semibold shadow-2xs'
                  : 'text-brand-steel hover:text-brand-ink hover:bg-brand-surface-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel" />
            <label htmlFor="catalog-search" className="sr-only">
              Search compounds or CAS number
            </label>
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search compounds, CAS or lot..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-brand-canvas border border-brand-border text-brand-ink placeholder-brand-steel text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-brand-canvas border border-brand-border rounded-lg px-2.5 py-1.5 text-xs font-sans text-brand-graphite">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-steel" />
            <label htmlFor="catalog-sort" className="sr-only">
              Sort catalog
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-brand-ink focus:outline-none cursor-pointer text-xs"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Documentation filter — only offered once there is something to filter to. */}
      {documentedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <span className="text-brand-steel font-medium">Documentation:</span>
          {(
            [
              ['any', `All ${PRODUCTS.length}`],
              ['verified', `COA on file (${documentedCount})`],
              ['pending', `COA pending (${PRODUCTS.length - documentedCount})`],
            ] as [DocFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setDocFilter(value);
                trackEvent('catalog_filtered', { category: selectedCategory, documentation: value });
              }}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                docFilter === value
                  ? 'bg-brand-primary text-brand-paper border-brand-primary font-semibold'
                  : 'bg-brand-paper text-brand-steel border-brand-border hover:text-brand-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-brand-paper rounded-2xl border border-brand-border space-y-3 shadow-2xs">
          <p className="text-brand-steel font-sans text-sm">
            No materials match your current filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setDocFilter('any');
            }}
            className="px-4 py-2 rounded-xl bg-brand-primary text-brand-paper font-semibold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={onSelectProduct}
              onViewCOA={(lot) => setActiveCOALot(lot)}
            />
          ))}
        </div>
      )}

      {/* COA Modal if triggered */}
      {activeCOALot && getBatchRecord(activeCOALot) && (
        <COAModal batch={getBatchRecord(activeCOALot)} onClose={() => setActiveCOALot(null)} />
      )}

    </div>
  );
};
