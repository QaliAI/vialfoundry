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
  /**
   * Physical and formulation facts about the material itself (form, salt, buffer,
   * filtration). NOT a place for measured analytical results — purity figures, mass
   * confirmations and assay values are lot-specific and belong on a certificate,
   * surfaced through the documentation status instead.
   */
  materialNotes: string[];
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

/**
 * Documentation state for a product lot. Never infer one of these — it is derived
 * from whether an authentic, supplier-issued record has been configured.
 *
 *  'verified' — a real batch/COA record has been supplied and is on file.
 *  'pending'  — the lot exists but authentic documentation has not been supplied yet.
 *  'none'     — no lot record exists for this product.
 */
export type DocumentationStatus = 'verified' | 'pending' | 'none';

/**
 * A batch record transcribed from an authentic Certificate of Analysis.
 *
 * Only `lotNumber`, `productId`, `productName` and `issuedBy` are required: real
 * COAs vary in what they report, and any field left undefined is simply not
 * rendered. Never populate a field with an estimated, typical or generated value —
 * an absent field is correct, an invented one is not.
 */
export interface BatchRecord {
  lotNumber: string;
  productId: string;
  productName: string;
  /** Laboratory or manufacturer that issued the document, exactly as printed on it. */
  issuedBy: string;
  casNumber?: string;
  manufacturingDate?: string;
  testingDate?: string;
  expiryDate?: string;
  /** Analytical method exactly as stated on the document, e.g. 'RP-HPLC (UV 214 nm)'. */
  analyticalMethod?: string;
  /** Reported purity, only if the document states one. */
  purity?: number;
  identityVerified?: boolean;
  appearancePass?: boolean;
  massVerificationPass?: boolean;
  endotoxin?: string;
  /** Peak integration table, only if transcribed from the document. */
  peaks?: PeakIntegration[];
  /** Chromatogram trace, only if digitised from the document. */
  chromatogramPoints?: { time: number; signal: number }[];
  /** Path to the authentic source document. This is the primary evidence. */
  documentUrl?: string;
  labNotes?: string;
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
