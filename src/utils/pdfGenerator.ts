import { jsPDF } from 'jspdf';
import { BatchRecord } from '../types';

/**
 * Produces a printable summary of a batch record.
 *
 * This is explicitly a transcription of a certificate issued by someone else — it is
 * not itself a certificate, and it is labelled as such on the page. Only fields the
 * source record actually carries are printed; nothing is defaulted, inferred, or
 * marked PASS on our own authority.
 */
export function generateCOAPDF(batch: BatchRecord) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(15, 18, 24);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('VIAL FOUNDRY', 15, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 205, 212);
  doc.text('BATCH RECORD SUMMARY', 15, 26);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Transcribed from the certificate issued by the laboratory named below.', 15, 31);

  doc.setFillColor(26, 32, 44);
  doc.roundedRect(140, 12, 55, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`LOT: ${batch.lotNumber}`, 144, 20.5);

  // Section 1 — what the document identifies
  let y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RECORD DETAILS', 15, y);
  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y + 2, 195, y + 2);

  const details: [string, string | undefined][] = [
    ['Product Name', batch.productName],
    ['Lot Number', batch.lotNumber],
    ['Issued By', batch.issuedBy],
    ['CAS Number', batch.casNumber],
    ['Manufacturing Date', batch.manufacturingDate],
    ['Testing Date', batch.testingDate],
    ['Expiry Date', batch.expiryDate],
    ['Analytical Method', batch.analyticalMethod],
  ];

  y += 10;
  doc.setFontSize(9);
  for (const [label, value] of details) {
    if (!value) continue; // A field the certificate does not state is left off entirely.
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(String(value), 130), 60, y);
    y += 7;
  }

  // Section 2 — reported results, only where the record states one
  const results: [string, string][] = [];
  if (batch.purity !== undefined) results.push(['Reported purity', `${batch.purity.toFixed(2)}%`]);
  if (batch.identityVerified !== undefined)
    results.push(['Identity confirmed', batch.identityVerified ? 'Yes' : 'No']);
  if (batch.massVerificationPass !== undefined)
    results.push(['Mass verification', batch.massVerificationPass ? 'Pass' : 'Fail']);
  if (batch.appearancePass !== undefined)
    results.push(['Appearance', batch.appearancePass ? 'Pass' : 'Fail']);
  if (batch.endotoxin) results.push(['Endotoxin', batch.endotoxin]);

  if (results.length > 0) {
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. REPORTED RESULTS', 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 10;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y - 4, 180, 8, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PARAMETER', 18, y);
    doc.text('AS STATED ON THE CERTIFICATE', 95, y);

    y += 8;
    doc.setFontSize(9);
    for (const [param, value] of results) {
      doc.setFont('helvetica', 'normal');
      doc.text(param, 18, y);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 95, y);
      y += 7;
    }
  }

  // Section 3 — peak table, only if transcribed from the document
  if (batch.peaks && batch.peaks.length > 0) {
    y += 8;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. PEAK INTEGRATION', 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 10;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y - 4, 180, 8, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PEAK #', 18, y);
    doc.text('RETENTION TIME (MIN)', 45, y);
    doc.text('AREA', 95, y);
    doc.text('HEIGHT', 140, y);
    doc.text('AREA %', 170, y);

    y += 8;
    for (const p of batch.peaks) {
      doc.setFont('helvetica', p.areaPercent > 50 ? 'bold' : 'normal');
      doc.text(p.peakNo.toString(), 18, y);
      doc.text(p.retentionTime.toFixed(2), 45, y);
      doc.text(p.area.toLocaleString(), 95, y);
      doc.text(p.height.toLocaleString(), 140, y);
      doc.text(`${p.areaPercent.toFixed(2)}%`, 170, y);
      y += 6.5;
    }
  }

  // Section 4 — notes exactly as they appear on the certificate
  if (batch.labNotes) {
    y += 10;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 28, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, y, 180, 28, 2, 2, 'D');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES FROM THE CERTIFICATE:', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(batch.labNotes, 174), 18, y + 12);
  }

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Summary of a certificate issued by a third party. For research use only. Not for human, veterinary, or therapeutic use.',
    15,
    282
  );
  doc.text(`VialFoundry.com — Lot ${batch.lotNumber}`, 15, 287);

  doc.save(`BatchRecord_${batch.lotNumber}_VialFoundry.pdf`);
}
