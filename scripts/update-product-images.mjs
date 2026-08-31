import fs from 'fs';
import path from 'path';

const file = path.resolve('src/data/products.ts');
let content = fs.readFileSync(file, 'utf8');

const mapping = {
  'vf-std-001': 'bpc-157',
  'vf-std-002': 'tb-500',
  'vf-std-003': 'semaglutide',
  'vf-std-004': 'tirzepatide',
  'vf-std-005': 'retatrutide',
  'vf-std-006': 'cjc-1295',
  'vf-std-007': 'ipamorelin',
  'vf-std-008': 'nad-plus',
  'vf-std-009': 'ghk-cu',
  'vf-std-010': 'bacteriostatic-water',
  'vf-std-011': 'sermorelin',
  'vf-std-012': 'tesamorelin',
  'vf-std-013': 'pt-141',
  'vf-std-014': 'selank',
  'vf-std-015': 'semax',
  'vf-std-016': 'epithalon',
  'vf-std-017': 'thymosin-alpha-1',
  'vf-std-018': 'mots-c',
  'vf-std-019': 'aod-9604',
  'vf-std-020': 'acetonitrile'
};

for (const [id, slug] of Object.entries(mapping)) {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?image:\\s*)'[^']*'`);
  content = content.replace(regex, `$1'/assets/vials/products/${slug}.svg'`);
  const regexTrans = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?transparentImage:\\s*)'[^']*'`);
  content = content.replace(regexTrans, `$1'/assets/vials/products/${slug}.svg'`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated src/data/products.ts with unique product image paths');
