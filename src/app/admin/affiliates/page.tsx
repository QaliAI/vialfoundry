'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Plus, Copy, CheckCircle2, DollarSign, Users, Check, X, Clock, FileText } from 'lucide-react';
import { starterAffiliates, bpsToPercent, percentToBps } from '@/lib/affiliates/utils.mjs';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  commission_rate_bps: number;
  status: string;
  total_conversions?: number;
  total_earned?: number;
}

interface AffiliateApplication {
  id: string;
  name: string;
  email: string;
  website?: string;
  audience?: string;
  payout_method?: string;
  status: string;
  created_at: string;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'partners' | 'applications'>('partners');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState('10');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/affiliates');
      if (res.ok) {
        const data = await res.json();
        if (data.affiliates && data.affiliates.length > 0) {
          setAffiliates(data.affiliates);
        } else {
          // Fallback starter affiliates
          setAffiliates(
            starterAffiliates.map((a, idx) => ({
              id: `aff-${idx}`,
              name: a.display_name || a.name || 'Partner',
              email: a.email || `${a.code.toLowerCase()}@partner.vialfoundry.com`,
              referral_code: a.code,
              commission_rate_bps: a.commission_rate_bps || 1000,
              status: a.status || 'active',
              total_conversions: idx === 0 ? 12 : 3,
              total_earned: idx === 0 ? 480.0 : 92.5,
            }))
          );
        }

        if (data.applications) {
          setApplications(data.applications);
        }
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    setAffiliates(
      starterAffiliates.map((a, idx) => ({
        id: `aff-${idx}`,
        name: a.display_name || a.name || 'Partner',
        email: a.email || `${a.code.toLowerCase()}@partner.vialfoundry.com`,
        referral_code: a.code,
        commission_rate_bps: a.commission_rate_bps || 1000,
        status: a.status || 'active',
        total_conversions: idx === 0 ? 12 : 3,
        total_earned: idx === 0 ? 480.0 : 92.5,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveApp = async (app: AffiliateApplication) => {
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_application',
          applicationId: app.id,
          name: app.name,
          email: app.email,
          commissionRateBps: 1000,
        }),
      });

      if (res.ok) {
        setActionMessage(`Approved affiliate application for ${app.name}`);
        loadData();
      } else {
        setActionMessage(`Failed to approve application`);
      }
    } catch (err) {
      console.error('[admin/affiliates/approve] error:', err);
      setActionMessage('Failed to approve application');
    }
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRejectApp = async (applicationId: string) => {
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_application',
          applicationId,
        }),
      });

      if (res.ok) {
        setActionMessage('Application marked as rejected');
        loadData();
      }
    } catch (err) {
      console.error('[admin/affiliates/reject] error:', err);
      setActionMessage('Failed to reject application');
    }
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleCopyLink = (code: string) => {
    const link = `https://vialfoundry.com/r/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateBps = percentToBps(newPercent) || 1000;

    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newName,
          email: newEmail,
          referralCode: newCode,
          commissionRateBps: rateBps,
        }),
      });

      if (res.ok) {
        loadData();
      }
    } catch {
      // Local optimistic addition
    }

    setAffiliates([
      ...affiliates,
      {
        id: `aff-${Date.now()}`,
        name: newName,
        email: newEmail,
        referral_code: newCode.toUpperCase(),
        commission_rate_bps: rateBps,
        status: 'active',
        total_conversions: 0,
        total_earned: 0,
      },
    ]);

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewCode('');
    setNewPercent('10');
  };

  const pendingApps = applications.filter((app) => app.status === 'new' || app.status === 'pending');

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Affiliates &amp; Referral Ledger</h1>
          <p className="text-xs font-mono text-slate-400">Manage research partner tracking links, commission rates, and payout statuses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Affiliate Partner</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">ACTIVE PARTNERS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-white">{affiliates.length}</div>
          <div className="text-[10px] text-slate-400">Enrolled in Program</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">PENDING APPLICATIONS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-amber-400">{pendingApps.length}</div>
          <div className="text-[10px] text-slate-400">Awaiting Review</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">ATTRIBUTION WINDOW</span>
            <Share2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-white">30 Days</div>
          <div className="text-[10px] text-slate-400">Cookie: vf_ref_partner</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-white/10 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'partners'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          Active Partners ({affiliates.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'applications'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <span>Applications Queue</span>
          {pendingApps.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-extrabold">
              {pendingApps.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Partners Table */}
      {activeTab === 'partners' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Partner Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Commission Rate</th>
                <th className="p-4">Referral Link</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Copy Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/60">
              {affiliates.map((a) => (
                <tr key={a.id} className="text-slate-300 hover:bg-white/[0.02]">
                  <td className="p-4 font-bold text-white">{a.name}</td>
                  <td className="p-4 text-slate-400">{a.email}</td>
                  <td className="p-4 font-bold text-cyan-300">{a.referral_code}</td>
                  <td className="p-4 text-emerald-400 font-bold">
                    {bpsToPercent(a.commission_rate_bps || 1000)}%
                  </td>
                  <td className="p-4 text-slate-400">
                    <span className="text-[11px] font-mono">/r/{a.referral_code}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleCopyLink(a.referral_code)}
                      className="px-3 py-1 rounded bg-slate-900 border border-white/10 hover:border-cyan-500 text-cyan-300 text-[10px] flex items-center space-x-1 ml-auto"
                    >
                      {copiedCode === a.referral_code ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applications Queue Table */}
      {activeTab === 'applications' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
          {applications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400">No affiliate applications submitted yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Website / Platform</th>
                  <th className="p-4">Audience Focus</th>
                  <th className="p-4">Payout Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/60">
                {applications.map((app) => (
                  <tr key={app.id} className="text-slate-300 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-bold text-white">{app.name}</div>
                      <div className="text-[10px] text-slate-400">{app.email}</div>
                    </td>
                    <td className="p-4 text-cyan-300">{app.website || '—'}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{app.audience || '—'}</td>
                    <td className="p-4 text-slate-300 uppercase text-[10px]">{app.payout_method || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : app.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {app.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveApp(app)}
                          className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400"
                        >
                          Approve
                        </button>
                      )}
                      {app.status === 'new' && (
                        <button
                          onClick={() => handleRejectApp(app.id)}
                          className="px-3 py-1 rounded bg-slate-800 text-rose-400 border border-rose-500/30 text-[10px] hover:bg-rose-500/20"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/15 space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Create Affiliate Partner</h3>
            
            <form onSubmit={handleCreateAffiliate} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">Partner Full Name</label>
                <input
                  type="text" required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Dr. Jordan Hayes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Contact Email</label>
                <input
                  type="email" required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="jordan@researchlab.org"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Tracking Code</label>
                  <input
                    type="text" required
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder="HAYES10"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Commission Rate (%)</label>
                  <input
                    type="number" step="0.5" required
                    value={newPercent}
                    onChange={e => setNewPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Create Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
