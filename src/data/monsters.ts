/**
 * Pixel art of the session monsters (PLAN 7.9, ADR-071): one 16 × 16 grid per kind, original art in
 * the spirit of SNES-era JRPG foes. The idle loop is the grid and the grid one cell lower (a bob),
 * so every grid keeps its last row empty. A foe's state is drawn by swapping colours: a white
 * flash for the hit, greys for a beaten or escaped foe.
 *
 * Roles: `o` outline, `b` body, `s` body shade, `h` highlight, `e` eye, `p` pupil / mouth / socket,
 * `a` accent (horns, weapon, moss, flame), `c` accent shade.
 */
import { Palette } from '@/components/palette';
import type { MonsterKind } from '@/domain/monsters';

export const MONSTER_SIZE = 16;
export const MONSTER_ROLES = 'obshepac';
type Role = 'o' | 'b' | 's' | 'h' | 'e' | 'p' | 'a' | 'c';
export type MonsterColors = Readonly<Record<Role, string>>;

export const MONSTER_ART: Readonly<Record<MonsterKind, readonly string[]>> = {
  imp: [
    '................',
    '...a........a...',
    '...aa......aa...',
    '....aooooooa....',
    '....ohhbbbbo....',
    '....obebbebo....',
    '....obppppbo....',
    '.....obbbbo.....',
    '...oobbbbbboo...',
    '..obbobbbbobbo..',
    '..obsobbbbosbo..',
    '..oo.obssbo.oo..',
    '.....obbbbo..a..',
    '.....ob..bo.aa..',
    '....oo....oo....',
    '................',
  ],
  bat: [
    '................',
    '................',
    '................',
    '.....o....o.....',
    '.....oo..oo.....',
    '....obboobbo....',
    'o...obbbbbbo...o',
    'oo..obebbebo..oo',
    'oho.obbbbbbo.oho',
    'obbbobbppbbobbbo',
    'obsbbobbbbobbsbo',
    'osssbsobbosbssso',
    'o.o.o..oo..o.o.o',
    '................',
    '................',
    '................',
  ],
  skeleton: [
    '................',
    '......oooo......',
    '.....obbbbo.....',
    '....obhbbbbo....',
    '....oppbbppo....',
    '....oepbbpeo....',
    '.....obpbbo.....',
    '.....opbpbo.....',
    '......oooo......',
    '....oobbbboo..a.',
    '...obopbpbobo.a.',
    '...ob.obpbo.boa.',
    '....o.obbbo.oca.',
    '......ob.bo.....',
    '.....oo...oo....',
    '................',
  ],
  golem: [
    '................',
    '................',
    '....oooooooo....',
    '...obhhbbbbbo...',
    '...obeebbeebo...',
    '...obbbbbbbbo...',
    '..oobsppppsboo..',
    '.obbobbbbbbobbo.',
    'obhbobaabbbobhbo',
    'obbbobbbbabobbbo',
    'osbsobbsbbbosbso',
    '.oso.obbbbbo.oso',
    '.....obbsbbo....',
    '.....obb.bbo....',
    '....ooo...ooo...',
    '................',
  ],
  slime: [
    '................',
    '................',
    '................',
    '................',
    '......oooo......',
    '....oohhbboo....',
    '...ohhbbbbbbo...',
    '..ohbbbbbbbbbo..',
    '..obeebbbbeebo..',
    '.obbppbbbbppbbo.',
    '.obbbbbbbbbbbbo.',
    '.osbbbbppbbbbso.',
    '.ossbbbbbbbbsso.',
    '..osssssssssso..',
    '...oooooooooo...',
    '................',
  ],
  goblin: [
    '................',
    '................',
    '......oooo......',
    '.....obhhbo.....',
    'oo..obbbbbbo..oo',
    '..oboebbbbeobo..',
    '...obpbbbbpbo...',
    '....obsppsbo....',
    '.....obbbbo..ca.',
    '...oobbbbbboocaa',
    '..obbobsbobboaa.',
    '..oo.obssbo..o..',
    '.....occcco.....',
    '.....ob..bo.....',
    '....oo....oo....',
    '................',
  ],
  wisp: [
    '................',
    '.......a........',
    '......aa.a......',
    '.....oaaao......',
    '....ohhbbbo.....',
    '...ohbbbbbbo....',
    '...obppbbppbo...',
    '...obppbbppbo...',
    '...obbbbbbbbo...',
    '..obbbbppbbbbo..',
    '..obbbbbbbbbbo..',
    '..osbbbbbbbbso..',
    '..ossbssbssbso..',
    '...o.so.os.o....',
    '................',
    '................',
  ],
};

export const MONSTER_COLORS: Readonly<Record<MonsterKind, MonsterColors>> = {
  imp: {
    o: Palette.ink,
    b: '#C8414B',
    s: Palette.bloodDark,
    h: Palette.blood,
    e: Palette.goldLight,
    p: Palette.ink,
    a: Palette.bone,
    c: Palette.mist,
  },
  bat: {
    o: Palette.ink,
    b: '#6B4FA8',
    s: '#3E2A6E',
    h: Palette.arcane,
    e: Palette.blood,
    p: Palette.bone,
    a: Palette.arcane,
    c: '#3E2A6E',
  },
  skeleton: {
    o: Palette.ink,
    b: Palette.bone,
    s: Palette.mist,
    h: '#FFFFFF',
    e: Palette.blood,
    p: Palette.ink,
    a: Palette.steel,
    c: Palette.bronze,
  },
  golem: {
    o: Palette.ink,
    b: '#7A6E8A',
    s: '#4A4258',
    h: '#A99FB8',
    e: Palette.rune,
    p: Palette.ink,
    a: Palette.verdant,
    c: '#3C8A4A',
  },
  slime: {
    o: Palette.ink,
    b: Palette.sky,
    s: '#2F6FC0',
    h: '#BFE0FF',
    e: Palette.bone,
    p: Palette.ink,
    a: Palette.sky,
    c: '#2F6FC0',
  },
  goblin: {
    o: Palette.ink,
    b: Palette.verdant,
    s: '#3C8A4A',
    h: '#A8EBB0',
    e: Palette.goldLight,
    p: Palette.ink,
    a: Palette.bronze,
    c: '#5A3C18',
  },
  wisp: {
    o: Palette.ink,
    b: Palette.rune,
    s: Palette.runeShade,
    h: '#D8FAFF',
    e: Palette.bone,
    p: Palette.ink,
    a: Palette.orchid,
    c: Palette.ember,
  },
};

/** Every role but the outline in white: the frame of a hit. */
export const HIT_COLORS: MonsterColors = {
  o: Palette.ink,
  b: '#FFFFFF',
  s: Palette.bone,
  h: '#FFFFFF',
  e: '#FFFFFF',
  p: Palette.bone,
  a: '#FFFFFF',
  c: Palette.bone,
};

/** Greys: a beaten foe (and one that escaped). */
export const BEATEN_COLORS: MonsterColors = {
  o: Palette.ink,
  b: Palette.steelDark,
  s: Palette.stoneEdge,
  h: Palette.steel,
  e: Palette.stoneEdge,
  p: Palette.ink,
  a: Palette.steelDark,
  c: Palette.stoneEdge,
};

const EMPTY_ROW = '.'.repeat(MONSTER_SIZE);

/** The idle loop: the grid, then the grid one cell lower. */
export function monsterFrames(kind: MonsterKind): readonly (readonly string[])[] {
  const rows = MONSTER_ART[kind];
  return [rows, [EMPTY_ROW, ...rows.slice(0, -1)]];
}
