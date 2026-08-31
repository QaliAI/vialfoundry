import fs from 'fs';
import path from 'path';

const PRODUCTS = [
  { id: 'vf-std-001', slug: 'bpc-157', title: 'BPC-157', subtitle: '5 mg Lyophilized Vial', cas: '137525-51-0', sku: 'VF-SKU-991', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-002', slug: 'tb-500', title: 'TB-500', subtitle: '10 mg Lyophilized Vial', cas: '77591-33-4', sku: 'VF-SKU-992', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-003', slug: 'semaglutide', title: 'SEMAGLUTIDE', subtitle: '5 mg Lyophilized Vial', cas: '910463-68-2', sku: 'VF-SKU-993', cap: '#0E7490', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-004', slug: 'tirzepatide', title: 'TIRZEPATIDE', subtitle: '10 mg Lyophilized Vial', cas: '2023788-19-2', sku: 'VF-SKU-994', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-005', slug: 'retatrutide', title: 'RETATRUTIDE', subtitle: '10 mg Lyophilized Vial', cas: '2381089-83-2', sku: 'VF-SKU-995', cap: '#0E7490', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-006', slug: 'cjc-1295', title: 'CJC-1295', subtitle: '5 mg Lyophilized Vial', cas: '863288-34-0', sku: 'VF-SKU-996', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-007', slug: 'ipamorelin', title: 'IPAMORELIN', subtitle: '5 mg Lyophilized Vial', cas: '170851-70-4', sku: 'VF-SKU-997', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-008', slug: 'nad-plus', title: 'NAD+', subtitle: '1000 mg Crystalline Powder', cas: '53-84-9', sku: 'VF-SKU-998', cap: '#334155', cakeColor: '#FEF9C3', type: 'vial' },
  { id: 'vf-std-009', slug: 'ghk-cu', title: 'GHK-Cu', subtitle: '50 mg Powder Vial', cas: '49557-75-7', sku: 'VF-SKU-999', cap: '#2563EB', cakeColor: '#3B82F6', type: 'vial' },
  { id: 'vf-std-010', slug: 'bacteriostatic-water', title: 'BACTERIOSTATIC WATER', subtitle: '30 mL Sterile Diluent', cas: '7732-18-5', sku: 'VF-SKU-1000', cap: '#0284C7', cakeColor: 'transparent', type: 'large-vial' },
  { id: 'vf-std-011', slug: 'sermorelin', title: 'SERMORELIN', subtitle: '5 mg Lyophilized Vial', cas: '86168-78-7', sku: 'VF-SKU-1011', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-012', slug: 'tesamorelin', title: 'TESAMORELIN', subtitle: '5 mg Lyophilized Vial', cas: '218949-48-5', sku: 'VF-SKU-1012', cap: '#0E7490', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-013', slug: 'pt-141', title: 'PT-141', subtitle: '10 mg Lyophilized Vial', cas: '189691-06-3', sku: 'VF-SKU-1013', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-014', slug: 'selank', title: 'SELANK', subtitle: '10 mg Lyophilized Vial', cas: '129954-34-3', sku: 'VF-SKU-1014', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-015', slug: 'semax', title: 'SEMAX', subtitle: '10 mg Lyophilized Vial', cas: '80714-61-0', sku: 'VF-SKU-1015', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-016', slug: 'epithalon', title: 'EPITHALON', subtitle: '10 mg Lyophilized Vial', cas: '307297-39-8', sku: 'VF-SKU-1016', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-017', slug: 'thymosin-alpha-1', title: 'THYMOSIN ALPHA-1', subtitle: '10 mg Lyophilized Vial', cas: '62304-98-7', sku: 'VF-SKU-1017', cap: '#0E7490', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-018', slug: 'mots-c', title: 'MOTS-c', subtitle: '10 mg Lyophilized Vial', cas: '1627580-64-6', sku: 'VF-SKU-1018', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-019', slug: 'aod-9604', title: 'AOD-9604', subtitle: '5 mg Lyophilized Vial', cas: '221231-10-3', sku: 'VF-SKU-1019', cap: '#0891B2', cakeColor: '#FFFFFF', type: 'vial' },
  { id: 'vf-std-020', slug: 'acetonitrile', title: 'ACETONITRILE', subtitle: '1 L HPLC Gradient Grade', cas: '75-05-8', sku: 'VF-SKU-1020', cap: '#D97706', cakeColor: '#78350F', type: 'bottle' }
];

function generateVialSVG(p) {
  const isBottle = p.type === 'bottle';
  const isLarge = p.type === 'large-vial';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <!-- Background studio lighting -->
    <radialGradient id="bg-grad-${p.slug}" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="65%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#EEF2F6" />
    </radialGradient>
    
    <!-- Floor reflection shadow -->
    <radialGradient id="drop-shadow-${p.slug}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(15, 23, 42, 0.18)" />
      <stop offset="60%" stop-color="rgba(15, 23, 42, 0.04)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>

    <!-- Glass Bottle Body Gradient -->
    <linearGradient id="glass-body-${p.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.85)" />
      <stop offset="15%" stop-color="rgba(240, 249, 255, 0.45)" />
      <stop offset="40%" stop-color="rgba(255, 255, 255, 0.15)" />
      <stop offset="70%" stop-color="rgba(255, 255, 255, 0.35)" />
      <stop offset="90%" stop-color="rgba(224, 242, 254, 0.55)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.90)" />
    </linearGradient>

    <!-- Glass Specular Highlight -->
    <linearGradient id="specular-${p.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.95)" />
      <stop offset="50%" stop-color="rgba(255, 255, 255, 0.1)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.6)" />
    </linearGradient>

    <!-- Aluminum Crimp Seal -->
    <linearGradient id="crimp-grad-${p.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#CBD5E1" />
      <stop offset="25%" stop-color="#F1F5F9" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>

    <!-- Flip Top Cap -->
    <linearGradient id="cap-grad-${p.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${p.cap}" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.4" />
      <stop offset="70%" stop-color="${p.cap}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.5" />
    </linearGradient>

    <!-- Lyophilized Cake / Liquid Fill Gradient -->
    <linearGradient id="cake-grad-${p.slug}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${p.cakeColor === 'transparent' ? 'rgba(255,255,255,0.4)' : p.cakeColor === '#3B82F6' ? '#60A5FA' : '#FFFFFF'}" />
      <stop offset="100%" stop-color="${p.cakeColor === 'transparent' ? 'rgba(224,242,254,0.3)' : p.cakeColor === '#3B82F6' ? '#2563EB' : '#E2E8F0'}" />
    </linearGradient>

    <!-- Label Paper Gradient -->
    <linearGradient id="label-paper-${p.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="5%" stop-color="#FFFFFF" />
      <stop offset="92%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
  </defs>

  <!-- Studio Background Canvas -->
  <rect width="800" height="800" fill="url(#bg-grad-${p.slug})" rx="16" />

  <!-- Shadow below bottle -->
  <ellipse cx="400" cy="690" rx="${isBottle ? 190 : 150}" ry="32" fill="url(#drop-shadow-${p.slug})" />
  <ellipse cx="400" cy="686" rx="${isBottle ? 130 : 100}" ry="18" fill="rgba(15, 23, 42, 0.25)" />

  <!-- VIAL STRUCTURE -->
  <g id="vial-assembly" transform="translate(0, -20)">
    
    <!-- Flip Cap (Top) -->
    <rect x="330" y="160" width="140" height="28" rx="10" fill="url(#cap-grad-${p.slug})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
    <rect x="335" y="163" width="130" height="6" rx="3" fill="rgba(255,255,255,0.45)" />

    <!-- Rubber Stopper Neck -->
    <rect x="350" y="186" width="100" height="16" rx="4" fill="#334155" />

    <!-- Aluminum Crimp Collar -->
    <rect x="338" y="198" width="124" height="34" rx="6" fill="url(#crimp-grad-${p.slug})" stroke="#94A3B8" stroke-width="1" />
    <line x1="338" y1="214" x2="462" y2="214" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />

    <!-- Glass Neck & Body -->
    <path d="M 346 230 L 346 265 Q 346 310 270 330 L 270 650 Q 270 675 300 675 L 500 675 Q 530 675 530 650 L 530 330 Q 454 310 454 265 L 454 230 Z" 
          fill="url(#glass-body-${p.slug})" 
          stroke="rgba(148, 163, 184, 0.4)" 
          stroke-width="1.5" />

    <!-- Inner Lyophilized Pellet / Powder Plug at bottom -->
    ${p.cakeColor !== 'transparent' ? `
    <path d="M 276 565 Q 276 550 400 550 Q 524 550 524 565 L 524 645 Q 524 668 500 668 L 300 668 Q 276 668 276 645 Z" 
          fill="url(#cake-grad-${p.slug})" 
          opacity="0.95" />
    <ellipse cx="400" cy="565" rx="118" ry="12" fill="${p.cakeColor === '#3B82F6' ? '#93C5FD' : '#FFFFFF'}" opacity="0.6" />
    ` : `
    <path d="M 276 430 Q 400 440 524 430 L 524 645 Q 524 668 500 668 L 300 668 Q 276 668 276 645 Z" 
          fill="url(#cake-grad-${p.slug})" 
          opacity="0.6" />
    <ellipse cx="400" cy="430" rx="120" ry="10" fill="rgba(255,255,255,0.7)" />
    `}

    <!-- BRANDED LABORATORY LABEL (Wrapped onto Vial) -->
    <g id="label-wrap" transform="translate(0, 0)">
      <!-- Label Background Base -->
      <rect x="276" y="345" width="248" height="200" rx="4" fill="url(#label-paper-${p.slug})" stroke="#CBD5E1" stroke-width="1" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))" />
      
      <!-- Top Brand Cyan Bar -->
      <rect x="276" y="345" width="248" height="6" fill="#0891B2" />

      <!-- Brand Logo / Wordmark Header -->
      <g transform="translate(294, 368)">
        <rect x="0" y="0" width="14" height="14" rx="3" fill="#0F172A" />
        <rect x="3.5" y="3.5" width="7" height="7" rx="1" fill="#06B6D4" />
        <text x="20" y="11" font-family="'Outfit', 'Inter', sans-serif" font-size="11" font-weight="800" fill="#0F172A" letter-spacing="0.5">VIAL FOUNDRY</text>
        <text x="108" y="11" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="600" fill="#0891B2" letter-spacing="1">RUO</text>
      </g>

      <!-- Label Divider Line -->
      <line x1="294" y1="392" x2="506" y2="392" stroke="#E2E8F0" stroke-width="1" />

      <!-- Main Product Name -->
      <text x="294" y="422" font-family="'Outfit', 'Inter', sans-serif" font-size="${p.title.length > 14 ? '17' : '22'}" font-weight="800" fill="#0F172A" letter-spacing="-0.5">${p.title}</text>
      
      <!-- Product Presentation / Size Subhead -->
      <text x="294" y="442" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" fill="#0891B2" letter-spacing="0.2">${p.subtitle.toUpperCase()}</text>

      <!-- Technical Metadata Grid -->
      <g transform="translate(294, 464)">
        <rect x="0" y="0" width="102" height="28" rx="3" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="0.75" />
        <text x="8" y="11" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="600" fill="#64748B">CAS REGISTRY</text>
        <text x="8" y="23" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" fill="#0F172A">${p.cas}</text>

        <rect x="110" y="0" width="102" height="28" rx="3" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="0.75" />
        <text x="118" y="11" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="600" fill="#64748B">SKU IDENTIFIER</text>
        <text x="118" y="23" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" fill="#0F172A">${p.sku}</text>
      </g>

      <!-- Bottom Compliance Strip -->
      <g transform="translate(294, 508)">
        <rect x="0" y="0" width="212" height="24" rx="3" fill="#0F172A" />
        <text x="106" y="15" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">FOR RESEARCH USE ONLY · NOT FOR HUMAN USE</text>
      </g>

      <!-- Left / Right 3D Label Curvature Overlays -->
      <rect x="276" y="345" width="14" height="200" fill="url(#specular-${p.slug})" opacity="0.2" />
      <rect x="510" y="345" width="14" height="200" fill="rgba(0,0,0,0.08)" />
    </g>

    <!-- Glass Specular Vertical Highlight Strip -->
    <path d="M 284 330 L 284 660 Q 284 668 296 668 L 306 668 Q 296 668 296 655 L 296 330 Z" fill="url(#specular-${p.slug})" opacity="0.8" />
    <path d="M 512 330 L 512 660 Q 512 668 504 668 L 496 668 Q 504 668 504 655 L 504 330 Z" fill="rgba(255,255,255,0.4)" />
    
    <!-- Base Curved Glass Rim -->
    <path d="M 270 650 Q 270 675 300 675 L 500 675 Q 530 675 530 650 Q 400 665 270 650 Z" fill="rgba(203, 213, 225, 0.5)" />
  </g>
</svg>`;
}

const outDir = path.resolve('public/assets/vials/products');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

PRODUCTS.forEach(p => {
  const svg = generateVialSVG(p);
  const svgPath = path.join(outDir, `${p.slug}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');
});
console.log(`Generated ${PRODUCTS.length} distinct branded product assets in ${outDir}`);

// Also create a hero composite SVG asset
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800" width="1000" height="800">
  <defs>
    <radialGradient id="hero-bg" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </radialGradient>
    <radialGradient id="hero-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(15, 23, 42, 0.16)" />
      <stop offset="70%" stop-color="transparent" />
    </radialGradient>
  </defs>
  <rect width="1000" height="800" fill="url(#hero-bg)" rx="24" />
  <ellipse cx="500" cy="720" rx="400" ry="40" fill="url(#hero-shadow)" />
  
  <!-- Left Supporting Vial (TB-500) -->
  <g transform="translate(80, 40) scale(0.85)">
    <ellipse cx="400" cy="690" rx="130" ry="25" fill="rgba(15, 23, 42, 0.12)" />
    <rect x="330" y="160" width="140" height="28" rx="10" fill="#0891B2" />
    <rect x="338" y="198" width="124" height="34" rx="6" fill="#CBD5E1" />
    <path d="M 346 230 L 346 265 Q 346 310 270 330 L 270 650 Q 270 675 300 675 L 500 675 Q 530 675 530 650 L 530 330 Q 454 310 454 265 L 454 230 Z" fill="rgba(255,255,255,0.7)" stroke="#CBD5E1" stroke-width="1.5" />
    <rect x="276" y="350" width="248" height="190" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
    <rect x="276" y="350" width="248" height="6" fill="#0891B2" />
    <text x="294" y="380" font-family="'Outfit', sans-serif" font-size="12" font-weight="800" fill="#0F172A">VIAL FOUNDRY</text>
    <text x="294" y="420" font-family="'Outfit', sans-serif" font-size="22" font-weight="800" fill="#0F172A">TB-500</text>
    <text x="294" y="440" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#0891B2">10 MG · REFERENCE STANDARD</text>
    <rect x="294" y="495" width="212" height="22" rx="3" fill="#0F172A" />
    <text x="400" y="510" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="700" fill="#FFFFFF" text-anchor="middle">FOR RESEARCH USE ONLY</text>
  </g>

  <!-- Right Supporting Bottle (Bacteriostatic Water) -->
  <g transform="translate(380, 60) scale(0.82)">
    <ellipse cx="400" cy="690" rx="140" ry="25" fill="rgba(15, 23, 42, 0.12)" />
    <rect x="330" y="160" width="140" height="28" rx="10" fill="#0284C7" />
    <rect x="338" y="198" width="124" height="34" rx="6" fill="#CBD5E1" />
    <path d="M 346 230 L 346 265 Q 346 310 270 330 L 270 650 Q 270 675 300 675 L 500 675 Q 530 675 530 650 L 530 330 Q 454 310 454 265 L 454 230 Z" fill="rgba(255,255,255,0.7)" stroke="#CBD5E1" stroke-width="1.5" />
    <rect x="276" y="350" width="248" height="190" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
    <rect x="276" y="350" width="248" height="6" fill="#0284C7" />
    <text x="294" y="380" font-family="'Outfit', sans-serif" font-size="12" font-weight="800" fill="#0F172A">VIAL FOUNDRY</text>
    <text x="294" y="418" font-family="'Outfit', sans-serif" font-size="18" font-weight="800" fill="#0F172A">BAC WATER</text>
    <text x="294" y="438" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#0284C7">30 ML · STERILE SOLVENT</text>
    <rect x="294" y="495" width="212" height="22" rx="3" fill="#0F172A" />
    <text x="400" y="510" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="700" fill="#FFFFFF" text-anchor="middle">FOR RESEARCH USE ONLY</text>
  </g>

  <!-- Center Hero Star Product (BPC-157) -->
  <g transform="translate(180, 0) scale(1.0)">
    <ellipse cx="400" cy="690" rx="160" ry="30" fill="rgba(15, 23, 42, 0.22)" />
    <rect x="330" y="160" width="140" height="28" rx="10" fill="#0891B2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
    <rect x="338" y="198" width="124" height="34" rx="6" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1" />
    <path d="M 346 230 L 346 265 Q 346 310 270 330 L 270 650 Q 270 675 300 675 L 500 675 Q 530 675 530 650 L 530 330 Q 454 310 454 265 L 454 230 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="1.5" />
    
    <!-- White lyophilized cake at bottom -->
    <path d="M 276 565 Q 276 550 400 550 Q 524 550 524 565 L 524 645 Q 524 668 500 668 L 300 668 Q 276 668 276 645 Z" fill="#FFFFFF" stroke="#E2E8F0" opacity="0.95" />

    <!-- Label -->
    <rect x="276" y="345" width="248" height="200" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.08))" />
    <rect x="276" y="345" width="248" height="6" fill="#0891B2" />
    
    <g transform="translate(294, 368)">
      <rect x="0" y="0" width="14" height="14" rx="3" fill="#0F172A" />
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" fill="#06B6D4" />
      <text x="20" y="11" font-family="'Outfit', sans-serif" font-size="11" font-weight="800" fill="#0F172A">VIAL FOUNDRY</text>
      <text x="108" y="11" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="600" fill="#0891B2">RUO</text>
    </g>
    <line x1="294" y1="392" x2="506" y2="392" stroke="#E2E8F0" stroke-width="1" />
    
    <text x="294" y="424" font-family="'Outfit', sans-serif" font-size="24" font-weight="800" fill="#0F172A">BPC-157</text>
    <text x="294" y="444" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#0891B2">5 MG · REFERENCE STANDARD</text>
    
    <g transform="translate(294, 464)">
      <rect x="0" y="0" width="102" height="28" rx="3" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="0.75" />
      <text x="8" y="11" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="600" fill="#64748B">CAS REGISTRY</text>
      <text x="8" y="23" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" fill="#0F172A">137525-51-0</text>

      <rect x="110" y="0" width="102" height="28" rx="3" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="0.75" />
      <text x="118" y="11" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="600" fill="#64748B">SKU IDENTIFIER</text>
      <text x="118" y="23" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" fill="#0F172A">VF-SKU-991</text>
    </g>
    
    <g transform="translate(294, 508)">
      <rect x="0" y="0" width="212" height="24" rx="3" fill="#0F172A" />
      <text x="106" y="15" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" fill="#FFFFFF" text-anchor="middle">FOR RESEARCH USE ONLY · NOT FOR HUMAN USE</text>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, 'hero-product-composition.svg'), heroSvg, 'utf8');
console.log('Generated hero composite: public/assets/vials/products/hero-product-composition.svg');
