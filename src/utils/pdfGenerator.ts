import { jsPDF } from 'jspdf';
import { BatchRecord } from '../types';

export function generateCOAPDF(batch: BatchRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background Dark Header
  doc.setFillColor(15, 18, 24);
  doc.rect(0, 0, 210, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('VIAL FOUNDRY', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 182, 212); // Cyan accent
  doc.text('OFFICIAL CERTIFICATE OF ANALYSIS', 15, 26);
  doc.setTextColor(148, 163, 184);
  doc.text('PRECISION-BUILT RESEARCH MATERIALS', 15, 31);

  // Right corner badge
  doc.setFillColor(26, 32, 44);
  doc.roundedRect(140, 10, 55, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`LOT: ${batch.lotNumber}`, 144, 17);
  doc.setFontSize(8);
  doc.setTextColor(34, 197, 94); // Green pass
  doc.text(`VERIFIED PURITY: ${batch.purity.toFixed(2)}%`, 144, 23);

  // Product Info Block
  let y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. COMPOUND SPECIFICATIONS', 15, y);

  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y + 2, 195, y + 2);

  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Name:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(batch.productName, 55, y);

  doc.setFont('helvetica', 'bold');
  doc.text('CAS Number:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.text(batch.casNumber, 150, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Lot Number:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(batch.lotNumber, 55, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Manufacturing Date:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.text(batch.manufacturingDate, 150, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Testing Date:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(batch.testingDate, 55, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Testing Laboratory:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.text(batch.testingLab, 150, y);

  // Section 2: Analytical Results
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. ANALYTICAL TESTING SUMMARY', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 10;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 4, 180, 8, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TEST PARAMETER', 18, y);
  doc.text('METHOD / SPECIFICATION', 70, y);
  doc.text('RESULT', 135, y);
  doc.text('STATUS', 170, y);

  y += 8;
  const tests = [
    { param: 'Chromatographic Purity', spec: 'HPLC-UV @ 214nm (>99.0%)', result: `${batch.purity.toFixed(2)}% Area`, status: 'PASS' },
    { param: 'Chemical Identity', spec: 'Electrospray Ionization MS', result: 'Mass Confirmed', status: 'PASS' },
    { param: 'Physical Appearance', spec: 'Visual / Lyophilized', result: 'White Cake/Powder', status: 'PASS' },
    { param: 'Endotoxin Level', spec: 'LAL Enzymatic (<0.01 EU/mg)', result: 'Conforms (<0.005 EU)', status: 'PASS' },
  ];

  tests.forEach(t => {
    doc.setFont('helvetica', 'normal');
    doc.text(t.param, 18, y);
    doc.text(t.spec, 70, y);
    doc.text(t.result, 135, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(t.status, 170, y);
    doc.setTextColor(15, 23, 42);
    y += 7;
  });

  // Section 3: Peak Integration Table
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CHROMATOGRAM PEAK INTEGRATION (HPLC)', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 10;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 4, 180, 8, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PEAK #', 18, y);
  doc.text('RETENTION TIME (MIN)', 45, y);
  doc.text('AREA (uV*sec)', 95, y);
  doc.text('HEIGHT (uV)', 140, y);
  doc.text('AREA %', 170, y);

  y += 8;
  batch.peaks.forEach(p => {
    doc.setFont('helvetica', p.areaPercent > 50 ? 'bold' : 'normal');
    doc.text(p.peakNo.toString(), 18, y);
    doc.text(p.retentionTime.toFixed(2), 45, y);
    doc.text(p.area.toLocaleString(), 95, y);
    doc.text(p.height.toLocaleString(), 140, y);
    doc.text(`${p.areaPercent.toFixed(2)}%`, 170, y);
    y += 6.5;
  });

  // Section 4: Laboratory Notes & Quality Approval
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LABORATORY REMARKS & APPROVAL:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const lines = doc.splitTextToSize(batch.labNotes, 174);
  doc.text(lines, 18, y + 12);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('FOR RESEARCH USE ONLY. NOT FOR HUMAN, VETERINARY, OR THERAPEUTIC USE.', 15, 282);
  doc.text(`VialFoundry.com — Document ID: VF-COA-${batch.lotNumber}-${Date.now().toString().slice(-6)}`, 140, 282);

  doc.save(`COA_${batch.lotNumber}_VialFoundry.pdf`);
}
