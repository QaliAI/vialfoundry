import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ShieldCheck, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { totalItems, setIsCartOpen, setIsSearchOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Shop', path: '/catalog' },
    { label: 'Lab Results / COAs', path: '/verify' },
    { label: 'Quality', path: '/quality' },
    { label: 'About', path: '/about' },
    { label: 'Resources', path: '/resources' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-brand-paper/95 backdrop-blur-md border-b border-brand-border py-3 shadow-2xs'
            : 'bg-brand-canvas/90 backdrop-blur-xs py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-graphite rounded-lg"
            >
              <BrandLogo variant="horizontal" size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-paper text-brand-ink font-semibold shadow-2xs border border-brand-border'
                        : 'text-brand-steel hover:text-brand-ink hover:bg-brand-paper/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions: Search & Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Quick Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-brand-paper hover:bg-brand-surface-muted border border-brand-border text-brand-text-muted hover:text-brand-ink text-xs font-medium transition-colors shadow-2xs"
                title="Search products & lot documentation"
                aria-label="Search products and batch records"
              >
                <Search className="w-3.5 h-3.5 text-brand-steel" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-brand-canvas text-brand-steel rounded border border-brand-border">
                  ⌘K
                </kbd>
              </button>

              {/* Lab Results / Lot Lookup Badge */}
              <button
                onClick={() => navigate('/verify')}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-paper border border-brand-border text-brand-ink hover:bg-brand-surface-muted text-xs font-sans font-medium transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                <span className="tracking-wide">LOT LOOKUP</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg bg-brand-paper hover:bg-brand-surface-muted border border-brand-border text-brand-ink transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-brand-graphite"
                aria-label={`Shopping Cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-mineral text-brand-paper font-mono font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-brand-paper border border-brand-border text-brand-ink hover:bg-brand-surface-muted"
                aria-label="Toggle Mobile Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-brand-ink" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-brand-canvas/98 pt-20 px-6 md:hidden flex flex-col justify-between pb-10 animate-in fade-in duration-150">
          <div className="space-y-2">
            <div className="text-xs font-sans font-medium text-brand-steel uppercase tracking-wider mb-2">Navigation</div>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left font-medium transition-all ${
                  currentPath === item.path
                    ? 'bg-brand-paper border-brand-graphite text-brand-ink font-semibold'
                    : 'bg-brand-paper/50 border-brand-border text-brand-steel'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-brand-steel" />
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-brand-border">
            <button
              onClick={() => {
                navigate('/verify');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-brand-paper border border-brand-border text-brand-ink font-sans text-sm font-semibold shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              <span>VERIFY BATCH DOCUMENTATION</span>
            </button>

            <div className="text-center text-xs text-brand-steel pt-1">
              FOR RESEARCH USE ONLY · NOT FOR HUMAN USE
            </div>
          </div>
        </div>
      )}
    </>
  );
};
