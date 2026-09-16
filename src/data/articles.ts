import { ResearchArticle } from '../types';

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  {
    slug: 'understanding-a-certificate-of-analysis',
    title: 'Understanding a Certificate of Analysis (COA)',
    category: 'Analytical Verification',
    readTime: '4 min read',
    date: 'August 2026',
    author: 'Vial Foundry Quality Assurance Team',
    excerpt: 'What a certificate of analysis actually tells you, and how to read one.',
    tags: ['COA', 'HPLC', 'Quality Control', 'Analytical Method'],
    content: [
      'A Certificate of Analysis (COA) is the definitive technical passport of any chemical or peptide reference material. It documents empirical testing results performed on a specific lot number by an independent or certified analytical testing laboratory.',
      '### Key Elements of a Valid COA',
      '1. **Lot Identification & Batch Traceability**: The lot number on the document must exactly match the physical label etched or printed on the vial packaging.',
      '2. **Chromatographic Integration (HPLC)**: High-Performance Liquid Chromatography (HPLC) separates the compound from residual synthesis artifacts. Purity is calculated by integrating the area under the primary compound peak relative to total peak area.',
      '3. **Mass Spectrometry (LC-MS / ESI-MS)**: While HPLC proves purity (homogeneity), Mass Spectrometry verifies chemical identity by determining the exact molecular weight (m/z ratio) down to hundredths of a Dalton.',
      '4. **Appearance & Physical Properties**: Lyophilized cakes, crystalline matrices, or clear aqueous solutions are visually inspected against physical specifications.',
      'At Vial Foundry, any lot number can be searched in the documentation portal. The lookup returns the certificate if we hold one, or tells you plainly that documentation for that lot is still pending.'
    ]
  },
  {
    slug: 'hplc-vs-lc-ms-analytical-methods',
    title: 'HPLC vs LC-MS: Complementary Analytical Methods',
    category: 'Chromatography & Spectrometry',
    readTime: '6 min read',
    date: 'July 2026',
    author: 'Vial Foundry Analytical Chemistry',
    excerpt: 'The two main lab tests used on peptides, and why each one on its own is not enough.',
    tags: ['HPLC', 'LC-MS', 'Mass Spec', 'Chromatography'],
    content: [
      'Evaluating research materials requires both quantity and identity metrics. A compound can produce a clean, single HPLC peak while being an entirely incorrect peptide sequence if the amino acid assembly was mismatched during synthesis.',
      '### High-Performance Liquid Chromatography (HPLC)',
      'HPLC operates by passing a liquid sample under high pressure through a stationary phase column (typically C18 reverse-phase). Components migrate at different speeds based on hydrophobic interactions, generating distinct UV absorption peaks at 214nm or 280nm.',
      '### Liquid Chromatography-Mass Spectrometry (LC-MS)',
      'LC-MS couples chromatographic separation directly to an ion trap or Time-of-Flight (Q-TOF) mass spectrometer. As peaks elute, molecules are ionized and accelerated through an electromagnetic field, measuring their precise mass-to-charge ratio.',
      '### The Dual Standard',
      'Relying on HPLC alone leaves room for sequence ambiguity. Relying on mass spec alone cannot detect non-ionizing or co-eluting impurities. When third-party laboratory verification is performed, pairing HPLC-UV with mass spectrometry provides complementary confirmation of chromatographic purity and molecular weight. When a third-party certificate is available for a lot, Vial Foundry publishes the source documentation.'
    ]
  },
  {
    slug: 'why-batch-specific-documentation-matters',
    title: 'Why Batch-Specific Documentation Matters',
    category: 'Material Integrity',
    readTime: '5 min read',
    date: 'June 2026',
    author: 'Vial Foundry Operational Compliance',
    excerpt: 'Why a document has to match the exact batch you received to mean anything.',
    tags: ['Documentation', 'Lot Tracking', 'Sourcing', 'Audit'],
    content: [
      'In chemical manufacturing, no two synthesis runs are 100% identical. Reagent grade variations, humidity, purification column wear, and lyophilization cycle parameters create subtle lot-to-lot differences.',
      '### The Problem with Template COAs',
      'Some suppliers reuse static COA graphics across multiple batches or years. This eliminates visibility into lot variance and creates significant risk for quantitative analytical experiments.',
      '### Lot-Specific Traceability',
      'Each catalog item references a distinct lot number. When a third-party certificate of analysis is available for a lot, Vial Foundry links the source documentation directly to that specific lot number, ensuring transparency regarding verified data versus pending documentation.'
    ]
  },
  {
    slug: 'reconstitution-of-lyophilized-peptides',
    title: 'Solubility and Laboratory Handling of Lyophilized Peptides',
    category: 'Material Integrity',
    readTime: '5 min read',
    date: 'August 2026',
    author: 'Vial Foundry Technical Applications',
    excerpt: 'High-level laboratory considerations for handling lyophilized reference materials in in vitro research.',
    tags: ['Solubility', 'Handling', 'Material Integrity', 'RUO'],
    content: [
      'Lyophilized (freeze-dried) peptides arrive as stable amorphous powders or porous cakes. In analytical research settings, preserving material integrity requires careful handling to maintain molecular conformation and ensure assay repeatability.',
      '### Temperature Equilibration in the Laboratory',
      'Lyophilized peptide matrices are highly hygroscopic. Before opening a sealed container stored under frozen conditions, laboratories typically allow the vial to equilibrate to ambient temperature in a desiccated environment. This minimizes moisture condensation from atmospheric humidity, which can accelerate hydrolytic degradation of sensitive peptide bonds.',
      '### Sequence-Dependent Solubility Profiles',
      'Solubility characteristics vary substantially based on net molecular charge, hydrophobicity, and secondary structure. Certain sequences dissolve readily in aqueous buffers, while hydrophobic or neutral peptides may require specialized organic or dilute acid co-solvents determined by the specific experimental protocol. There is no universal solvent suitable for all peptide classes; investigators should consult established analytical literature and compound-specific technical notes before preparation.',
      '### Shear Sensitivity & Solution Stability',
      'Peptide secondary and tertiary structures are susceptible to physical shear stresses. In research handling, passive dissolution and gentle rotational agitation are generally preferred over vigorous vortexing or mechanical shaking to prevent foam formation and surface-induced denaturation. In solution, peptides exhibit significantly reduced stability compared to desiccated powder and are prone to progressive hydrolysis, deamidation, and oxidation.',
      '### Preservation of Experimental Working Solutions',
      'To prevent the repeated freeze-thaw cycles that contribute to peptide aggregation and loss of quantitative accuracy, laboratories commonly subdivide reconstituted solutions into single-use aliquots labeled with lot number and preparation date for immediate deep-freezing.',
      '### Research Use Only Notice',
      'All materials and information supplied by Vial Foundry are intended exclusively for in vitro laboratory research and analytical assays. They are not intended, labeled, or approved for human administration, veterinary administration, diagnostic procedures, or therapeutic applications.'
    ]
  },
  {
    slug: 'storage-and-handling-best-practices',
    title: 'How to Store and Handle Research Peptides',
    category: 'Material Integrity',
    readTime: '5 min read',
    date: 'July 2026',
    author: 'Vial Foundry Quality Assurance Team',
    excerpt: 'How temperature, light and moisture affect peptides, and how to store them properly.',
    tags: ['Storage', 'Stability', 'Cold Chain', 'Handling'],
    content: [
      'The analytical value of a reference standard depends on maintaining its integrity from the moment it leaves the testing lab to the moment it enters your assay. Four environmental factors dominate stability.',
      '### Temperature',
      'Most lyophilized peptides and reference standards are best stored desiccated at -20°C for long-term stability. Reconstituted solutions are far less stable and should be used promptly or aliquoted and frozen.',
      '### Moisture',
      'Peptide powders are hygroscopic. Keep vials tightly sealed with desiccant and equilibrate to room temperature before opening to prevent condensation from forming inside the vial.',
      '### Light',
      'Certain sequences and chelated complexes (for example, copper peptides) are photosensitive. Store these in amber vials or a dark environment to prevent photodegradation.',
      '### Freeze-Thaw Cycles',
      'Each freeze-thaw cycle stresses the molecule. Aliquoting reconstituted material into single-use volumes is the single most effective way to preserve potency and analytical consistency over time.',
      'Observing proper laboratory storage practices helps maintain compound stability and minimize degradation over the course of planned research studies.'
    ]
  },
  {
    slug: 'peptide-research-glossary',
    title: 'A Concise Glossary of Peptide & Analytical Terms',
    category: 'Reference',
    readTime: '7 min read',
    date: 'June 2026',
    author: 'Vial Foundry Editorial',
    excerpt: 'Plain-English definitions of the terms you will see on peptide documents.',
    tags: ['Glossary', 'Definitions', 'HPLC', 'Mass Spec'],
    content: [
      'A shared vocabulary makes analytical documentation easier to interpret. The following terms appear throughout analytical literature and reference materials.',
      '### Certificate of Analysis (COA)',
      'A lot-specific document reporting the empirical test results — purity, identity, and physical properties — for a defined batch of material.',
      '### RP-HPLC',
      'Reverse-phase high-performance liquid chromatography. A separation technique that resolves a compound from impurities based on hydrophobic interaction, reported as percent peak area.',
      '### ESI-MS',
      'Electrospray ionization mass spectrometry. Confirms molecular identity by measuring the precise mass-to-charge ratio (m/z) of the ionized molecule.',
      '### Lyophilization',
      'Freeze-drying under vacuum to produce a stable solid cake or powder from a frozen solution.',
      '### Net Peptide Content',
      'The fraction of the total mass that is actual peptide, excluding bound water and counter-ions such as acetate or TFA.',
      '### Lot / Batch Number',
      'A unique identifier tying a physical unit of product to the specific synthesis and testing records for that production run.',
      '### Retention Time (RT)',
      'The time a compound takes to travel through the chromatography column, used as a reproducible identity fingerprint under fixed method conditions.'
    ]
  }
];
