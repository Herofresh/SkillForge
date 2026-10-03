/**
 * The companion's colours (PLAN 6.10, ADR-059): a sprite palette of its own, apart from the UI
 * palette, because a JRPG sprite needs a 4–5 step ramp per material (outline, shadow, base, light,
 * specular) with warm highlights and slightly muted mid-tones, which the 25 UI colours can't give.
 * Original colours, picked for this sprite (no game's palette is copied). Skin, hair and outfit
 * are the hero's choices; every other material is fixed.
 */
import type { FinalCell, Tone } from '@/lib/sprite';

/** A ramp, darkest first: outline, shadow, base, light, and an optional specular highlight. */
export type Ramp = readonly [string, string, string, string, string?];

export interface LookOption {
  id: string;
  name: string;
  ramp: Ramp;
}

/** Skin tones; the first is the default. */
export const COMPANION_TINTS: readonly LookOption[] = [
  { id: 'fair', name: 'Fair', ramp: ['#7d4630', '#d39470', '#ecbf98', '#f9dcbb'] },
  { id: 'porcelain', name: 'Porcelain', ramp: ['#8a4f3c', '#e0a98a', '#f6d2b6', '#fff0de'] },
  { id: 'tan', name: 'Tan', ramp: ['#6b3a24', '#b8774e', '#d69a6a', '#ecc196'] },
  { id: 'olive', name: 'Olive', ramp: ['#5a3a20', '#a4784a', '#c49a68', '#dcbb8c'] },
  { id: 'brown', name: 'Brown', ramp: ['#4a2618', '#8a5434', '#a96e47', '#c68d62'] },
  { id: 'deep', name: 'Deep', ramp: ['#2e160e', '#5e3523', '#7a4a31', '#9a6646'] },
];

/** Hair colours; the first is the default. */
export const COMPANION_HAIRS: readonly LookOption[] = [
  { id: 'brown', name: 'Brown', ramp: ['#2d1a12', '#5b3a26', '#7c5236', '#a0714a'] },
  { id: 'black', name: 'Black', ramp: ['#141018', '#2b2533', '#3d3548', '#5a5068'] },
  { id: 'blond', name: 'Blond', ramp: ['#6b4a1a', '#c99a3a', '#e8c45a', '#f8e48a'] },
  { id: 'red', name: 'Red', ramp: ['#4a1410', '#a03a22', '#cc5a2e', '#e88a4a'] },
  { id: 'chestnut', name: 'Chestnut', ramp: ['#3a1e10', '#7a4020', '#9c5a2c', '#c07a44'] },
  { id: 'silver', name: 'Silver', ramp: ['#4a4a5a', '#9a9cb0', '#c4c6d6', '#eceef6'] },
];

/** Outfit dyes (shirt, cloaks, headband, plumes, banners); the first is the default. */
export const COMPANION_DYES: readonly LookOption[] = [
  { id: 'azure', name: 'Azure', ramp: ['#102446', '#2a5a9a', '#3f7fc8', '#79b0ec'] },
  { id: 'crimson', name: 'Crimson', ramp: ['#3e0f16', '#8e2230', '#c23a44', '#e8646a'] },
  { id: 'forest', name: 'Forest', ramp: ['#10301a', '#2d6a3a', '#44904e', '#74bc6c'] },
  { id: 'royal', name: 'Royal', ramp: ['#24133e', '#553088', '#7748b4', '#a47ce0'] },
  { id: 'ember', name: 'Ember', ramp: ['#4a1e08', '#a8501a', '#d87428', '#f4a44c'] },
  { id: 'ash', name: 'Ash', ramp: ['#2a2a34', '#5e6070', '#868aa0', '#b8bccc'] },
];

export const DEFAULT_TINT_ID = COMPANION_TINTS[0].id;
export const DEFAULT_HAIR_ID = COMPANION_HAIRS[0].id;
export const DEFAULT_DYE_ID = COMPANION_DYES[0].id;

/** The materials parts and accessories are drawn in. `skin`, `hair` and `outfit` are the hero's. */
export const FIXED_MATERIALS: Readonly<Record<string, Ramp>> = {
  pants: ['#1e1a26', '#3a3448', '#524a64', '#6e6684'],
  boots: ['#24140c', '#4a2c18', '#6a4224', '#8a5a32'],
  leather: ['#2e1a0e', '#6a4224', '#8e5c32', '#b47e48'],
  iron: ['#22242e', '#5e6476', '#9aa2b4', '#cfd6e2', '#ffffff'],
  darkIron: ['#100e16', '#2c2a38', '#45425a', '#6a6688', '#a8a6c8'],
  gold: ['#4a2e08', '#a87418', '#e0a830', '#f6d468', '#fff6c8'],
  bone: ['#5a5244', '#c8bca0', '#ece2c8', '#fffaee'],
  fur: ['#34323e', '#6e6a7c', '#9a96a8', '#c4c0d0'],
  leaf: ['#0e2a14', '#2a6a30', '#46984a', '#86c86a'],
  night: ['#0a0812', '#1e1a30', '#2e2846', '#463e66'],
  red: ['#3a0c10', '#8a1c24', '#c8303a', '#ee6066', '#ffc0c0'],
  rune: ['#0c3a44', '#2a8a9a', '#4ccfe0', '#a8f4fc', '#ffffff'],
  arcane: ['#2a1450', '#6a3cb4', '#9a6cf0', '#ccb4ff', '#ffffff'],
  fire: ['#5a1606', '#c84a12', '#f08a26', '#ffd060', '#fff6c8'],
  wood: ['#2a180c', '#5a3a1e', '#7a5230', '#9c7044'],
  orchid: ['#4a1438', '#b04c8c', '#e07cbc', '#ffb0e0'],
  robe: ['#4a1e08', '#b05a14', '#e08a2a', '#f8b858'],
};

/** Materials that get a specular glint on their lit top-left corners. */
export const SHINY_MATERIALS: ReadonlySet<string> = new Set([
  'iron',
  'darkIron',
  'gold',
  'red',
  'rune',
  'arcane',
  'fire',
]);

/** Fixed colours: eyes, mouth, blush, sparkles, glows, the ground shadow. */
export const FIXED_COLOURS: Readonly<Record<string, string>> = {
  eye: '#1e1424',
  eyeShine: '#ffffff',
  mouth: '#7a2e2a',
  blush: '#f09a8c',
  shadow: '#08060e',
  sparkGold: '#fff2a8',
  sparkWhite: '#ffffff',
  sparkRune: '#8ef0fc',
  sparkArcane: '#d4b8ff',
  sparkFire: '#ffb048',
  sparkRed: '#ff5a5a',
  glowGold: '#8a6418',
  glowFire: '#b04a10',
  glowFlame: '#e07a18',
  glowRune: '#1e6a78',
  glowArcane: '#5a32a0',
  glowRed: '#6a141c',
  glowLight: '#d8c070',
};

export const ALL_MATERIALS: readonly string[] = [
  'skin',
  'hair',
  'outfit',
  ...Object.keys(FIXED_MATERIALS),
];

const TONES_PER_MATERIAL = 5;
const TONE_INDEX: Readonly<Record<Tone, number>> = {
  outline: 0,
  shadow: 1,
  base: 2,
  light: 3,
  spec: 4,
};
const FIXED_KEYS = Object.keys(FIXED_COLOURS);
/** Output roles start here: one character per material × tone and per fixed colour. */
const ROLE_BASE = 0x100;

/** The role character of a finished cell (stable: the same for every look). */
export function companionRole(cell: FinalCell): string {
  if ('fixed' in cell) {
    const index = FIXED_KEYS.indexOf(cell.fixed);
    if (index < 0) throw new Error(`Unknown fixed colour "${cell.fixed}"`);
    return String.fromCharCode(ROLE_BASE + ALL_MATERIALS.length * TONES_PER_MATERIAL + index);
  }
  const material = ALL_MATERIALS.indexOf(cell.material);
  if (material < 0) throw new Error(`Unknown material "${cell.material}"`);
  return String.fromCharCode(ROLE_BASE + material * TONES_PER_MATERIAL + TONE_INDEX[cell.tone]);
}

/** The hero's colour choices (ids of `COMPANION_TINTS`, `COMPANION_HAIRS`, `COMPANION_DYES`). */
export interface CompanionLook {
  skin?: string;
  hair?: string;
  outfit?: string;
}

const pick = (options: readonly LookOption[], id: string | undefined) =>
  (options.find((option) => option.id === id) ?? options[0]).ramp;

/** The hex colour of every role a companion grid can use, for a look (unknown ids = defaults). */
export function companionColors(look: CompanionLook = {}): Readonly<Record<string, string>> {
  const ramps: Record<string, Ramp> = {
    skin: pick(COMPANION_TINTS, look.skin),
    hair: pick(COMPANION_HAIRS, look.hair),
    outfit: pick(COMPANION_DYES, look.outfit),
    ...FIXED_MATERIALS,
  };
  const colors: Record<string, string> = {};
  for (const material of ALL_MATERIALS) {
    const ramp = ramps[material];
    (['outline', 'shadow', 'base', 'light', 'spec'] as const).forEach((tone) => {
      // A ramp without a specular step shows its light tone there.
      const hex = ramp[TONE_INDEX[tone]] ?? ramp[3];
      colors[companionRole({ material, tone })] = hex as string;
    });
  }
  for (const fixed of FIXED_KEYS) colors[companionRole({ fixed })] = FIXED_COLOURS[fixed];
  return colors;
}

/** Every role character a companion grid may use (grid validation in tests). */
export const COMPANION_ROLE_CHARS: string = Object.keys(companionColors()).join('');
