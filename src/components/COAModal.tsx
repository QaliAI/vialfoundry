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
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = '#F1F5F9';
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
    const paddingLeft = 40;
    const paddingBottom = 28;
    const paddingTop = 18;
    const paddingRight = 20;

    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('mAU (214nm)', 6, 14);
    ctx.fillText('Retention Time (min)', width / 2 - 40, height - 8);

    // Render Chromatogram Curve
    const points = batch.chromatogramPoints;
    if (points.length > 0) {
      const maxTime = 25;
      const maxSig = Math.max(...points.map(p => p.signal)) * 1.1;

      ctx.beginPath();
      ctx.strokeStyle = '#0891B2'; // Deep cyan curve
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
      grad.addColorStop(0, 'rgba(8, 145, 178, 0.18)');
      grad.addColorStop(1, 'rgba(8, 145, 178, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Annotate Peaks
      batch.peaks.forEach(p => {
        const px = paddingLeft + (p.retentionTime / maxTime) * plotW;
        const match = points.find(pt => Math.abs(pt.time - p.retentionTime) < 1.0);
        const sig = match ? match.signal : 1000;
        const py = (height - paddingBottom) - (sig / maxSig) * plotH;

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(`P${p.peakNo} (${p.retentionTime.toFixed(1)}m)`, px - 16, py - 8);

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

  }, [batch]);

  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900">
        
        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                VERIFIED COA
              </span>
              <span className="text-xs font-mono text-slate-500">LOT: {batch.lotNumber}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {batch.productName}
            </h2>
            <p className="text-xs font-mono text-slate-500">
              CAS: {batch.casNumber} | Analytical Method: {batch.analyticalMethod}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateCOAPDF(batch)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs shadow-sm transition-all font-display"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">RP-HPLC PURITY</div>
            <div className="font-mono text-xl font-bold text-emerald-700">
              {batch.purity.toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500">Peak area ratio</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">IDENTITY MASS</div>
            <div className="font-mono text-sm font-bold text-slate-900 flex items-center space-x-1 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ESI-MS PASS</span>
            </div>
            <div className="text-[11px] text-slate-500">m/z verified</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">TESTING LAB</div>
            <div className="text-xs font-semibold text-slate-900 truncate mt-1">
              {batch.testingLab}
            </div>
            <div className="text-[11px] text-slate-500">Independent Lab</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">TEST DATE</div>
            <div className="font-mono text-xs font-bold text-slate-900 mt-1">
              {batch.testingDate}
            </div>
            <div className="text-[11px] text-slate-500">Batch Archive Record</div>
          </div>
        </div>

        {/* Interactive HPLC Chromatogram Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
              High-Performance Liquid Chromatography (HPLC) Trace
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Wavelength: 214 nm</span>
          </div>

          <div className="relative w-full h-60 rounded-xl bg-white border border-slate-200 overflow-hidden p-1 shadow-2xs">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Peak Integration Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Peak Integration Table
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Peak #</th>
                  <th className="px-4 py-2.5">Retention Time (min)</th>
                  <th className="px-4 py-2.5">Area (uV*sec)</th>
                  <th className="px-4 py-2.5">Height (uV)</th>
                  <th className="px-4 py-2.5 text-right">Area %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {batch.peaks.map((p) => (
                  <tr key={p.peakNo} className={p.areaPercent > 50 ? 'bg-cyan-50/50 font-bold text-slate-900' : 'text-slate-600'}>
                    <td className="px-4 py-2.5">Peak {p.peakNo}</td>
                    <td className="px-4 py-2.5">{p.retentionTime.toFixed(2)}</td>
                    <td className="px-4 py-2.5">{p.area.toLocaleString()}</td>
                    <td className="px-4 py-2.5">{p.height.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">
                      {p.areaPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Laboratory Notes */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-mono font-semibold text-cyan-800 uppercase">Analyst & Quality Remarks</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {batch.labNotes}
          </p>
        </div>

        {/* Footer RUO Disclaimer */}
        <div className="pt-2 text-center text-[11px] font-mono text-slate-500 border-t border-slate-100">
          FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION OR THERAPEUTIC APPLICATION
        </div>
      </div>
    </div>
  );
};

