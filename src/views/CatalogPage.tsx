import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BATCH_RECORDS } from '../data/batches';
import { COAModal } from '../components/COAModal';
import { Search, ArrowUpDown } from 'lucide-react';

interface CatalogPageProps {
  onSelectProduct: (product: Product) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [activeCOALot, setActiveCOALot] = useState<string | null>(null);

  const categories = ['All', 'Reference Materials', 'Analytical Standards', 'Single Compounds', 'Specialty Materials', 'Lab Supplies'];

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
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-brand-canvas">
      
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          Catalog
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Research Materials & Reference Standards
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal max-w-2xl leading-relaxed">
          Standardized peptide reference compounds and reagents supported by lot-specific analytical documentation.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search compounds or CAS..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-brand-canvas border border-brand-border text-brand-ink placeholder-brand-steel text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-brand-canvas border border-brand-border rounded-lg px-2.5 py-1.5 text-xs font-sans text-brand-graphite">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-steel" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-brand-ink focus:outline-none cursor-pointer text-xs"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-brand-paper rounded-2xl border border-brand-border space-y-3 shadow-2xs">
          <p className="text-brand-steel font-sans text-sm">No materials match your current category and search criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
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
      {activeCOALot && BATCH_RECORDS[activeCOALot] && (
        <COAModal
          batch={BATCH_RECORDS[activeCOALot]}
          onClose={() => setActiveCOALot(null)}
        />
      )}

    </div>
  );
};
