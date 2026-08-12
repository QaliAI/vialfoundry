'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

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

    // Authenticate via Supabase or admin password check
    if (email === 'admin@vialfoundry.com' && password === 'foundry2026') {
      localStorage.setItem('vf_admin_authenticated', 'true');
      router.push('/admin');
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message || 'Invalid administrator credentials.');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08090B] text-slate-100">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/15 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/15 flex items-center justify-center mx-auto text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Authentication</h1>
          <p className="text-xs font-mono text-slate-400">Vial Foundry Restricted Operations Portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-slate-300">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vialfoundry.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password" required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-500 pt-2 border-t border-white/10">
          Demo Admin Credentials: <span className="text-slate-300">admin@vialfoundry.com</span> / <span className="text-slate-300">foundry2026</span>
        </div>

      </div>
    </div>
  );
}
