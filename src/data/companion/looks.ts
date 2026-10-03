/**
 * The companion's colours (PLAN 6.10, ADR-059): a sprite palette of its own, apart from the UI
 * palette, because a JRPG sprite needs a 4–5 step ramp per material (outline, shadow, base, light,
 * specular) with warm highlights and slightly muted mid-tones, which the 25 UI colours can't give.
 * Original colours, picked for this sprite (no game's palette is copied). Skin, hair and outfit
 * are the hero's choices; every other material is fixed.
 *
 * PLAN 6.13 (ADR-061, "less cute, more cool"): more contrast and less pastel: darker outlines (a
 * stronger silhouette on the dark UI), deeper shadows, cooler metal highlights and a steel-blue
 * iris instead of big round eyes; no blush.
 */
import type { CompanionLookChoice } from '@/domain/companion';
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
  { id: 'fair', name: 'Fair', ramp: ['#40201a', '#b06c54', '#dea07e', '#f4caa4'] },
  { id: 'porcelain', name: 'Porcelain', ramp: ['#4a2620', '#bc8270', '#eabfa2', '#fde2ca'] },
  { id: 'tan', name: 'Tan', ramp: ['#361b10', '#94573a', '#c2845a', '#e2ae86'] },
  { id: 'olive', name: 'Olive', ramp: ['#30200e', '#835e38', '#b0885a', '#d2ae80'] },
  { id: 'brown', name: 'Brown', ramp: ['#24120a', '#6c3e26', '#965e3c', '#ba8258'] },
  { id: 'deep', name: 'Deep', ramp: ['#140806', '#46251a', '#6a4230', '#906048'] },
];

/** Hair colours; the first is the default. */
export const COMPANION_HAIRS: readonly LookOption[] = [
  { id: 'brown', name: 'Brown', ramp: ['#150b07', '#462a1a', '#70472c', '#a2704a'] },
  { id: 'black', name: 'Black', ramp: ['#08070c', '#1c1926', '#332e46', '#5c5878'] },
  { id: 'blond', name: 'Blond', ramp: ['#3e280c', '#a07226', '#d8aa46', '#f6e086'] },
  { id: 'red', name: 'Red', ramp: ['#280806', '#7a2418', '#b44228', '#e47a46'] },
  { id: 'chestnut', name: 'Chestnut', ramp: ['#1c0c06', '#5a2c14', '#8a4824', '#b8723c'] },
  { id: 'silver', name: 'Silver', ramp: ['#22242e', '#767a98', '#b0b4cc', '#eef0fa'] },
];

/** Outfit dyes (shirt, cloaks, headband, plumes, banners); the first is the default. */
export const COMPANION_DYES: readonly LookOption[] = [
  { id: 'azure', name: 'Azure', ramp: ['#08122a', '#1c3c74', '#2e60aa', '#5a94d6'] },
  { id: 'crimson', name: 'Crimson', ramp: ['#22050a', '#6a1420', '#a42834', '#d44e56'] },
  { id: 'forest', name: 'Forest', ramp: ['#08180c', '#1c4a28', '#2e703e', '#589e5c'] },
  { id: 'royal', name: 'Royal', ramp: ['#120824', '#3a206c', '#5a369c', '#8862ca'] },
  { id: 'ember', name: 'Ember', ramp: ['#2a0e04', '#7e360e', '#b4581c', '#e68838'] },
  { id: 'ash', name: 'Ash', ramp: ['#121218', '#3a3c4a', '#5e6276', '#9094a8'] },
];

export const DEFAULT_TINT_ID = COMPANION_TINTS[0].id;
export const DEFAULT_HAIR_ID = COMPANION_HAIRS[0].id;
export const DEFAULT_DYE_ID = COMPANION_DYES[0].id;

/** The materials parts and accessories are drawn in. `skin`, `hair` and `outfit` are the hero's. */
export const FIXED_MATERIALS: Readonly<Record<string, Ramp>> = {
  pants: ['#0e0c14', '#2c2838', '#443e56', '#625a7a'],
  boots: ['#100804', '#331e0e', '#52321a', '#764e2a'],
  leather: ['#170c06', '#4b2c15', '#744628', '#a0683e'],
  iron: ['#0e1018', '#424a5e', '#8690a8', '#c6d2e6', '#f4faff'],
  darkIron: ['#060509', '#1a1824', '#323048', '#54527a', '#9a9ccc'],
  gold: ['#281604', '#86560e', '#ca9226', '#f2ca5a', '#fff4c0'],
  bone: ['#322c22', '#a29878', '#dad0b0', '#f8f2de'],
  fur: ['#1a1822', '#52505e', '#84808e', '#b4b0c0'],
  leaf: ['#05140a', '#1a4a22', '#2e7836', '#60a856'],
  night: ['#040308', '#13101e', '#231e34', '#3a3456'],
  red: ['#1e0408', '#6e121e', '#ae2432', '#e04e58', '#ffb0b0'],
  rune: ['#04242c', '#1c6c7c', '#3abacc', '#9cf0fa', '#ffffff'],
  arcane: ['#140830', '#502696', '#8256de', '#bea2ff', '#ffffff'],
  fire: ['#320c04', '#a6380c', '#e2781e', '#ffc84e', '#fff4c0'],
  wood: ['#160c05', '#452e18', '#684828', '#8c683e'],
  orchid: ['#2a0a20', '#8a3870', '#c666a6', '#f2a0d2'],
  robe: ['#2c0d04', '#8a4410', '#c67222', '#eea44c'],
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

/** Fixed colours: eyes, mouth, sparkles, glows, the ground shadow. */
export const FIXED_COLOURS: Readonly<Record<string, string>> = {
  eye: '#0e0a12',
  iris: '#3c5a7c',
  mouth: '#7a3a30',
  shadow: '#06050a',
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

/**
 * The hero's look: colour ids (`COMPANION_TINTS`, `COMPANION_HAIRS`, `COMPANION_DYES`), the
 * hair style and the body (PLAN 6.13). The stored shape lives in the domain.
 */
export type CompanionLook = CompanionLookChoice;

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
