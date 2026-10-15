/**
 * CLI behind `npm run monsters:sheet` (runs via tsx, PLAN 7.9, ADR-071): a contact sheet of the
 * session monsters for review, one row per kind: the idle loop's two frames, the hit flash and the
 * beaten greys. Writes docs/screenshots/7.9-monsters.png (or `--out <png>`); commit the result.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

import {
  BEATEN_COLORS,
  HIT_COLORS,
  MONSTER_ART,
  MONSTER_COLORS,
  monsterFrames,
  type MonsterColors,
} from '@/data/monsters';
import { MONSTER_KINDS, MONSTER_NAMES } from '@/domain/monsters';

import { renderFrameSheet, type FrameRow } from './animationSheet';
import { encodePng } from './png';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();
/** Image pixels per sprite pixel (about the size on a phone at 3× density). */
const CELL = 8;
const DEFAULT_OUT = 'docs/screenshots/7.9-monsters.png';

const colorOf = (colors: MonsterColors) => (role: string) => colors[role as keyof MonsterColors];

/** Per kind: the idle loop, then the hit flash and the beaten greys (one palette per sheet row). */
function rowsFor(): FrameRow[] {
  return MONSTER_KINDS.flatMap((kind) => [
    {
      label: MONSTER_NAMES[kind],
      frames: monsterFrames(kind),
      colorOf: colorOf(MONSTER_COLORS[kind]),
    },
    {
      label: `${MONSTER_NAMES[kind]} hit`,
      frames: [MONSTER_ART[kind]],
      colorOf: colorOf(HIT_COLORS),
    },
    {
      label: `${MONSTER_NAMES[kind]} beaten`,
      frames: [MONSTER_ART[kind]],
      colorOf: colorOf(BEATEN_COLORS),
    },
  ]);
}

const outIndex = process.argv.indexOf('--out');
const out = outIndex >= 0 ? process.argv[outIndex + 1] : DEFAULT_OUT;
const image = renderFrameSheet(rowsFor(), CELL);
const absolute = isAbsolute(out) ? out : join(ROOT, out);
mkdirSync(dirname(absolute), { recursive: true });
writeFileSync(absolute, encodePng(image));
console.log(`Wrote ${out} (${image.width}×${image.height})`);
