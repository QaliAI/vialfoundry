'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Layers, FileCheck, ShoppingCart,
  Users, Tag, Share2, Settings, LogOut, ArrowLeft, ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on admin login page, render children directly without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Inventory', path: '/admin/inventory', icon: Layers },
    { label: 'Batches & COAs', path: '/admin/batches', icon: FileCheck },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Discounts', path: '/admin/discounts', icon: Tag },
    { label: 'Affiliates', path: '/admin/affiliates', icon: Share2 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          
          {/* Logo Header */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold font-mono">
              VF
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white block leading-none">
                VIAL FOUNDRY
              </span>
              <span className="mono-tag text-[9px] text-cyan-400 uppercase tracking-widest block mt-0.5">
                Admin Console
              </span>
            </div>
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
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
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
        <div className="space-y-2 pt-4 border-t border-white/10">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>
          <button
            onClick={() => router.push('/admin/login')}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#08090B]">
        {children}
      </main>
    </div>
  );
}
