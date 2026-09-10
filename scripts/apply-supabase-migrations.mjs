#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

// Parse .env.local safely
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  return Object.fromEntries(
    content.split('\n')
      .filter(l => l.includes('=') && !l.trim().startsWith('#'))
      .map(l => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
  );
}

const env = loadEnv();
const connStr = env.SUPABASE_DIRECT_CONNECTION_STRING;

if (!connStr) {
  console.error('❌ Error: SUPABASE_DIRECT_CONNECTION_STRING is not set in .env.local');
  process.exit(1);
}

// Category slugs mapping
const CATEGORIES = [
  { id: 'c1111111-1111-1111-1111-111111111111', slug: 'reference-materials', name: 'Reference Materials', desc: 'Purified peptide and chemical reference standards', order: 1 },
  { id: 'c2222222-2222-2222-2222-222222222222', slug: 'analytical-standards', name: 'Analytical Standards', desc: 'Chromatographic calibration and HPLC standards', order: 2 },
  { id: 'c3333333-3333-3333-3333-333333333333', slug: 'single-compounds', name: 'Single Compounds', desc: 'Purified single molecule research compounds', order: 3 },
  { id: 'c4444444-4444-4444-4444-444444444444', slug: 'specialty-materials', name: 'Specialty Materials', desc: 'Specialized biochemical research compounds', order: 4 },
  { id: 'c5555555-5555-5555-5555-555555555555', slug: 'lab-supplies', name: 'Lab Supplies', desc: 'Ultra-pure solvents and laboratory reconstitution media', order: 5 },
];

function categoryNameToId(name) {
  const norm = (name || '').toLowerCase();
  if (norm.includes('analytical')) return 'c2222222-2222-2222-2222-222222222222';
  if (norm.includes('single')) return 'c3333333-3333-3333-3333-333333333333';
  if (norm.includes('specialty')) return 'c4444444-4444-4444-4444-444444444444';
  if (norm.includes('lab') || norm.includes('supplies')) return 'c5555555-5555-5555-5555-555555555555';
  return 'c1111111-1111-1111-1111-111111111111'; // Reference Materials default
}

function productSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function run() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database successfully.\n');

    // 1. Run migrations in order
    const migrationFiles = [
      'supabase/migrations/01_schema.sql',
      'supabase/migrations/02_rls.sql',
      'supabase/migrations/03_reviews.sql',
      'supabase/migrations/04_payments_affiliates.sql',
      'supabase/migrations/05_commerce_core.sql',
      'supabase/migrations/06_stripe_commerce.sql',
      'supabase/migrations/07_stripe_lifecycle.sql',
    ];

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}...`);
      const sql = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
      await client.query(sql);
      console.log(`✓ Applied ${file}`);
    }

    console.log(`\nAll ${migrationFiles.length} migrations applied successfully.\n`);

    // 2. Seed Categories
    console.log('Seeding categories...');
    for (const cat of CATEGORIES) {
      await client.query(`
        INSERT INTO public.categories (id, slug, name, description, sort_order, active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;
      `, [cat.id, cat.slug, cat.name, cat.desc, cat.order]);
    }
    console.log(`✓ Seeded ${CATEGORIES.length} categories.`);

    // 3. Load authoritative products from src/data/products.ts
    console.log('Seeding authoritative catalog from src/data/products.ts...');
    const pContent = fs.readFileSync(path.resolve('src/data/products.ts'), 'utf8');
    const pJs = pContent
      .replace(/import\s+type\s+[^;]+;/g, '')
      .replace(/export\s+const\s+PRODUCTS(\s*:\s*Product\[\])?\s*=/, 'const PRODUCTS =') +
      '\nreturn PRODUCTS;';
    const products = new Function(pJs)();

    let seededProducts = 0;
    for (const p of products) {
      const slug = productSlug(p.name);
      const catId = categoryNameToId(p.category);

      await client.query(`
        INSERT INTO public.products (
          id, slug, sku, name, short_description, technical_description, category_id,
          active, featured, base_price, inventory_quantity, image_url, transparent_image_url,
          cas_number, sequence, chemical_formula, molecular_weight, storage_conditions, appearance, solubility
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          sku = EXCLUDED.sku,
          name = EXCLUDED.name,
          short_description = EXCLUDED.short_description,
          technical_description = EXCLUDED.technical_description,
          category_id = EXCLUDED.category_id,
          active = EXCLUDED.active,
          base_price = EXCLUDED.base_price,
          inventory_quantity = EXCLUDED.inventory_quantity,
          image_url = EXCLUDED.image_url,
          transparent_image_url = EXCLUDED.transparent_image_url,
          cas_number = EXCLUDED.cas_number,
          sequence = EXCLUDED.sequence,
          chemical_formula = EXCLUDED.chemical_formula,
          molecular_weight = EXCLUDED.molecular_weight,
          storage_conditions = EXCLUDED.storage_conditions,
          appearance = EXCLUDED.appearance,
          solubility = EXCLUDED.solubility;
      `, [
        p.id,
        slug,
        p.sku,
        p.name,
        p.description || null,
        p.materialNotes ? p.materialNotes.join('; ') : null,
        catId,
        true, // active
        p.id === 'vf-std-001' || p.id === 'vf-std-003', // featured
        p.price,
        p.stockCount,
        p.image || `/assets/vials/products/${slug}.webp`,
        p.transparentImage || `/assets/vials/products/${slug}.webp`,
        p.casNumber || null,
        p.sequence || null,
        p.chemicalFormula || null,
        p.molecularWeight || null,
        p.storageConditions || null,
        p.appearance || null,
        p.solubility || null,
      ]);
      seededProducts++;
    }
    console.log(`✓ Seeded ${seededProducts} authoritative products with exact pricing, SKU, and inventory.`);

    // 4. Seed Discounts
    console.log('Seeding promotional discounts...');
    await client.query(`
      INSERT INTO public.discounts (code, description, discount_type, discount_value, min_order_amount, active)
      VALUES
        ('FOUNDRY10', '10% discount on initial institutional orders', 'percentage', 10.00, 100.00, true),
        ('RESEARCH25', '$25 off orders above $200', 'fixed_amount', 25.00, 200.00, true)
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✓ Seeded standard discount codes (FOUNDRY10, RESEARCH25).');

    // 5. Seed Starter Affiliates and Aliases
    console.log('Seeding starter affiliates and referral aliases...');
    const STARTER_AFFILIATES = [
      { id: 'b1111111-1111-1111-1111-111111111111', code: 'PARTNER01', name: 'Research Partner 1', email: 'partner1@vialfoundry.com', rateBps: 1000, alias: 'vf01' },
      { id: 'b2222222-2222-2222-2222-222222222222', code: 'PARTNER02', name: 'Research Partner 2', email: 'partner2@vialfoundry.com', rateBps: 1000, alias: 'vf02' },
      { id: 'b3333333-3333-3333-3333-333333333333', code: 'LABS10', name: 'BioLabs Network', email: 'affiliates@biolabs.org', rateBps: 1000, alias: 'labs' },
    ];

    for (const aff of STARTER_AFFILIATES) {
      await client.query(`
        INSERT INTO public.affiliates (id, referral_code, name, email, commission_rate, commission_rate_bps, status, active)
        VALUES ($1, $2, $3, $4, $5, $6, 'active', true)
        ON CONFLICT (referral_code) DO UPDATE
        SET name = EXCLUDED.name, email = EXCLUDED.email, commission_rate_bps = EXCLUDED.commission_rate_bps;
      `, [aff.id, aff.code, aff.name, aff.email, aff.rateBps / 100, aff.rateBps]);

      if (aff.alias) {
        await client.query(`
          INSERT INTO public.affiliate_aliases (affiliate_id, alias_code)
          VALUES ($1, $2)
          ON CONFLICT (alias_code) DO NOTHING;
        `, [aff.id, aff.alias]);
      }
    }
    console.log('✓ Seeded starter affiliates (PARTNER01, PARTNER02, LABS10) and aliases.');

    // 6. Verify Table Counts
    console.log('\n--- VERIFICATION AUDIT ---');
    const tables = [
      'categories', 'products', 'manual_orders', 'manual_order_items',
      'affiliates', 'affiliate_aliases', 'affiliate_clicks', 'referral_revenue',
      'affiliate_applications', 'contact_requests', 'email_subscribers',
      'restock_requests', 'batches', 'coas', 'discounts', 'reviews', 'admin_audit_log'
    ];

    for (const t of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM public.${t}`);
        console.log(`  Table [public.${t}]: ${res.rows[0].count} rows`);
      } catch (e) {
        console.log(`  Table [public.${t}]: query error (${e.message})`);
      }
    }

    console.log('\n✅ Database migration and catalog initialization complete!\n');
    await client.end();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    await client.end();
    process.exit(1);
  }
}

run();
