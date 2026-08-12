import { ResearchArticle } from '../types';

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  {
    slug: 'understanding-a-certificate-of-analysis',
    title: 'Understanding a Certificate of Analysis (COA)',
    category: 'Analytical Verification',
    readTime: '4 min read',
    date: 'August 2026',
    author: 'Vial Foundry Quality Assurance Team',
    excerpt: 'A comprehensive guide to interpreting chromatographic peak integration, mass spectrum confirmation, and batch-specific testing metrics.',
    tags: ['COA', 'HPLC', 'Quality Control', 'Analytical Method'],
    content: [
      'A Certificate of Analysis (COA) is the definitive technical passport of any chemical or peptide reference material. It documents empirical testing results performed on a specific lot number by an independent or certified analytical testing laboratory.',
      '### Key Elements of a Valid COA',
      '1. **Lot Identification & Batch Traceability**: The lot number on the document must exactly match the physical label etched or printed on the vial packaging.',
      '2. **Chromatographic Integration (HPLC)**: High-Performance Liquid Chromatography (HPLC) separates the compound from residual synthesis artifacts. Purity is calculated by integrating the area under the primary compound peak relative to total peak area.',
      '3. **Mass Spectrometry (LC-MS / ESI-MS)**: While HPLC proves purity (homogeneity), Mass Spectrometry verifies chemical identity by determining the exact molecular weight (m/z ratio) down to hundredths of a Dalton.',
      '4. **Appearance & Physical Properties**: Lyophilized cakes, crystalline matrices, or clear aqueous solutions are visually inspected against physical specifications.',
      'At Vial Foundry, every batch record is archived digitally and directly searchable via our Batch Verification engine.'
    ]
  },
  {
    slug: 'hplc-vs-lc-ms-analytical-methods',
    title: 'HPLC vs LC-MS: Complementary Analytical Methods',
    category: 'Chromatography & Spectrometry',
    readTime: '6 min read',
    date: 'July 2026',
    author: 'Vial Foundry Analytical Chemistry',
    excerpt: 'Why high-performance liquid chromatography and mass spectrometry must be combined to guarantee chemical identity and purity.',
    tags: ['HPLC', 'LC-MS', 'Mass Spec', 'Chromatography'],
    content: [
      'Evaluating research materials requires both quantity and identity metrics. A compound can produce a clean, single HPLC peak while being an entirely incorrect peptide sequence if the amino acid assembly was mismatched during synthesis.',
      '### High-Performance Liquid Chromatography (HPLC)',
      'HPLC operates by passing a liquid sample under high pressure through a stationary phase column (typically C18 reverse-phase). Components migrate at different speeds based on hydrophobic interactions, generating distinct UV absorption peaks at 214nm or 280nm.',
      '### Liquid Chromatography-Mass Spectrometry (LC-MS)',
      'LC-MS couples chromatographic separation directly to an ion trap or Time-of-Flight (Q-TOF) mass spectrometer. As peaks elute, molecules are ionized and accelerated through an electromagnetic field, measuring their precise mass-to-charge ratio.',
      '### The Dual Standard',
      'Relying on HPLC alone leaves room for sequence ambiguity. Relying on mass spec alone cannot detect non-ionizing or co-eluting impurities. Vial Foundry mandates combined HPLC-UV and ESI-MS for every production lot.'
    ]
  },
  {
    slug: 'why-batch-specific-documentation-matters',
    title: 'Why Batch-Specific Documentation Matters',
    category: 'Material Integrity',
    readTime: '5 min read',
    date: 'June 2026',
    author: 'Vial Foundry Operational Compliance',
    excerpt: 'Why generic "template" COAs undermine scientific rigor and how true lot-level tracking ensures material consistency.',
    tags: ['Documentation', 'Lot Tracking', 'Sourcing', 'Audit'],
    content: [
      'In chemical manufacturing, no two synthesis runs are 100% identical. Reagent grade variations, humidity, purification column wear, and lyophilization cycle parameters create subtle lot-to-lot differences.',
      '### The Problem with Template COAs',
      'Some suppliers reuse static COA graphics across multiple batches or years. This eliminates visibility into lot variance and creates significant risk for quantitative analytical experiments.',
      '### The Vial Foundry Standard',
      'Every batch produced at Vial Foundry receives its own distinct lot number (e.g., LOT-VF-8842). Testing is conducted on samples drawn directly from the final packaged lot, ensuring that the documentation reflects the exact physical contents of the vial in your laboratory.'
    ]
  }
];
