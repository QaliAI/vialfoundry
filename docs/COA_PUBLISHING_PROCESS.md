# Vial Foundry — Authentic Certificate of Analysis (COA) Publishing Process

**Document Type:** Standard Operating Procedure (SOP)  
**Classification:** Internal Operations & Quality Assurance  
**Target Audience:** Vial Foundry Owners, Technical Operators, Fulfillment Admins  
**Current Architecture:** Code-Authoritative Batch Verification Engine  

---

## 1. Operating Policy: Analytical Integrity

1. **Zero Synthetic Records**: Vial Foundry strictly prohibits synthetic, interpolated, rounded, or placeholder COA records.
2. **Current Record Count**: There are currently **0 authentic batch records** published. Storefront product pages display **"Documentation: Pending Supplier File"** or **"Batch document not yet available online"**, which is an honest, legally sound representation.
3. **Admin Upload Status**: The `/admin/batches` web interface is **intentionally read-only**. There is currently **no client-side upload UI**. Certificates cannot be uploaded through the browser. All authentic certificate publishing follows the verified code-authority procedure outlined below.

---

## 2. Ingestion & Pre-Publishing Checklist

Before any certificate is committed to the repository, the operator must verify:

- [ ] **Document Provenance**: The certificate was received directly from an accredited third-party testing laboratory or verified manufacturer analytical testing facility.
- [ ] **Physical Lot Match**: The lot number on the certificate matches the exact physical lot on hand in inventory.
- [ ] **Identity & Assay Method**: The document contains explicit analytical methodology (e.g. RP-HPLC, LC-MS, Mass Spectrometry).
- [ ] **Purity & Results**: Reported purity percentage and testing dates match the laboratory findings field-for-field.
- [ ] **PDF Authenticity**: The PDF is clean, legible, free of confidential wholesale pricing or supplier contact details, and retains the laboratory signature/stamp.

---

## 3. Step-by-Step Publishing Procedure

### Step 1: Place Official PDF in Public Storage
1. Rename the verified PDF using the uppercase lot identifier:
   ```
   LOT-VF-XXXX.pdf
   ```
2. Place the file into the repository under:
   ```
   public/documents/coa/LOT-VF-XXXX.pdf
   ```
3. Ensure file permissions allow public read access via the Next.js static asset server (`https://www.vialfoundry.com/documents/coa/LOT-VF-XXXX.pdf`).

### Step 2: Register Record in Verified Batch Registry
Open `src/data/verified-batch-records.ts` and add the new lot record to `VERIFIED_BATCH_RECORDS`:

```typescript
export const VERIFIED_BATCH_RECORDS: Record<string, BatchRecord> = {
  'LOT-VF-8842': {
    lotNumber: 'LOT-VF-8842',
    productId: 'vf-std-001',
    productName: 'BPC-157 Reference Standard',
    issuedBy: 'Name exactly as printed on the laboratory certificate',
    testingDate: 'YYYY-MM-DD',
    expiryDate: 'YYYY-MM-DD', // Optional if stated on certificate
    analyticalMethod: 'RP-HPLC (UV 214 nm) & ESI-MS',
    purity: 99.64, // Exact reported percentage
    documentUrl: '/documents/coa/LOT-VF-8842.pdf',
    labNotes: 'Third-party analytical verification confirms identity and chromatographic purity.',
  },
};
```

*Rules for Entry:*
- Never round purity (if report says `99.42%`, enter `99.42`, never `99.5%` or `99%`).
- Never attribute a test to a laboratory that did not execute it.
- If a parameter (e.g., expiry date) is absent from the report, omit the field.

### Step 3: Run Production Readiness Audit
Run the automated verification script in the terminal:
```bash
npm run check:prod
```
The audit engine will confirm:
1. Authentic COA count increments from 0.
2. The referenced PDF file exists on disk in `public/documents/coa/`.
3. The lot number correctly maps to an active product SKU in `src/data/products.ts`.
4. No synthetic batch generation rules are violated.

### Step 4: Run Quality Gates & Deploy
```bash
npm test
npm run typecheck
npm run lint
npm run build
git add public/documents/coa/ src/data/verified-batch-records.ts
git commit -m "feat(coa): publish authentic verified batch record for lot LOT-VF-XXXX"
git push origin main
```

Upon deployment to Vercel, the storefront verification portal (`/verify`) and the corresponding product detail page will automatically flip from "Documentation Pending" to "Verified Authentic Document" with full public PDF download access.

---

## 4. Future Roadmap: Automated Admin COA Management

A future release will introduce an authenticated admin upload portal backed by Supabase Storage and database RLS policies. Until that infrastructure is provisioned with cryptographically signed upload auditing, the code-authoritative workflow above serves as the single source of truth.
