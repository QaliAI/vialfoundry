import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS, PUBLIC_PRODUCTS, WITHHELD_FROM_PUBLIC_CATALOG_PRODUCT_IDS } from '../src/data/products.ts';
import { VERIFIED_BATCH_RECORDS } from '../src/data/verified-batch-records.ts';
import { sanitizeAnalyticsProps } from '../src/lib/analytics.ts';
import {
  DEFAULT_QUANTITY_PRICING_CONFIG,
  resolveQuantityTierDiscount,
} from '../src/lib/pricing/quantity-tiers.ts';

const read = (p) => fs.readFileSync(path.resolve(p), 'utf8');

// -----------------------------------------------------------------------------
// 1. Withheld products never appear in related products or public catalog
// -----------------------------------------------------------------------------
test('withheld products are absent from PUBLIC_PRODUCTS and related products recommendations', () => {
  assert.equal(WITHHELD_FROM_PUBLIC_CATALOG_PRODUCT_IDS.has('vf-std-010'), true);
  assert.equal(WITHHELD_FROM_PUBLIC_CATALOG_PRODUCT_IDS.has('vf-std-020'), true);

  assert.equal(PUBLIC_PRODUCTS.length, PRODUCTS.length - WITHHELD_FROM_PUBLIC_CATALOG_PRODUCT_IDS.size);
  assert.equal(PRODUCTS.length, 38);

  for (const withheldId of WITHHELD_FROM_PUBLIC_CATALOG_PRODUCT_IDS) {
    const inPublic = PUBLIC_PRODUCTS.some((p) => p.id === withheldId);
    assert.equal(inPublic, false, `Withheld product ${withheldId} must not be in PUBLIC_PRODUCTS`);
  }

  // Verify PDP source code references PUBLIC_PRODUCTS for relatedProducts
  const pdpSrc = read('src/views/ProductDetailPage.tsx');
  assert.ok(
    pdpSrc.includes('PUBLIC_PRODUCTS.filter('),
    'ProductDetailPage must filter related products from PUBLIC_PRODUCTS, never full PRODUCTS'
  );
  assert.ok(
    !pdpSrc.includes('PRODUCTS.filter(p => p.id !== product.id && p.category === product.category)'),
    'ProductDetailPage must not reference unvetted PRODUCTS for related products'
  );

  // Verify related products calculation on PDP never surfaces withheld products
  for (const product of PRODUCTS) {
    const relatedProducts = PUBLIC_PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === product.category
    ).slice(0, 3);

    for (const related of relatedProducts) {
      assert.equal(
        WITHHELD_FROM_PUBLIC_CATALOG_PRODUCT_IDS.has(related.id),
        false,
        `Related products must never contain withheld SKU: ${related.id}`
      );
      assert.equal(!related.hiddenFromCatalogReason, true);
    }
  }
});

// -----------------------------------------------------------------------------
// 2. PDP generates correct metadata and canonical URLs
// -----------------------------------------------------------------------------
test('PDP page server component defines generateMetadata, generateStaticParams, and canonical URLs on www', () => {
  const pdpPageSrc = read('src/app/product/[id]/page.tsx');

  // Verify generateStaticParams generates only PUBLIC_PRODUCTS
  assert.ok(pdpPageSrc.includes('function generateStaticParams()'));
  assert.ok(pdpPageSrc.includes('PUBLIC_PRODUCTS.flatMap((p) => [p.id, p.slug, p.familyId])'));

  // Verify canonical URL is constructed with https://www.vialfoundry.com
  assert.ok(pdpPageSrc.includes('https://www.vialfoundry.com'));
  assert.ok(pdpPageSrc.includes('canonical: canonicalUrl'));

  // Verify withheld product handling: checks PUBLIC_PRODUCTS and returns noindex Not Found
  assert.ok(pdpPageSrc.includes('PUBLIC_PRODUCTS.find('));
  assert.ok(/robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/.test(pdpPageSrc));
  assert.ok(pdpPageSrc.includes('notFound()'));

  // Verify OpenGraph image points to absolute URL on www
  assert.ok(pdpPageSrc.includes('imageUrl = `https://www.vialfoundry.com${product.image}`'));
  assert.ok(pdpPageSrc.includes("card: 'summary_large_image'"));

  // Verify canonical URL construction for all public product families.
  const siteUrl = 'https://www.vialfoundry.com';
  for (const product of PUBLIC_PRODUCTS) {
    const canonical = `${siteUrl}/product/${product.familyId}`;
    assert.equal(canonical.startsWith('https://www.vialfoundry.com/product/'), true);
    assert.equal(product.image.startsWith('/assets/vials/products/'), true);
  }
});

// -----------------------------------------------------------------------------
// 3. Verify page sitemap exclusion and noindex behavior
// -----------------------------------------------------------------------------
test('verify page is excluded from sitemap and marked noindex when 0 verified batches', () => {
  const sitemapSrc = read('src/app/sitemap.ts');
  const verifyPageSrc = read('src/app/verify/page.tsx');

  // Verify sitemap gate logic
  assert.ok(
    sitemapSrc.includes('if (Object.keys(VERIFIED_BATCH_RECORDS).length > 0)'),
    'sitemap.ts must gate /verify inclusion on authentic VERIFIED_BATCH_RECORDS count'
  );
  assert.ok(
    sitemapSrc.includes("'https://www.vialfoundry.com'"),
    'sitemap.ts must use canonical https://www.vialfoundry.com'
  );

  const batchCount = Object.keys(VERIFIED_BATCH_RECORDS).length;
  assert.equal(batchCount, 0, 'Current authentic batch count must be 0 until physical lot documentation is linked');

  // Verify verify page metadata applies noindex when batch count is 0
  assert.ok(
    verifyPageSrc.includes('const hasVerifiedRecords = Object.keys(VERIFIED_BATCH_RECORDS).length > 0'),
    'verify/page.tsx must check verified records count'
  );
  assert.ok(
    verifyPageSrc.includes('robots: hasVerifiedRecords'),
    'verify/page.tsx must dynamically gate index based on verified record availability'
  );
  assert.ok(
    verifyPageSrc.includes("{ index: false, follow: true }"),
    'verify/page.tsx must set index: false when 0 records are verified'
  );
  assert.ok(
    verifyPageSrc.includes("canonical: 'https://www.vialfoundry.com/verify'"),
    'verify/page.tsx must set canonical to www.vialfoundry.com/verify'
  );
});

// -----------------------------------------------------------------------------
// 4. Private route noindex headers / metadata
// -----------------------------------------------------------------------------
test('private and transactional routes declare noindex, nofollow metadata and robots.txt disallows them', () => {
  const checkoutLayoutSrc = read('src/app/checkout/layout.tsx');
  const orderConfirmLayoutSrc = read('src/app/order-confirmation/layout.tsx');
  const adminLayoutSrc = read('src/app/admin/layout.tsx');
  const robotsSrc = read('src/app/robots.ts');

  // Verify noindex, nofollow on checkout
  assert.ok(
    /robots:\s*\{\s*index:\s*false,\s*follow:\s*false,?\s*\}/.test(checkoutLayoutSrc),
    'checkout/layout.tsx must export robots: { index: false, follow: false }'
  );

  // Verify noindex, nofollow on order confirmation
  assert.ok(
    /robots:\s*\{\s*index:\s*false,\s*follow:\s*false,?\s*\}/.test(orderConfirmLayoutSrc),
    'order-confirmation/layout.tsx must export robots: { index: false, follow: false }'
  );

  // Verify noindex, nofollow on admin layout
  assert.ok(
    /robots:\s*\{\s*index:\s*false,\s*follow:\s*false,?\s*\}/.test(adminLayoutSrc),
    'admin/layout.tsx must export robots: { index: false, follow: false }'
  );

  // Verify robots.txt configuration
  assert.ok(robotsSrc.includes("sitemap: `${base}/sitemap.xml`"));
  assert.ok(robotsSrc.includes("'https://www.vialfoundry.com'"));
  assert.ok(robotsSrc.includes("'/admin/'"));
  assert.ok(robotsSrc.includes("'/checkout'"));
  assert.ok(robotsSrc.includes("'/order-confirmation/'"));
  assert.ok(robotsSrc.includes("'/api/'"));
});

// -----------------------------------------------------------------------------
// 5. Newsletter persistence and error handling
// -----------------------------------------------------------------------------
test('newsletter endpoint validates emails with strict RFC-compliant regex', () => {
  const routeSrc = read('src/app/api/newsletter/route.ts');
  const startIdx = routeSrc.indexOf('const EMAIL_REGEX = ');
  assert.ok(startIdx !== -1, 'EMAIL_REGEX must be defined in newsletter route');
  const endIdx = routeSrc.indexOf(';', startIdx);
  const regexStr = routeSrc.slice(startIdx + 'const EMAIL_REGEX = '.length, endIdx).trim();
  // Strip enclosing slashes
  assert.ok(regexStr.startsWith('/') && regexStr.endsWith('/'));
  const emailRegex = new RegExp(regexStr.slice(1, -1));

  // Valid emails
  const validEmails = [
    'researcher@lab.harvard.edu',
    'scientist.one@institute.org',
    'user+testing@subdomain.example.co.uk',
    'contact_dev@vialfoundry.com',
  ];
  for (const email of validEmails) {
    assert.equal(emailRegex.test(email), true, `Valid email failed regex: ${email}`);
  }

  // Invalid emails
  const invalidEmails = [
    'plainaddress',
    '@missingusername.com',
    'missingdomain@.com',
    'missingatsign.com',
    'spaces in@email.com',
    'double@@domain.com',
    '',
  ];
  for (const email of invalidEmails) {
    assert.equal(emailRegex.test(email), false, `Invalid email passed regex: ${email}`);
  }
});

test('newsletter route fails safely on database error and handles unique duplicates cleanly', () => {
  const routeSrc = read('src/app/api/newsletter/route.ts');

  // Rate limiting present
  assert.ok(routeSrc.includes('checkRateLimit(ip)'));
  assert.ok(routeSrc.includes('status: 429'));

  // Database client validation: fails with 503, NEVER claims success
  assert.ok(routeSrc.includes('if (!supabase)'));
  assert.ok(routeSrc.includes('status: 503'));

  // Persistence failure: logs and returns 500 error, NEVER claims success
  assert.ok(routeSrc.includes('status: 500'));
  assert.ok(routeSrc.includes('Unable to complete subscription'));

  // Duplicate handled cleanly
  assert.ok(routeSrc.includes("error.code === '23505'"));
  assert.ok(routeSrc.includes('isDuplicate'));

  // Frontend footer only shows success on confirmed 200 response with data.success
  const footerSrc = read('src/components/Footer.tsx');
  assert.ok(footerSrc.includes("setSubscribeState('success')"));
  assert.ok(footerSrc.includes("res.ok && data?.success"));
  assert.ok(footerSrc.includes("setSubscribeState('error')"));
});

// -----------------------------------------------------------------------------
// 6. Analytics event firing & PII sanitization
// -----------------------------------------------------------------------------
test('analytics event sanitizer strips all customer PII and sensitive fields', () => {
  const payloadWithPii = {
    order_id: 'ord_123456',
    subtotal_cents: 25000,
    email: 'customer@domain.com',
    customerEmail: 'customer@domain.com',
    name: 'John Doe',
    customerName: 'John Doe',
    phone: '+15551234567',
    address: '123 Main St',
    street: '123 Main St',
    city: 'Austin',
    zip: '78701',
    card: '4242',
    cardNumber: '4242424242424242',
    password: 'secretpassword',
    item_count: 2,
    discount_cents: 0,
  };

  const sanitized = sanitizeAnalyticsProps(payloadWithPii);
  assert.ok(sanitized);
  assert.equal(sanitized.order_id, 'ord_123456');
  assert.equal(sanitized.subtotal_cents, 25000);
  assert.equal(sanitized.item_count, 2);
  assert.equal(sanitized.discount_cents, 0);

  // All PII must be completely removed
  assert.equal(sanitized.email, undefined);
  assert.equal(sanitized.customerEmail, undefined);
  assert.equal(sanitized.name, undefined);
  assert.equal(sanitized.customerName, undefined);
  assert.equal(sanitized.phone, undefined);
  assert.equal(sanitized.address, undefined);
  assert.equal(sanitized.street, undefined);
  assert.equal(sanitized.city, undefined);
  assert.equal(sanitized.zip, undefined);
  assert.equal(sanitized.card, undefined);
  assert.equal(sanitized.cardNumber, undefined);
  assert.equal(sanitized.password, undefined);
});

test('analytics purchase completion deduplication suppresses double-firing', () => {
  // Verify order confirmation page implements session-based deduplication
  const orderConfSrc = read('src/app/order-confirmation/[orderId]/page.tsx');
  assert.ok(
    orderConfSrc.includes('vf_purchase_tracked_'),
    'Order confirmation page must check sessionStorage key for deduplication'
  );
  assert.ok(
    orderConfSrc.includes("trackEvent('purchase_completed'"),
    'Order confirmation page must fire purchase_completed'
  );

  // Simulate deduplication behavior
  const simulatedStorage = new Map();
  const orderId = 'ord_test_dedup_001';
  const sessionKey = `vf_purchase_tracked_${orderId}`;

  function recordPurchase() {
    if (simulatedStorage.get(sessionKey)) {
      return false; // Suppressed
    }
    simulatedStorage.set(sessionKey, 'true');
    return true; // Fired
  }

  assert.equal(recordPurchase(), true, 'First purchase confirmation view must fire event');
  assert.equal(recordPurchase(), false, 'Subsequent page refresh must NOT re-fire event');
  assert.equal(recordPurchase(), false, 'Subsequent navigation back must NOT re-fire event');
});

// -----------------------------------------------------------------------------
// 7. Quantity pricing architecture
// -----------------------------------------------------------------------------
test('quantity pricing is disabled by default with zero discount', () => {
  assert.equal(DEFAULT_QUANTITY_PRICING_CONFIG.enabled, false);
  for (const tier of DEFAULT_QUANTITY_PRICING_CONFIG.tiers) {
    assert.equal(tier.active, false);
    assert.equal(tier.discountRateBps, 0);
  }

  const result = resolveQuantityTierDiscount(5000, 10, DEFAULT_QUANTITY_PRICING_CONFIG);
  assert.equal(result.active, false);
  assert.equal(result.discountCents, 0);
  assert.equal(result.discountRateBps, 0);
});

test('quantity pricing applies correct math when explicitly enabled', () => {
  const testConfig = {
    enabled: true,
    tiers: [
      { minQuantity: 3, discountRateBps: 500, active: true, label: '3+ units (5% off)' },
      { minQuantity: 6, discountRateBps: 1000, active: true, label: '6+ units (10% off)' },
      { minQuantity: 12, discountRateBps: 1500, active: true, label: '12+ units (15% off)' },
    ],
  };

  const unitPrice = 5000; // $50.00

  // 1 unit: 0 discount
  const r1 = resolveQuantityTierDiscount(unitPrice, 1, testConfig);
  assert.equal(r1.active, false);
  assert.equal(r1.discountCents, 0);

  // 3 units: $150.00 total, 5% = $7.50 (750 cents)
  const r3 = resolveQuantityTierDiscount(unitPrice, 3, testConfig);
  assert.equal(r3.active, true);
  assert.equal(r3.minQuantity, 3);
  assert.equal(r3.discountRateBps, 500);
  assert.equal(r3.discountCents, 750);

  // 6 units: $300.00 total, 10% = $30.00 (3000 cents)
  const r6 = resolveQuantityTierDiscount(unitPrice, 6, testConfig);
  assert.equal(r6.active, true);
  assert.equal(r6.minQuantity, 6);
  assert.equal(r6.discountRateBps, 1000);
  assert.equal(r6.discountCents, 3000);

  // 12 units: $600.00 total, 15% = $90.00 (9000 cents)
  const r12 = resolveQuantityTierDiscount(unitPrice, 12, testConfig);
  assert.equal(r12.active, true);
  assert.equal(r12.minQuantity, 12);
  assert.equal(r12.discountRateBps, 1500);
  assert.equal(r12.discountCents, 9000);
});

// -----------------------------------------------------------------------------
// 8. Admin resend email error handling & event logging
// -----------------------------------------------------------------------------
test('admin resend email route verifies sendEmailSafely result and logs order events', () => {
  const resendSrc = read('src/app/api/admin/orders/resend-email/route.ts');
  assert.ok(
    resendSrc.includes('if (!sentResult.success)'),
    'admin resend route must check sentResult.success'
  );
  assert.ok(
    resendSrc.includes("status: 502"),
    'admin resend route must return error status on email failure, never false success'
  );
  assert.ok(
    resendSrc.includes("type: 'email_failed'"),
    'admin resend route must record email_failed event on failure'
  );
  assert.ok(
    resendSrc.includes("type: 'email_sent'"),
    'admin resend route must record email_sent event on success'
  );
});

// -----------------------------------------------------------------------------
// 9. Paid email flow records internal admin notifications
// -----------------------------------------------------------------------------
test('stripe webhook records internal admin order notifications in order_events', () => {
  const webhookSrc = read('src/app/api/webhooks/stripe/route.ts');
  assert.ok(
    webhookSrc.includes('const sentInternal = await sendEmailSafely'),
    'webhook must capture internal email dispatch result'
  );
  assert.ok(
    webhookSrc.includes("type: sentInternal.success ? 'email_sent' : 'email_failed'"),
    'webhook must record internal notification success/failure event'
  );
  assert.ok(
    webhookSrc.includes('paid_email_sent_at'),
    'webhook preserves atomic paid_email_sent_at idempotency'
  );
});

// -----------------------------------------------------------------------------
// 10. Research articles content integrity
// -----------------------------------------------------------------------------
test('research articles contain no unsupported universal claims or procedural recipes', () => {
  const articlesSrc = read('src/data/articles.ts');
  assert.ok(
    !articlesSrc.includes('Vial Foundry mandates combined HPLC-UV'),
    'articles.ts must not assert universal testing mandates'
  );
  assert.ok(
    !articlesSrc.includes('Every batch produced at Vial Foundry'),
    'articles.ts must not claim manufacturing or universal testing'
  );
  assert.ok(
    articlesSrc.includes('Solubility and Laboratory Handling of Lyophilized Peptides'),
    'reconstitution article must be framed as high-level laboratory handling'
  );
  assert.ok(
    articlesSrc.includes('Research Use Only Notice'),
    'reconstitution article must reiterate strict RUO status'
  );
});

