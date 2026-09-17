#!/usr/bin/env node

/** Authoritative entry point for deterministic Vial Foundry product assets. */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import os from 'node:os';

const backend = path.resolve('scripts/brand/generate-product-images.py');
const candidates = [
  process.env.VF_PYTHON,
  path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'),
  'python',
  'py',
].filter(Boolean);
let lastError = '';

for (const executable of candidates) {
  const args = executable === 'py' ? ['-3', backend] : [backend];
  const temporaryDeps = path.resolve('.tmp/vf-asset-deps');
  const pythonPath = [temporaryDeps, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter);
  const result = spawnSync(executable, args, {
    stdio: 'inherit',
    env: { ...process.env, PYTHONPATH: pythonPath },
  });
  if (!result.error && result.status === 0) process.exit(0);
  lastError = result.error?.message || `exit ${result.status}`;
}

console.error(`Unable to run the Vial Foundry renderer: ${lastError}`);
process.exit(1);
