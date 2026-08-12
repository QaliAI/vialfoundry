import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../data/products';
import { ProductCategory, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BATCH_RECORDS } from '../data/batches';
import { COAModal } from '../components/COAModal';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CatalogPageProps {
  onSelectProduct: (product: Product) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'purity' | 'price-asc' | 'price-desc'>('purity');
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
      if (sortBy === 'purity') return b.purityPercentage - a.purityPercentage;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
          MATERIALS CATALOG
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">
          Research Materials & Standards
        </h1>
        <p className="text-slate-400 text-sm font-light max-w-2xl">
          Browse verified chemical reference materials, analytical standards, and purified single compounds. All products include batch documentation and HPLC reports.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="purity">Purity (High to Low)</option>
              <option value="name">Alphabetical (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/10 space-y-3">
          <p className="text-slate-400 font-mono text-sm">No materials match your current category and search criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
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
