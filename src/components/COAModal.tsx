import React, { useEffect, useRef } from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { BatchRecord } from '../types';
import { generateCOAPDF } from '../utils/pdfGenerator';

interface COAModalProps {
  batch: BatchRecord | null;
  onClose: () => void;
}

const Field: React.FC<{ label: string; value?: string | number }> = ({ label, value }) =>
  value === undefined || value === '' ? null : (
    <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border space-y-0.5">
      <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">{label}</div>
      <div className="text-xs font-mono font-semibold text-brand-ink break-words">{value}</div>
    </div>
  );

/**
 * Renders a batch record transcribed from an authentic Certificate of Analysis.
 * Every block is conditional: a field the source document does not report is
 * omitted rather than filled in.
 */
export const COAModal: React.FC<COAModalProps> = ({ batch, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const points = batch?.chromatogramPoints;
  const hasTrace = !!points && points.length > 1;

  useEffect(() => {
    if (!batch || !hasTrace || !canvasRef.current || !points) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, height);

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

    ctx.fillStyle = '#34383B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Signal', 6, 14);
    ctx.fillText('Retention Time (min)', width / 2 - 50, height - 8);

    // Scale to the digitised trace itself rather than an assumed run length.
    const maxTime = Math.max(...points.map((p) => p.time)) * 1.05 || 1;
    const maxSig = Math.max(...points.map((p) => p.signal)) * 1.1 || 1;

    ctx.beginPath();
    ctx.strokeStyle = '#28463E';
    ctx.lineWidth = 2;
    points.forEach((pt, i) => {
      const x = paddingLeft + (pt.time / maxTime) * plotW;
      const y = height - paddingBottom - (pt.signal / maxSig) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const lastPt = points[points.length - 1];
    ctx.lineTo(paddingLeft + (lastPt.time / maxTime) * plotW, height - paddingBottom);
    ctx.lineTo(paddingLeft + (points[0].time / maxTime) * plotW, height - paddingBottom);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(40, 70, 62, 0.15)');
    grad.addColorStop(1, 'rgba(40, 70, 62, 0.01)');
    ctx.fillStyle = grad;
    ctx.fill();
  }, [batch, hasTrace, points]);

  if (!batch) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate of analysis for lot ${batch.lotNumber}`}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-brand-paper border border-brand-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-brand-ink">

        <div className="flex items-start justify-between border-b border-brand-border/60 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded bg-brand-canvas text-brand-mineral text-xs font-mono font-bold border border-brand-border">
                CERTIFICATE OF ANALYSIS
              </span>
              <span className="text-xs font-mono text-brand-steel">LOT: {batch.lotNumber}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-brand-ink">{batch.productName}</h2>
            <p className="text-xs font-mono text-brand-steel">Issued by {batch.issuedBy}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateCOAPDF(batch)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download summary</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-brand-steel hover:text-brand-ink hover:bg-brand-surface-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The source document is the primary evidence — lead with it when present. */}
        {batch.documentUrl && (
          <a
            href={batch.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-brand-border-strong bg-brand-canvas hover:bg-brand-surface-muted transition-colors group"
          >
            <span className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-accent flex-shrink-0" />
              <span className="space-y-0.5">
                <span className="block font-display text-sm font-bold text-brand-ink">
                  Open the original certificate
                </span>
                <span className="block text-xs text-brand-steel">
                  Issued by {batch.issuedBy}. Everything below is our transcription of it.
                </span>
              </span>
            </span>
            <ExternalLink className="w-4 h-4 text-brand-steel group-hover:text-brand-ink flex-shrink-0" />
          </a>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field
            label="Reported purity"
            value={batch.purity !== undefined ? `${batch.purity.toFixed(2)}%` : undefined}
          />
          <Field label="Analytical method" value={batch.analyticalMethod} />
          <Field label="Issuing laboratory" value={batch.issuedBy} />
          <Field label="Test date" value={batch.testingDate} />
          <Field label="CAS registry" value={batch.casNumber} />
          <Field label="Manufactured" value={batch.manufacturingDate} />
          <Field label="Expiry" value={batch.expiryDate} />
          <Field label="Endotoxin" value={batch.endotoxin} />
        </div>

        {hasTrace && (
          <div className="space-y-2">
            <h3 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">
              Chromatogram (digitised from the source document)
            </h3>
            <div className="relative w-full h-60 rounded-xl bg-brand-paper border border-brand-border overflow-hidden p-1 shadow-2xs">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
          </div>
        )}

        {batch.peaks && batch.peaks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">
              Peak integration data
            </h3>
            <div className="overflow-x-auto rounded-xl border border-brand-border shadow-2xs">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-brand-canvas text-brand-graphite uppercase text-[10px] border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Peak #</th>
                    <th className="px-4 py-2.5 font-semibold">Retention time (min)</th>
                    <th className="px-4 py-2.5 font-semibold">Area</th>
                    <th className="px-4 py-2.5 font-semibold">Height</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Area %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60 bg-brand-paper">
                  {batch.peaks.map((p) => (
                    <tr
                      key={p.peakNo}
                      className={p.areaPercent > 50 ? 'bg-brand-canvas/60 font-bold text-brand-ink' : 'text-brand-steel'}
                    >
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
        )}

        {batch.labNotes && (
          <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border space-y-1">
            <div className="text-[10px] font-sans font-semibold text-brand-graphite uppercase tracking-wider">
              Notes from the certificate
            </div>
            <p className="text-xs text-brand-steel leading-relaxed">{batch.labNotes}</p>
          </div>
        )}

        <div className="pt-2 text-center text-[11px] font-sans text-brand-steel border-t border-brand-border/60">
          FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION OR THERAPEUTIC APPLICATION
        </div>
      </div>
    </div>
  );
};
