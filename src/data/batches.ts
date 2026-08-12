import { BatchRecord } from '../types';

export const BATCH_RECORDS: Record<string, BatchRecord> = {
  'LOT-VF-8842': {
    lotNumber: 'LOT-VF-8842',
    productId: 'vf-std-001',
    productName: 'BPC-157 Reference Standard',
    casNumber: '137525-51-0',
    manufacturingDate: '2026-06-04',
    testingDate: '2026-07-14',
    expiryDate: '2028-06-04',
    testingLab: 'Janoshik Analytical Laboratories',
    analyticalMethod: 'HPLC-UV / LC-MS',
    purity: 99.64,
    identityVerified: true,
    appearancePass: true,
    massVerificationPass: true,
    endotoxinPass: true,
    labNotes: 'Reverse-phase HPLC integration demonstrates single dominant chromatographic peak at RT 14.28 min. Electrospray ionization mass spectrometry (ESI-MS) confirms monoisotopic mass at 1419.56 Da.',
    peaks: [
      { peakNo: 1, retentionTime: 3.12, area: 124, height: 18, areaPercent: 0.11 },
      { peakNo: 2, retentionTime: 8.45, area: 285, height: 42, areaPercent: 0.25 },
      { peakNo: 3, retentionTime: 14.28, area: 114290, height: 12450, areaPercent: 99.64 }
    ],
    chromatogramPoints: [
      { time: 0, signal: 5 },
      { time: 2, signal: 8 },
      { time: 3.12, signal: 45 },
      { time: 4, signal: 10 },
      { time: 7, signal: 12 },
      { time: 8.45, signal: 85 },
      { time: 10, signal: 15 },
      { time: 12, signal: 20 },
      { time: 13.5, signal: 180 },
      { time: 14.28, signal: 3450 }, // Main peak
      { time: 15.1, signal: 120 },
      { time: 17, signal: 15 },
      { time: 20, signal: 8 }
    ]
  },
  'LOT-VF-9921': {
    lotNumber: 'LOT-VF-9921',
    productId: 'vf-std-002',
    productName: 'TB-500 (Thymosin Beta-4) Standard',
    casNumber: '77591-33-4',
    manufacturingDate: '2026-05-18',
    testingDate: '2026-06-28',
    expiryDate: '2028-05-18',
    testingLab: 'Alliance Analytical Services',
    analyticalMethod: 'UHPLC-MS/MS',
    purity: 99.48,
    identityVerified: true,
    appearancePass: true,
    massVerificationPass: true,
    endotoxinPass: true,
    labNotes: 'Gradient ultra-high performance liquid chromatography (UHPLC) analysis. Mass spectrum quadruply charged ion peak [M+4H]4+ at m/z 1241.88 matches sequence composition.',
    peaks: [
      { peakNo: 1, retentionTime: 4.80, area: 410, height: 55, areaPercent: 0.36 },
      { peakNo: 2, retentionTime: 18.52, area: 113400, height: 9800, areaPercent: 99.48 },
      { peakNo: 3, retentionTime: 22.10, area: 180, height: 22, areaPercent: 0.16 }
    ],
    chromatogramPoints: [
      { time: 0, signal: 10 },
      { time: 4.8, signal: 95 },
      { time: 10, signal: 12 },
      { time: 17, signal: 150 },
      { time: 18.52, signal: 2950 },
      { time: 20, signal: 80 },
      { time: 22.1, signal: 40 },
      { time: 25, signal: 10 }
    ]
  },
  'LOT-VF-7734': {
    lotNumber: 'LOT-VF-7734',
    productId: 'vf-std-003',
    productName: 'Semaglutide Analytical Standard',
    casNumber: '910463-68-2',
    manufacturingDate: '2026-06-20',
    testingDate: '2026-07-29',
    expiryDate: '2028-06-20',
    testingLab: 'Janoshik Analytical Laboratories',
    analyticalMethod: 'HPLC-UV / LC-MS',
    purity: 99.78,
    identityVerified: true,
    appearancePass: true,
    massVerificationPass: true,
    endotoxinPass: true,
    labNotes: 'C18 Reverse Phase column integration (214nm wavelength). Total impurities measured under 0.22%. Monoisotopic mass 4113.58 Da confirmed by Q-TOF mass spectrometry.',
    peaks: [
      { peakNo: 1, retentionTime: 6.20, area: 180, height: 24, areaPercent: 0.14 },
      { peakNo: 2, retentionTime: 16.74, area: 128500, height: 14200, areaPercent: 99.78 },
      { peakNo: 3, retentionTime: 21.05, area: 100, height: 12, areaPercent: 0.08 }
    ],
    chromatogramPoints: [
      { time: 0, signal: 6 },
      { time: 6.2, signal: 55 },
      { time: 12, signal: 15 },
      { time: 15.5, signal: 210 },
      { time: 16.74, signal: 3900 },
      { time: 18, signal: 90 },
      { time: 21.05, signal: 30 },
      { time: 24, signal: 8 }
    ]
  },
  'LOT-VF-8819': {
    lotNumber: 'LOT-VF-8819',
    productId: 'vf-std-004',
    productName: 'Tirzepatide Reference Standard',
    casNumber: '2023788-19-2',
    manufacturingDate: '2026-07-01',
    testingDate: '2026-08-02',
    expiryDate: '2028-07-01',
    testingLab: 'Chromatographic Verification Labs',
    analyticalMethod: 'HPLC-DAD',
    purity: 99.82,
    identityVerified: true,
    appearancePass: true,
    massVerificationPass: true,
    endotoxinPass: true,
    labNotes: 'High-resolution Diode Array Detection (DAD) spectrum across 200–400nm. Single homogenous peak confirms absence of truncated peptide impurities.',
    peaks: [
      { peakNo: 1, retentionTime: 15.90, area: 145000, height: 16100, areaPercent: 99.82 },
      { peakNo: 2, retentionTime: 19.40, area: 260, height: 35, areaPercent: 0.18 }
    ],
    chromatogramPoints: [
      { time: 0, signal: 8 },
      { time: 10, signal: 14 },
      { time: 14.5, signal: 240 },
      { time: 15.9, signal: 4100 },
      { time: 17.2, signal: 110 },
      { time: 19.4, signal: 50 },
      { time: 23, signal: 10 }
    ]
  }
};
