#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import ts from 'typescript';
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
  { id: 'c6666666-6666-6666-6666-666666666666', slug: 'research-blends', name: 'Research Blends', desc: 'Multi-component research materials with exact configurations', order: 4 },
];

function categoryNameToId(name) {
  const norm = (name || '').toLowerCase();
  if (norm.includes('analytical')) return 'c2222222-2222-2222-2222-222222222222';
  if (norm.includes('single')) return 'c3333333-3333-3333-3333-333333333333';
  if (norm.includes('specialty')) return 'c4444444-4444-4444-4444-444444444444';
  if (norm.includes('lab') || norm.includes('supplies')) return 'c5555555-5555-5555-5555-555555555555';
  if (norm.includes('blend')) return 'c6666666-6666-6666-6666-666666666666';
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
    const allMigrationFiles = [
      'supabase/migrations/01_schema.sql',
      'supabase/migrations/02_rls.sql',
      'supabase/migrations/03_reviews.sql',
      'supabase/migrations/04_payments_affiliates.sql',
      'supabase/migrations/05_commerce_core.sql',
      'supabase/migrations/06_stripe_commerce.sql',
      'supabase/migrations/07_stripe_lifecycle.sql',
      'supabase/migrations/08_admin_users_inventory.sql',
      'supabase/migrations/09_catalog_parity_lifecycle.sql',
    ];
    // Production updates default to the newest idempotent migration. Historical
    // migrations contain legacy CREATE POLICY statements and are only intended
    // for an explicit fresh-database bootstrap.
    const migrationFiles = process.argv.includes('--all')
      ? allMigrationFiles
      : ['supabase/migrations/09_catalog_parity_lifecycle.sql'];

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
    const pJs = ts.transpileModule(pContent, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const catalogModule = { exports: {} };
    new Function('exports', 'module', pJs)(catalogModule.exports, catalogModule);
    const products = catalogModule.exports.PRODUCTS;

    let seededProducts = 0;
    for (const p of products) {
      const slug = productSlug(p.name);
      const catId = categoryNameToId(p.category);

      await client.query(`
        INSERT INTO public.products (
          id, slug, sku, name, short_description, technical_description, category_id,
          active, featured, base_price, inventory_quantity, image_url, transparent_image_url,
          cas_number, sequence, chemical_formula, molecular_weight, storage_conditions, appearance, solubility,
          family_id, display_name, display_size, catalog_status, purchasable
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25
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
          -- Preserve live inventory for existing SKUs. The source stock count is
          -- only used when a newly introduced catalog row is inserted.
          image_url = EXCLUDED.image_url,
          transparent_image_url = EXCLUDED.transparent_image_url,
          cas_number = EXCLUDED.cas_number,
          sequence = EXCLUDED.sequence,
          chemical_formula = EXCLUDED.chemical_formula,
          molecular_weight = EXCLUDED.molecular_weight,
          storage_conditions = EXCLUDED.storage_conditions,
          appearance = EXCLUDED.appearance,
          solubility = EXCLUDED.solubility,
          family_id = EXCLUDED.family_id,
          display_name = EXCLUDED.display_name,
          display_size = EXCLUDED.display_size,
          catalog_status = EXCLUDED.catalog_status,
          purchasable = EXCLUDED.purchasable;
      `, [
        p.id,
        slug,
        p.sku,
        p.name,
        p.description || null,
        p.materialNotes ? p.materialNotes.join('; ') : null,
        catId,
        p.catalogStatus === 'public' && p.purchasable === true,
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
        p.familyId,
        p.displayName || p.name,
        p.displaySize || p.size,
        p.catalogStatus,
        p.purchasable,
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

    // 5. Affiliates: Managed dynamically via admin panel / affiliate applications.
    // No synthetic starter affiliates are auto-seeded in production.
    console.log('Skipping synthetic affiliates auto-seed (managed dynamically).');

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
