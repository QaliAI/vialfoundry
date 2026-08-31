'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Vial Foundry',
    supportEmail: 'support@vialfoundry.com',
    freeShippingThreshold: 150.00,
    announcementBar: 'FOR RESEARCH USE ONLY — BATCH HPLC DOCUMENTATION ARCHIVED ON EVERY LOT',
    ruoNoticeText: 'Materials sold by Vial Foundry are intended exclusively for in vitro laboratory research.',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Central System Settings</h1>
        <p className="text-xs font-mono text-slate-400">Configure store metadata, shipping thresholds, announcement banners, and compliance defaults</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System settings updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 font-mono text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-300">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={e => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-300">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-300">Free Shipping Threshold ($)</label>
          <input
            type="number"
            value={settings.freeShippingThreshold}
            onChange={e => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300">Announcement Bar Text</label>
          <input
            type="text"
            value={settings.announcementBar}
            onChange={e => setSettings({ ...settings, announcementBar: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300">Global RUO Compliance Notice</label>
          <textarea
            rows={3}
            value={settings.ruoNoticeText}
            onChange={e => setSettings({ ...settings, ruoNoticeText: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
}
