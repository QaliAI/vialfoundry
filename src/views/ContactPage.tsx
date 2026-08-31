import React, { useState } from 'react';
import { Mail, Building2, CheckCircle2, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    email: '',
    subject: 'Institutional Procurement Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      /* optimistic UI — the request is best-effort */
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-[#FAFAF9]">
      
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
          SUPPORT & PROCUREMENT
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Vial Foundry
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
          Reach our analytical support team for institutional procurement inquiries, batch COA documentation requests, or custom standard requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Institutional Support</h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We respond to qualified research and institutional procurement inquiries within 12 business hours.
            </p>

            <div className="space-y-3 pt-2 text-xs font-mono text-slate-700">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-cyan-700" />
                <span className="font-semibold text-slate-900">support@vialfoundry.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Vial Foundry Material Operations</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">RESEARCH USE ONLY DISCLAIMER</strong>
            Material support is strictly limited to technical, analytical, and shipping inquiries. We do not provide administration, dosing, or therapeutic guidance.
          </div>
        </div>

        {/* Right Column Form */}
        <div className="lg:col-span-7 storefront-card p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-display text-xl font-bold text-slate-900">Inquiry Received</h3>
              <p className="text-xs font-mono text-slate-600">
                Thank you for contacting Vial Foundry. A member of our quality & procurement team will follow up via email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-700 uppercase font-semibold">Researcher Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Alex Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-cyan-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-700 uppercase font-semibold">Institution / Lab</label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="BioTech Research Institute"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-700 uppercase font-semibold">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vance@institution.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-700 uppercase font-semibold">Inquiry Type</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-cyan-600 cursor-pointer"
                >
                  <option value="Institutional Procurement Inquiry">Institutional Procurement Inquiry</option>
                  <option value="Batch COA Verification Request">Batch COA Verification Request</option>
                  <option value="Custom Synthesis Quote">Custom Synthesis Quote</option>
                  <option value="Shipping & Cold Chain Support">Shipping & Cold Chain Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-700 uppercase font-semibold">Message & Specifications</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide batch lot numbers, required quantity, or technical specifications..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-cyan-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

