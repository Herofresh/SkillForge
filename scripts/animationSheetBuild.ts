/**
 * CLI behind `npm run animations:sheet` (runs via tsx, PLAN 6.4, ADR-053): renders a contact
 * sheet per animation group into docs/screenshots/ for review. Commit the results.
 *
 * While tuning poses: `npm run animations:sheet -- --only pull_up,squat --cell 8 --out <png>`
 * renders just those node ids (or `pattern:<name>`) at a bigger cell size.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

import { NODE_ANIMATIONS, PATTERN_ANIMATIONS } from '@/data/animations';
import { H_PUSH_ANIMATIONS } from '@/data/animations/h_push';
import { HANDSTAND_ANIMATIONS } from '@/data/animations/handstand';
import { ICONIC_ANIMATIONS } from '@/data/animations/iconic';
import { LEGS_ANIMATIONS } from '@/data/animations/legs';
import { PLANCHE_ANIMATIONS } from '@/data/animations/planche';
import { V_PULL_ANIMATIONS } from '@/data/animations/v_pull';
import { V_PUSH_ANIMATIONS } from '@/data/animations/v_push';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { renderSheet, SHEET_CELL, type SheetEntry } from './animationSheet';
import { encodePng } from './png';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();

function entries(record: Readonly<Record<string, FigureAnimation>>, prefix = ''): SheetEntry[] {
  return Object.entries(record).map(([label, animation]) => ({
    label: `${prefix}${label}`,
    animation,
  }));
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function write(path: string, sheet: SheetEntry[], cell: number) {
  const image = renderSheet(sheet, cell);
  const absolute = isAbsolute(path) ? path : join(ROOT, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, encodePng(image));
  console.log(`Wrote ${path} (${image.width}×${image.height}, ${sheet.length} rows)`);
}

const ALL: SheetEntry[] = [...entries(NODE_ANIMATIONS), ...entries(PATTERN_ANIMATIONS, 'pattern:')];

const only = argument('only');
if (only !== undefined) {
  const wanted = only.split(',');
  const picked = ALL.filter((entry) => wanted.includes(entry.label));
  write(argument('out') ?? 'animations.png', picked, Number(argument('cell') ?? SHEET_CELL));
} else {
  write('docs/screenshots/6.4a-v_pull.png', entries(V_PULL_ANIMATIONS), SHEET_CELL);
  write('docs/screenshots/6.4a-iconic.png', entries(ICONIC_ANIMATIONS), SHEET_CELL);
  write('docs/screenshots/6.4a-patterns.png', entries(PATTERN_ANIMATIONS, 'pattern:'), SHEET_CELL);
  write('docs/screenshots/6.4b-h_push.png', entries(H_PUSH_ANIMATIONS), SHEET_CELL);
  write('docs/screenshots/6.4b-v_push.png', entries(V_PUSH_ANIMATIONS), SHEET_CELL);
  write('docs/screenshots/6.4b-planche.png', entries(PLANCHE_ANIMATIONS), SHEET_CELL);
  write('docs/screenshots/6.4b-handstand.png', entries(HANDSTAND_ANIMATIONS), SHEET_CELL);
  write('docs/screenshots/6.4b-legs.png', entries(LEGS_ANIMATIONS), SHEET_CELL);
}
