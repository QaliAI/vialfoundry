import React, { useEffect, useRef } from 'react';
import { X, Download, CheckCircle2 } from 'lucide-react';
import { BatchRecord } from '../types';
import { generateCOAPDF } from '../utils/pdfGenerator';

interface COAModalProps {
  batch: BatchRecord | null;
  onClose: () => void;
}

export const COAModal: React.FC<COAModalProps> = ({ batch, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!batch || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw HPLC Chromatogram on Clean Light Canvas
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Canvas Background
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = '#E0DACD';
    ctx.lineWidth = 0.75;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    const paddingLeft = 40;
    const paddingBottom = 28;
    const paddingTop = 18;
    const paddingRight = 20;

    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;

    ctx.strokeStyle = '#777C80';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#34383B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('mAU (214nm)', 6, 14);
    ctx.fillText('Retention Time (min)', width / 2 - 50, height - 8);

    // Render Chromatogram Curve
    const points = batch.chromatogramPoints;
    if (points.length > 0) {
      const maxTime = 25;
      const maxSig = Math.max(...points.map(p => p.signal)) * 1.1;

      ctx.beginPath();
      ctx.strokeStyle = '#28463E'; // Brand mineral trace
      ctx.lineWidth = 2;

      points.forEach((pt, i) => {
        const x = paddingLeft + (pt.time / maxTime) * plotW;
        const y = (height - paddingBottom) - (pt.signal / maxSig) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Fill area under curve
      const lastPt = points[points.length - 1];
      ctx.lineTo(paddingLeft + (lastPt.time / maxTime) * plotW, height - paddingBottom);
      ctx.lineTo(paddingLeft + (points[0].time / maxTime) * plotW, height - paddingBottom);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(40, 70, 62, 0.15)');
      grad.addColorStop(1, 'rgba(40, 70, 62, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Annotate Peaks
      batch.peaks.forEach(p => {
        const px = paddingLeft + (p.retentionTime / maxTime) * plotW;
        const match = points.find(pt => Math.abs(pt.time - p.retentionTime) < 1.0);
        const sig = match ? match.signal : 1000;
        const py = (height - paddingBottom) - (sig / maxSig) * plotH;

        ctx.fillStyle = '#1B1D1F';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(`P${p.peakNo} (${p.retentionTime}m)`, px - 16, py - 8);

        ctx.fillStyle = '#A47342';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

  }, [batch]);

  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-brand-paper border border-brand-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-brand-ink">
        
        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-brand-border/60 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-brand-canvas text-brand-mineral text-xs font-mono font-bold border border-brand-border">
                CERTIFICATE OF ANALYSIS
              </span>
              <span className="text-xs font-mono text-brand-steel">LOT: {batch.lotNumber}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-brand-ink">
              {batch.productName}
            </h2>
            <p className="text-xs font-mono text-brand-steel">
              CAS: {batch.casNumber} | Method: {batch.analyticalMethod}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateCOAPDF(batch)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-brand-steel hover:text-brand-ink hover:bg-brand-surface-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border space-y-0.5">
            <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">RP-HPLC PURITY</div>
            <div className="font-mono text-xl font-bold text-brand-mineral">
              {batch.purity.toFixed(2)}%
            </div>
            <div className="text-[11px] text-brand-steel">Peak Area Integration</div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border space-y-0.5">
            <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">IDENTITY CONFIRMATION</div>
            <div className="font-mono text-sm font-bold text-brand-ink flex items-center space-x-1 mt-1">
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>ESI-MS MATCH</span>
            </div>
            <div className="text-[11px] text-brand-steel">m/z confirmed</div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border space-y-0.5">
            <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">ANALYTICAL LAB</div>
            <div className="text-xs font-semibold text-brand-ink truncate mt-1">
              {batch.testingLab}
            </div>
            <div className="text-[11px] text-brand-steel">Analytical Record</div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border space-y-0.5">
            <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">TEST DATE</div>
            <div className="font-mono text-xs font-bold text-brand-ink mt-1">
              {batch.testingDate}
            </div>
            <div className="text-[11px] text-brand-steel">Lot-Specific Entry</div>
          </div>
        </div>

        {/* HPLC Chromatogram Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">
              High-Performance Liquid Chromatography (HPLC) Profile
            </h3>
            <span className="text-[10px] font-mono text-brand-steel">UV 214 nm</span>
          </div>

          <div className="relative w-full h-60 rounded-xl bg-brand-paper border border-brand-border overflow-hidden p-1 shadow-2xs">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Peak Integration Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">
            Peak Integration Data
          </h3>

          <div className="overflow-x-auto rounded-xl border border-brand-border shadow-2xs">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-brand-canvas text-brand-graphite uppercase text-[10px] border-b border-brand-border">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Peak #</th>
                  <th className="px-4 py-2.5 font-semibold">Retention Time (min)</th>
                  <th className="px-4 py-2.5 font-semibold">Area (uV*sec)</th>
                  <th className="px-4 py-2.5 font-semibold">Height (uV)</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Area %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 bg-brand-paper">
                {batch.peaks.map((p) => (
                  <tr key={p.peakNo} className={p.areaPercent > 50 ? 'bg-brand-canvas/60 font-bold text-brand-ink' : 'text-brand-steel'}>
                    <td className="px-4 py-2.5">Peak {p.peakNo}</td>
                    <td className="px-4 py-2.5">{p.retentionTime.toFixed(2)}</td>
                    <td className="px-4 py-2.5">{p.area.toLocaleString()}</td>
                    <td className="px-4 py-2.5">{p.height.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-brand-mineral">
                      {p.areaPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Laboratory Notes */}
        <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border space-y-1">
          <div className="text-[10px] font-sans font-semibold text-brand-graphite uppercase tracking-wider">Analyst Notes</div>
          <p className="text-xs text-brand-steel leading-relaxed">
            {batch.labNotes}
          </p>
        </div>

        {/* Footer RUO Disclaimer */}
        <div className="pt-2 text-center text-[11px] font-sans text-brand-steel border-t border-brand-border/60">
          FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION OR THERAPEUTIC APPLICATION
        </div>
      </div>
    </div>
  );
};
