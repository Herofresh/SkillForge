/**
 * Lockfile guard (ADR-029).
 *
 * Root cause: older npm 11 releases (e.g. 11.6.x, bundled with some Node 24 builds) write a
 * package-lock.json without optional peer entries such as `@emnapi/core` / `@emnapi/runtime`
 * (peers of `@napi-rs/wasm-runtime`). Newer npm (the one CI gets) rejects that lockfile in
 * `npm ci` with "Missing: … from lock file". Both commands below therefore run the npm version
 * pinned in package.json `devEngines.packageManager.version` via `npx`, whatever npm is local.
 *
 *   node scripts/lockfile.ts check  – `npm ci --dry-run` against a clean copy of
 *                                      package.json + package-lock.json (no node_modules needed)
 *   node scripts/lockfile.ts fix    – re-resolve package-lock.json, then run the check
 *
 * Plain Node (type stripping) with built-ins only, so CI can run it before `npm ci`.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();
const LOCK_INPUTS = ['package.json', 'package-lock.json', '.npmrc'];
const QUIET_FLAGS = '--ignore-scripts --no-audit --no-fund';

function pinnedNpmVersion(): string {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
    devEngines?: { packageManager?: { name?: string; version?: string } };
  };
  const version = pkg.devEngines?.packageManager?.version;
  if (pkg.devEngines?.packageManager?.name !== 'npm' || !version) {
    throw new Error('package.json devEngines.packageManager must pin an exact npm version');
  }
  return version;
}

/** Runs `npx npm@<pinned> <args>` in `cwd`; returns the exit code. */
function runPinnedNpm(args: string, cwd: string): number {
  // shell: true is required to launch npx(.cmd) on Windows; the command string is fixed.
  const result = spawnSync(`npx --yes npm@${pinnedNpmVersion()} ${args}`, {
    cwd,
    shell: true,
    stdio: 'inherit',
  });
  return result.status ?? 1;
}

function check(): number {
  const dir = mkdtempSync(join(tmpdir(), 'skillforge-lockfile-'));
  try {
    for (const file of LOCK_INPUTS) {
      if (existsSync(join(ROOT, file))) copyFileSync(join(ROOT, file), join(dir, file));
    }
    const code = runPinnedNpm(`ci --dry-run ${QUIET_FLAGS}`, dir);
    if (code === 0) {
      console.log(`lockfile:check OK (npm ci validation with npm@${pinnedNpmVersion()})`);
    } else {
      console.error('lockfile:check FAILED: CI `npm ci` would reject package-lock.json.');
      console.error('Run `npm run lockfile:fix` and commit the updated package-lock.json.');
    }
    return code;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function fix(): number {
  const code = runPinnedNpm(`install --package-lock-only ${QUIET_FLAGS}`, ROOT);
  return code === 0 ? check() : code;
}

const command = process.argv[2];
if (command === 'check') process.exit(check());
else if (command === 'fix') process.exit(fix());
else {
  console.error('usage: node scripts/lockfile.ts <check|fix>');
  process.exit(2);
}
