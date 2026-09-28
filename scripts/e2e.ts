/**
 * `npm run e2e` (PLAN 5.2): runs the Maestro flows in `.maestro/` without Maestro on PATH.
 *
 * Finds the CLI in this order: `MAESTRO_BIN` (a full path), the default install
 * (`~/.maestro/bin/maestro`, on Windows `%USERPROFILE%\.maestro\maestro\bin\maestro.bat` or
 * `~/.maestro/bin/maestro.bat`), then `maestro` on PATH. Sets `MAESTRO_CLI_NO_ANALYTICS=1`.
 * Extra arguments are passed through, e.g. `npm run e2e -- .maestro/tree.yaml`.
 *
 * Plain Node (type stripping) with built-ins only.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const isWindows = process.platform === 'win32';

function maestroCandidates(): string[] {
  const home = homedir();
  const fromEnv = process.env.MAESTRO_BIN ? [process.env.MAESTRO_BIN] : [];
  const installed = isWindows
    ? [
        join(home, '.maestro', 'maestro', 'bin', 'maestro.bat'),
        join(home, '.maestro', 'bin', 'maestro.bat'),
      ]
    : [
        join(home, '.maestro', 'bin', 'maestro'),
        join(home, '.maestro', 'maestro', 'bin', 'maestro'),
      ];
  return [...fromEnv, ...installed];
}

function resolveMaestro(): string {
  return maestroCandidates().find((path) => existsSync(path)) ?? 'maestro';
}

const args = process.argv.slice(2);
const maestro = resolveMaestro();
const command = isWindows && maestro.includes(' ') ? `"${maestro}"` : maestro;
const result = spawnSync(command, ['test', ...(args.length > 0 ? args : ['.maestro'])], {
  stdio: 'inherit',
  // .bat files need a shell on Windows.
  shell: isWindows,
  env: { ...process.env, MAESTRO_CLI_NO_ANALYTICS: '1' },
});

if (result.error) {
  console.error(
    `Could not start Maestro (${maestro}): ${result.error.message}. Install it or set MAESTRO_BIN.`,
  );
  process.exit(1);
}
process.exit(result.status ?? 1);
