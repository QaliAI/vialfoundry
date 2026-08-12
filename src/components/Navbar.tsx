import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ShieldCheck, Database, Menu, X, ChevronRight } from 'lucide-react';
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Catalog', path: '/catalog' },
    { label: 'Quality', path: '/quality' },
    { label: 'Batch Verification', path: '/verify' },
    { label: 'Research Resources', path: '/resources' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#08090B]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
            : 'bg-gradient-to-b from-[#08090B]/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 group text-left focus:outline-none"
            >
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 flex items-center justify-center shadow-lg group-hover:border-cyan-500/50 transition-colors">
                <div className="w-4 h-4 rounded-sm border border-cyan-400/80 bg-cyan-500/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-tight text-white block leading-none">
                  VIAL <span className="text-cyan-400 font-light">FOUNDRY</span>
                </span>
                <span className="mono-tag text-[9px] text-slate-400 tracking-widest block uppercase mt-0.5">
                  Precision Materials
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all ${
                      isActive
                        ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Quick Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs transition-colors"
                title="Search products & lot documentation"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                  ⌘K
                </kbd>
              </button>

              {/* Verify Badge Shortcut */}
              <button
                onClick={() => navigate('/verify')}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>LOT LOOKUP</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyan-500 text-slate-950 font-mono font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white"
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
        <div className="fixed inset-0 z-30 bg-[#08090B]/95 backdrop-blur-2xl pt-24 px-6 md:hidden flex flex-col justify-between pb-12 animate-in fade-in duration-200">
          <div className="space-y-3">
            <div className="mono-tag text-xs text-cyan-400 tracking-wider uppercase mb-2">Navigation</div>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left font-medium transition-all ${
                  currentPath === item.path
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/50 border-white/5 text-slate-200 hover:border-white/15'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <button
              onClick={() => {
                navigate('/verify');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFY BATCH DOCUMENTATION</span>
            </button>

            <div className="text-center text-xs text-slate-500 font-mono pt-2">
              RUO — RESEARCH USE ONLY
            </div>
          </div>
        </div>
      )}
    </>
  );
};
