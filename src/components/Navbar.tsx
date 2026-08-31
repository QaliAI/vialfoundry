import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ShieldCheck, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

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
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3.5'
            : 'bg-[#FAFAF9]/90 backdrop-blur-sm border-b border-slate-200/60 py-4'
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
              className="flex items-center space-x-3 group text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm group-hover:bg-cyan-700 transition-colors">
                <div className="w-3.5 h-3.5 rounded-[2px] bg-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                  VIAL <span className="text-cyan-700 font-semibold">FOUNDRY</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-tight mt-0.5">
                  Research Materials
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-cyan-800 bg-cyan-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
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
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
                title="Search products & lot documentation"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-300">
                  ⌘K
                </kbd>
              </button>

              {/* Lab Results / Lot Lookup Badge */}
              <button
                onClick={() => navigate('/verify')}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-mono font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>LOT LOOKUP</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyan-600 text-white font-mono font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white/98 pt-20 px-6 md:hidden flex flex-col justify-between pb-10 animate-in fade-in duration-150">
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</div>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left font-medium transition-all ${
                  currentPath === item.path
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                navigate('/verify');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-sm font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>VERIFY BATCH DOCUMENTATION</span>
            </button>

            <div className="text-center text-xs text-slate-500 font-mono pt-1">
              FOR RESEARCH USE ONLY · NOT FOR HUMAN USE
            </div>
          </div>
        </div>
      )}
    </>
  );
};

