export type ProductCategory = 
  | 'Analytical Standards'
  | 'Single Compounds'
  | 'Reference Materials'
  | 'Specialty Materials'
  | 'Lab Supplies';

export interface Product {
  id: string;
  slug?: string;
  sku: string;
  name: string;
  casNumber: string;
  sequence?: string;
  chemicalFormula: string;
  molecularWeight: string;
  category: ProductCategory;
  size: string;
  purityPercentage: number;
  lotNumber: string;
  price: number;
  inStock: boolean;
  stockCount: number;
  description: string;
  technicalNotes: string[];
  storageConditions: string;
  appearance: string;
  solubility: string;
  image: string;
  transparentImage: string;
  coaAvailable: boolean;
  coaDate: string;
}

export interface PeakIntegration {
  peakNo: number;
  retentionTime: number; // in minutes
  area: number; // uV*sec
  height: number; // uV
  areaPercent: number; // %
}

export interface BatchRecord {
  lotNumber: string;
  productId: string;
  productName: string;
  casNumber: string;
  manufacturingDate: string;
  testingDate: string;
  expiryDate: string;
  testingLab: string;
  analyticalMethod: 'HPLC-UV / LC-MS' | 'HPLC-DAD' | 'UHPLC-MS/MS' | 'NMR / Mass Spec';
  purity: number; // e.g. 99.6
  identityVerified: boolean;
  appearancePass: boolean;
  massVerificationPass: boolean;
  endotoxinPass?: boolean;
  peaks: PeakIntegration[];
  chromatogramPoints: { time: number; signal: number }[];
  pdfUrl?: string;
  labNotes: string;
}

export interface ResearchArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
