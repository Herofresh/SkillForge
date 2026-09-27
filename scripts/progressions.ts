/**
 * CLI for the progression matrix (run through `tsx`, see package.json):
 *
 *   npm run progressions:check   validate the YAML; also reports generated files that are out of date
 *   npm run progressions:build   validate, then write the app module and the review sheet
 *   npm run progressions:review  validate, then write only the coach review sheet
 *
 * Exits with code 1 and one readable line per problem when anything is wrong.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { REVIEW_SHEET_PATH } from '@/data/progressionBuild';
import { formatIssue } from '@/data/validate';

import { REPO_ROOT, buildFromDisk, readRepoFile } from './progressionSources';

const COMMANDS = ['check', 'build', 'review'] as const;
type Command = (typeof COMMANDS)[number];

function main(command: Command): number {
  const { result, outputs } = buildFromDisk();

  if (result.issues.length > 0) {
    console.error(`Found ${result.issues.length} problem(s) in the progression files:\n`);
    for (const issue of result.issues) console.error(`  - ${formatIssue(issue)}`);
    console.error(
      '\nFix them and run the command again. Field guide: content/progressions/README.md',
    );
    return 1;
  }

  const summary = `${result.nodes.length} nodes are valid.`;
  if (command === 'check') {
    const stale = outputs.filter((output) => readRepoFile(output.path) !== output.expected);
    if (stale.length > 0) {
      console.error(`${summary} But these generated files are out of date:`);
      for (const output of stale) console.error(`  - ${output.path}`);
      console.error('Run `npm run progressions:build` and commit the result.');
      return 1;
    }
    console.log(`${summary} Generated files are up to date.`);
    return 0;
  }

  const targets =
    command === 'review' ? outputs.filter((output) => output.path === REVIEW_SHEET_PATH) : outputs;
  for (const output of targets) {
    const absolute = join(REPO_ROOT, output.path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, output.expected, 'utf8');
    console.log(`Wrote ${output.path}`);
  }
  console.log(summary);
  return 0;
}

const command = process.argv[2];
if (!(COMMANDS as readonly string[]).includes(command ?? '')) {
  console.error(`Usage: tsx scripts/progressions.ts <${COMMANDS.join('|')}>`);
  process.exit(2);
}
process.exit(main(command as Command));
