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
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-brand-canvas">
      
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          Support & Procurement
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Contact Vial Foundry
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          Contact our team for institutional procurement inquiries, lot documentation requests, or reference standard specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-brand-ink">Institutional Support</h3>
            <p className="text-xs text-brand-steel font-normal leading-relaxed">
              We respond to qualified research and institutional procurement inquiries within standard business hours.
            </p>

            <div className="space-y-3 pt-2 text-xs font-sans text-brand-ink">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-brand-accent" />
                <span className="font-semibold text-brand-ink font-mono">support@vialfoundry.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-brand-mineral" />
                <span>Vial Foundry Operations</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-paper border border-brand-border text-xs font-sans text-brand-steel leading-relaxed">
            <strong className="text-brand-ink block mb-1 font-semibold uppercase tracking-wider text-[11px]">Research Use Only Notice</strong>
            Support is strictly limited to technical, analytical, and shipping inquiries. We do not provide administration, dosing, or therapeutic guidance.
          </div>
        </div>

        {/* Right Column Form */}
        <div className="lg:col-span-7 storefront-card p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-6">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-brand-mineral mx-auto" />
              <h3 className="font-display text-xl font-bold text-brand-ink">Inquiry Received</h3>
              <p className="text-xs font-sans text-brand-steel">
                Thank you for contacting Vial Foundry. A member of our team will follow up via email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Researcher Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Alex Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Institution / Lab</label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="BioTech Research Institute"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vance@institution.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Inquiry Type</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite cursor-pointer"
                >
                  <option value="Institutional Procurement Inquiry">Institutional Procurement Inquiry</option>
                  <option value="Batch COA Verification Request">Batch COA Verification Request</option>
                  <option value="Custom Synthesis Quote">Custom Synthesis Quote</option>
                  <option value="Shipping & Cold Chain Support">Shipping & Cold Chain Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Message & Specifications</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide batch lot numbers, required quantity, or technical specifications..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
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
