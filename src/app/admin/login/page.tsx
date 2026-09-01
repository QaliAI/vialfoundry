'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../../components/BrandLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid administrator credentials.');
      } else {
        localStorage.setItem('vf_admin_authenticated', 'true');
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-canvas text-brand-ink">
      <div className="w-full max-w-md bg-brand-paper p-8 rounded-2xl border border-brand-border space-y-6 shadow-card">
        
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo variant="horizontal" size="lg" />
          <p className="text-xs font-sans text-brand-steel">Administrator Operations Portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-brand-canvas border border-brand-danger text-brand-danger text-xs font-sans flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-brand-graphite font-semibold">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel" />
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vialfoundry.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-brand-graphite font-semibold">Access Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel" />
              <input
                type="password" required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-primary text-brand-paper font-display font-bold text-xs hover:bg-brand-graphite transition-all shadow-xs flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[10px] font-sans text-brand-steel pt-2 border-t border-brand-border/60">
          Vial Foundry Secure HMAC Cookie Session Protected
        </div>

      </div>
    </div>
  );
}
