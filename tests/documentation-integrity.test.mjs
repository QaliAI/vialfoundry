import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(path.resolve(p), 'utf8');

/**
 * P0 regression guard: customer-facing code must never synthesize analytical data.
 * These tests fail loudly if the record generator is ever reintroduced.
 */

test('batches module contains no record generation', () => {
  const src = read('src/data/batches.ts');
  for (const banned of ['generateBatch', 'seededPick', 'seededNumber', 'chromatogramPoints:', 'peaks:']) {
    assert.ok(!src.includes(banned), `src/data/batches.ts must not contain "${banned}"`);
  }
});

test('no production source fabricates chromatogram or peak data', () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const src = fs.readFileSync(full, 'utf8');
        // Assigning literal peak/chromatogram arrays outside the authentic registry
        // means data is being invented in code rather than transcribed from a document.
        if (/(chromatogramPoints|peaks)\s*:\s*\[\s*\{/.test(src)) offenders.push(full);
      }
    }
  };
  walk(path.resolve('src'));
  const allowed = offenders.filter(
    (f) => !f.endsWith(path.join('data', 'verified-batch-records.ts'))
  );
  assert.deepEqual(allowed, [], `Fabricated analytical arrays found in: ${allowed.join(', ')}`);
});

test('every verified record names its issuing document source', async () => {
  const src = read('src/data/verified-batch-records.ts');
  // Parse the exported object literal without executing TypeScript.
  const body = src.slice(src.indexOf('= {') + 2);
  const entries = body.match(/^\s{2}'[^']+':\s*\{/gm) || [];
  for (const entry of entries) {
    const lot = entry.match(/'([^']+)'/)[1];
    const block = body.slice(body.indexOf(entry));
    const record = block.slice(0, block.indexOf('\n  }'));
    assert.ok(
      /issuedBy\s*:/.test(record),
      `Verified record ${lot} must state issuedBy (who issued the certificate)`
    );
  }
});

test('no public copy asserts universal third-party testing', () => {
  const banned = [
    'Third-Party Tested',
    'every batch record is archived',
    'Every lot is backed by a Certificate of Analysis',
  ];
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const src = fs.readFileSync(full, 'utf8');
        for (const phrase of banned) {
          if (src.includes(phrase)) offenders.push(`${full}: "${phrase}"`);
        }
      }
    }
  };
  walk(path.resolve('src'));
  assert.deepEqual(offenders, [], `Unsupported universal claims found:\n${offenders.join('\n')}`);
});
