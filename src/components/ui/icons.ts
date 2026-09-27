/**
 * The pixel icon set (PLAN 4.0, ADR-030). Every icon is a 12×12 character grid drawn in code, so the
 * app needs no image assets. Roles: `#` main color, `+` accent, `*` highlight, `o` shade; `.` is
 * empty. Each icon maps its roles to theme colors; `PixelIcon` can recolor everything to one tint
 * (tab bar, disabled states). Add an icon by adding a grid here: icons.test.ts checks its shape.
 */
import { parsePixelGrid, type PixelGrid } from '@/lib/pixelGrid';

import { Colors } from '../theme';

/** The role characters an icon may use. */
export const ICON_ROLES = '#+*o';
export type IconRole = '#' | '+' | '*' | 'o';
export const ICON_SIZE_CELLS = 12;

export interface IconDef {
  rows: readonly string[];
  colors: Readonly<Partial<Record<IconRole, string>>>;
}

export const ICONS = {
  sword: {
    rows: [
      '.....##.....',
      '.....##.....',
      '.....#*.....',
      '.....#*.....',
      '.....#*.....',
      '.....#*.....',
      '.....##.....',
      '..++++++++..',
      '..++++++++..',
      '.....oo.....',
      '.....oo.....',
      '....++++....',
    ],
    colors: { '#': Colors.steel, '*': Colors.text, '+': Colors.gold, o: Colors.bronze },
  },
  shield: {
    rows: [
      '.##########.',
      '.#++++++++#.',
      '.#++++++++#.',
      '.#+++**+++#.',
      '.#++****++#.',
      '.#+++**+++#.',
      '.#++++++++#.',
      '..#++++++#..',
      '..#++++++#..',
      '...#++++#...',
      '....#++#....',
      '.....##.....',
    ],
    colors: { '#': Colors.gold, '+': Colors.dangerDark, '*': Colors.goldLight },
  },
  flame: {
    rows: [
      '......#.....',
      '.....##.....',
      '.....###....',
      '....####....',
      '...#####.#..',
      '..####+####.',
      '..###++####.',
      '.###+++####.',
      '.##++++++##.',
      '.##++**++##.',
      '..##+**+##..',
      '...######...',
    ],
    colors: { '#': Colors.ember, '+': Colors.gold, '*': Colors.goldLight },
  },
  star: {
    rows: [
      '.....##.....',
      '.....##.....',
      '....#**#....',
      '############',
      '.####**####.',
      '..########..',
      '...######...',
      '...######...',
      '..###..###..',
      '..##....##..',
      '.##......##.',
      '............',
    ],
    colors: { '#': Colors.gold, '*': Colors.goldLight },
  },
  lock: {
    rows: [
      '............',
      '....++++....',
      '...+....+...',
      '...+....+...',
      '...+....+...',
      '.##########.',
      '.#********#.',
      '.####oo####.',
      '.####oo####.',
      '.#####o####.',
      '.##########.',
      '.##########.',
    ],
    colors: { '#': Colors.gold, '*': Colors.goldLight, '+': Colors.steel, o: Colors.ink },
  },
  chain: {
    rows: [
      '............',
      '............',
      '............',
      '#####..#####',
      '#...#..#...#',
      '#...#++#...#',
      '#...#++#...#',
      '#...#..#...#',
      '#####..#####',
      '............',
      '............',
      '............',
    ],
    colors: { '#': Colors.steel, '+': Colors.steelDark },
  },
  scroll: {
    rows: [
      '############',
      '#++++++++++#',
      '.#+oooooo+#.',
      '.#++++++++#.',
      '.#+oooooo+#.',
      '.#++++++++#.',
      '.#+oooo+++#.',
      '.#++++++++#.',
      '.#++++++++#.',
      '############',
      '#++++++++++#',
      '############',
    ],
    colors: { '#': Colors.bronze, '+': Colors.parchment, o: Colors.textOnParchment },
  },
  potion: {
    rows: [
      '....++++....',
      '.....**.....',
      '.....**.....',
      '....*..*....',
      '...*....*...',
      '..*######*..',
      '.*########*.',
      '.*##*#####*.',
      '.*########*.',
      '.*########*.',
      '..*######*..',
      '...******...',
    ],
    colors: { '#': Colors.danger, '*': Colors.parchment, '+': Colors.bronze },
  },
  bar: {
    rows: [
      '............',
      '............',
      '............',
      '.##......##.',
      '###......###',
      '###++++++###',
      '###++++++###',
      '###......###',
      '.##......##.',
      '............',
      '............',
      '............',
    ],
    colors: { '#': Colors.steel, '+': Colors.steelDark },
  },
  heart: {
    rows: [
      '............',
      '.###....###.',
      '#####..#####',
      '##*#########',
      '#*##########',
      '############',
      '.##########.',
      '..########..',
      '...######...',
      '....####....',
      '.....##.....',
      '............',
    ],
    colors: { '#': Colors.danger, '*': Colors.text },
  },
  rune: {
    rows: [
      '..########..',
      '.##########.',
      '.###+######.',
      '.###+##+###.',
      '.###+#+####.',
      '.###++#####.',
      '.###+#+####.',
      '.###+##+###.',
      '.###+######.',
      '.##########.',
      '..########..',
      '............',
    ],
    colors: { '#': Colors.border, '+': Colors.rune },
  },
  alert: {
    rows: [
      '.....##.....',
      '.....##.....',
      '....####....',
      '....#oo#....',
      '...##oo##...',
      '...##oo##...',
      '..###oo###..',
      '..###oo###..',
      '.##########.',
      '.####oo####.',
      '############',
      '############',
    ],
    colors: { '#': Colors.ember, o: Colors.ink },
  },
  check: {
    rows: [
      '............',
      '............',
      '..........##',
      '.........###',
      '........###.',
      '##.....###..',
      '###...###...',
      '.###.###....',
      '..#####.....',
      '...###......',
      '....#.......',
      '............',
    ],
    colors: { '#': Colors.success },
  },
  // Tab bar icons: one role each, so a tint recolors them cleanly.
  tree: {
    rows: [
      '............',
      '....####....',
      '....####....',
      '....####....',
      '.....##.....',
      '..########..',
      '..##....##..',
      '.####..####.',
      '.####..####.',
      '.####..####.',
      '............',
      '............',
    ],
    colors: { '#': Colors.rune },
  },
  helmet: {
    rows: [
      '.....##.....',
      '...######...',
      '..########..',
      '.##########.',
      '.##########.',
      '.#........#.',
      '.####..####.',
      '.##########.',
      '.####..####.',
      '.##########.',
      '..########..',
      '............',
    ],
    colors: { '#': Colors.steel },
  },
  gear: {
    rows: [
      '.....##.....',
      '.##.####.##.',
      '.##########.',
      '..###..###..',
      '.###....###.',
      '####....####',
      '####....####',
      '.###....###.',
      '..###..###..',
      '.##########.',
      '.##.####.##.',
      '.....##.....',
    ],
    colors: { '#': Colors.steel },
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

const parsed = new Map<IconName, PixelGrid>();

/** The parsed grid of an icon (parsed once, then cached). */
export function iconGrid(name: IconName): PixelGrid {
  let grid = parsed.get(name);
  if (!grid) {
    grid = parsePixelGrid(ICONS[name].rows, ICON_ROLES);
    parsed.set(name, grid);
  }
  return grid;
}
