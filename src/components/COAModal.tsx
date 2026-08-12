import React, { useEffect, useRef } from 'react';
import { X, Download, ShieldCheck, CheckCircle2, FileSpreadsheet, Building2, Calendar, Award } from 'lucide-react';
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

    // Draw HPLC Chromatogram
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
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
    const paddingLeft = 35;
    const paddingBottom = 25;
    const paddingTop = 15;
    const paddingRight = 15;

    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Absorbance (mAU)', 5, 12);
    ctx.fillText('Retention Time (min)', width / 2 - 30, height - 5);

    // Render Chromatogram Curve
    const points = batch.chromatogramPoints;
    if (points.length > 0) {
      const maxTime = 25;
      const maxSig = Math.max(...points.map(p => p.signal)) * 1.1;

      ctx.beginPath();
      ctx.strokeStyle = '#06B6D4'; // Cyan curve
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
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Annotate Peaks
      batch.peaks.forEach(p => {
        const px = paddingLeft + (p.retentionTime / maxTime) * plotW;
        // find signal
        const match = points.find(pt => Math.abs(pt.time - p.retentionTime) < 1.0);
        const sig = match ? match.signal : 1000;
        const py = (height - paddingBottom) - (sig / maxSig) * plotH;

        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(`P${p.peakNo} (${p.retentionTime}m)`, px - 15, py - 6);

        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

  }, [batch]);

  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                VERIFIED COA
              </span>
              <span className="mono-tag text-xs text-slate-400">LOT: {batch.lotNumber}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {batch.productName}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              CAS: {batch.casNumber} | Analytical Method: {batch.analyticalMethod}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateCOAPDF(batch)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-medium text-xs shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="mono-tag text-[10px] text-slate-400 uppercase">RP-HPLC PURITY</div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {batch.purity.toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400">Peak area ratio</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="mono-tag text-[10px] text-slate-400 uppercase">IDENTITY MASS</div>
            <div className="font-mono text-base font-bold text-cyan-400 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ESI-MS PASS</span>
            </div>
            <div className="text-[10px] text-slate-400">m/z verified</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="mono-tag text-[10px] text-slate-400 uppercase">TESTING LAB</div>
            <div className="text-xs font-semibold text-white truncate">
              {batch.testingLab}
            </div>
            <div className="text-[10px] text-slate-400">Independent Lab</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="mono-tag text-[10px] text-slate-400 uppercase">TEST DATE</div>
            <div className="font-mono text-sm font-bold text-slate-200">
              {batch.testingDate}
            </div>
            <div className="text-[10px] text-slate-400">Batch Lot Record</div>
          </div>
        </div>

        {/* Interactive HPLC Chromatogram Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="mono-tag text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              High-Performance Liquid Chromatography (HPLC) Trace
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Wavelength: 214 nm</span>
          </div>

          <div className="relative w-full h-56 rounded-xl bg-slate-900 border border-white/10 overflow-hidden p-2">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Peak Integration Table */}
        <div className="space-y-3">
          <h3 className="mono-tag text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Peak Integration Table
          </h3>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Peak #</th>
                  <th className="px-4 py-2.5">Retention Time (min)</th>
                  <th className="px-4 py-2.5">Area (uV*sec)</th>
                  <th className="px-4 py-2.5">Height (uV)</th>
                  <th className="px-4 py-2.5 text-right">Area %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950">
                {batch.peaks.map((p) => (
                  <tr key={p.peakNo} className={p.areaPercent > 50 ? 'bg-cyan-500/10 font-bold text-cyan-300' : 'text-slate-300'}>
                    <td className="px-4 py-2.5">Peak {p.peakNo}</td>
                    <td className="px-4 py-2.5">{p.retentionTime.toFixed(2)}</td>
                    <td className="px-4 py-2.5">{p.area.toLocaleString()}</td>
                    <td className="px-4 py-2.5">{p.height.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-400">
                      {p.areaPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Laboratory Notes */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <div className="mono-tag text-[10px] text-cyan-400 uppercase">Analyst & Quality Remarks</div>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            {batch.labNotes}
          </p>
        </div>

        {/* Footer RUO Disclaimer */}
        <div className="pt-2 text-center text-[10px] font-mono text-slate-400 border-t border-white/5">
          RESEARCH USE ONLY — NOT FOR HUMAN CONSUMPTION OR THERAPEUTIC APPLICATION
        </div>
      </div>
    </div>
  );
};
