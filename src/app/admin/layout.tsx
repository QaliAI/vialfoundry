'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Layers, FileCheck, ShoppingCart,
  Users, Tag, Share2, Settings, LogOut, ArrowLeft, Inbox, DollarSign, Menu, X
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on admin login page, render children directly without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Products Catalog', path: '/admin/products', icon: Package },
    { label: 'Inventory Matrix', path: '/admin/inventory', icon: Layers },
    { label: 'Batches & COAs', path: '/admin/batches', icon: FileCheck },
    { label: 'Affiliates Ledger', path: '/admin/affiliates', icon: Share2 },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Enquiries', path: '/admin/inquiries', icon: Inbox },
    { label: 'Finance', path: '/admin/finance', icon: DollarSign },
    { label: 'Promotions', path: '/admin/discounts', icon: Tag },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    localStorage.removeItem('vf_admin_authenticated');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen lg:flex bg-brand-ink text-slate-100 font-sans">
      {/* Mobile top bar. The desktop sidebar is a fixed 256px column, which
          squeezes the console unusably on a phone, so below lg it collapses
          behind this toggle. */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-brand-ink border-b border-brand-graphite/40">
        <BrandLogo variant="horizontal" height={22} tone="white" />
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          className="p-2 rounded-lg border border-brand-graphite/60 text-slate-200"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`w-64 bg-brand-ink border-r border-brand-graphite/40 flex-col justify-between p-4 flex-shrink-0
          fixed inset-y-0 left-0 z-40 overflow-y-auto transition-transform lg:static lg:translate-x-0 lg:flex
          ${mobileNavOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'}`}
      >
        <div className="space-y-6">
          
          {/* Logo Header */}
          <div className="px-2 py-1">
            <BrandLogo variant="horizontal" height={26} tone="white" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mt-2">
              Admin Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { setMobileNavOpen(false); router.push(item.path); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all ${
                    isActive
                      ? 'bg-brand-graphite text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-brand-primary-hover/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-4 border-t border-brand-graphite/40">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-sans text-slate-400 hover:text-white hover:bg-brand-primary-hover/40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-sans text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-brand-ink/95">
        {children}
      </main>
    </div>
  );
}
