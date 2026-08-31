'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Layers, FileCheck, ShoppingCart,
  Users, Tag, Share2, Settings, LogOut, ArrowLeft
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
    <div className="min-h-screen flex bg-brand-ink text-slate-100 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-brand-ink border-r border-brand-graphite/40 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          
          {/* Logo Header */}
          <div className="px-2 py-1">
            <BrandLogo variant="compact" size="md" inverted={true} />
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
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all ${
                    isActive
                      ? 'bg-brand-graphite text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-brand-graphite/40'
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
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-sans text-slate-400 hover:text-white hover:bg-brand-graphite/40"
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
      <main className="flex-1 overflow-y-auto p-8 bg-brand-ink/95">
        {children}
      </main>
    </div>
  );
}
