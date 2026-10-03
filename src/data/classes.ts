/**
 * The hero classes (PLAN 6.9, ADR-057): one source of truth, as typed data. A class is cosmetic: a
 * title per tier, an emblem and a color. It never changes XP, the generator or the safeguards.
 *
 * Every class except the starting Recruit has three tiers that need more of the same: flat
 * attribute points (one or two attributes), logged sessions or the rank. These values only grow
 * with training, so progressing far in one area never locks a class away, and a reached tier is
 * kept forever anyway (the store keeps the unlocks). The rules are evaluated in
 * `src/domain/classes.ts`.
 *
 * Thresholds (ADR-057): measured against the real attribute scale (a Pull-up test-out gives Pull 9;
 * about a year of three focused sessions a week reaches 250–350 in the main attribute; legs,
 * balance and mobility have fewer and easier nodes, so they top out lower). Tier I comes after a
 * few weeks of focused training, tier II after a few months, tier III is a long-term goal.
 *
 * Ids are snake_case and stable forever (the selection and the unlocks reference them). Emblems
 * are 12 × 12 grids with the icon roles (`#` main, `+` accent, `*` highlight, `o` shade).
 */
import type { PaletteColor } from '@/components/palette';
import type { ClassDefinition, ClassRule } from '@/domain/types';

/** The emblem roles, the same as the pixel icons' (`src/components/ui/icons.ts`). */
export type EmblemRole = '#' | '+' | '*' | 'o';

export interface HeroClass extends ClassDefinition {
  /** One short line of flavour for the class sheet. */
  flavor: string;
  /** The class color (its title and frame), a Palette key. */
  color: PaletteColor;
  /** 12 × 12 pixel grid (`.` empty). */
  emblem: readonly string[];
  /** Palette key per emblem role. */
  emblemColors: Readonly<Partial<Record<EmblemRole, PaletteColor>>>;
}

/** The class every hero starts with (its only rule is `start`). */
export const STARTING_CLASS_ID = 'recruit';

const stats = (points: Extract<ClassRule, { kind: 'stats' }>['points']): ClassRule => ({
  kind: 'stats',
  points,
});

export const HERO_CLASSES: readonly HeroClass[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    flavor: 'Every legend starts with a first rep.',
    color: 'mist',
    tiers: [{ name: 'Recruit', rule: { kind: 'start' } }],
    emblem: [
      '............',
      '....####....',
      '..##++++##..',
      '.#++++++++#.',
      '.#+++**+++#.',
      '#+++****+++#',
      '#+++****+++#',
      '.#+++**+++#.',
      '.#++++++++#.',
      '..##++++##..',
      '....####....',
      '............',
    ],
    emblemColors: { '#': 'mist', '+': 'bronze', '*': 'steel' },
  },
  {
    id: 'warrior',
    name: 'Warrior',
    flavor: 'Push the world away: dips, push-ups, presses.',
    color: 'ember',
    tiers: [
      { name: 'Warrior', rule: stats({ push: 30 }) },
      { name: 'Veteran', rule: stats({ push: 120 }) },
      { name: 'Warlord', rule: stats({ push: 300 }) },
    ],
    emblem: [
      '..##....##..',
      '.###.oo.###.',
      '####.oo.####',
      '#####oo#####',
      '####.oo.####',
      '.###.oo.###.',
      '..##.oo.##..',
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '.....++.....',
    ],
    emblemColors: { '#': 'ember', o: 'bronze', '+': 'gold' },
  },
  {
    id: 'ranger',
    name: 'Ranger',
    flavor: 'A climber of cliffs and trees: pull-ups, rows, levers.',
    color: 'verdant',
    tiers: [
      { name: 'Ranger', rule: stats({ pull: 30 }) },
      { name: 'Pathfinder', rule: stats({ pull: 120 }) },
      { name: 'Warden', rule: stats({ pull: 300 }) },
    ],
    emblem: [
      '..##........',
      '..o.##......',
      '..o...#.....',
      '..o....#....',
      '..o....#..*.',
      '++++++++++**',
      '..o....#..*.',
      '..o....#....',
      '..o...#.....',
      '..o.##......',
      '..##........',
      '............',
    ],
    emblemColors: { '#': 'verdant', o: 'steel', '+': 'bronze', '*': 'steel' },
  },
  {
    id: 'monk',
    name: 'Monk',
    flavor: 'A centre of stone: hollow holds, L-sits, compression.',
    color: 'gold',
    tiers: [
      { name: 'Monk', rule: stats({ core: 25 }) },
      { name: 'Ascetic', rule: stats({ core: 100 }) },
      { name: 'Grandmaster', rule: stats({ core: 250 }) },
    ],
    emblem: [
      '.....##.....',
      '....####....',
      '....####....',
      '.....##.....',
      '...######...',
      '..########..',
      '..#.####.#..',
      '..#.####.#..',
      '..*+####+*..',
      '.##########.',
      '############',
      '............',
    ],
    emblemColors: { '#': 'gold', '*': 'goldLight', '+': 'bronze' },
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    flavor: 'Legs like tree trunks: squats, lunges, jumps.',
    color: 'blood',
    tiers: [
      { name: 'Barbarian', rule: stats({ legs: 25 }) },
      { name: 'Marauder', rule: stats({ legs: 70 }) },
      { name: 'Chieftain', rule: stats({ legs: 120 }) },
    ],
    emblem: [
      '+..........+',
      '+..........+',
      '++........++',
      '.++.####.++.',
      '..########..',
      '.##########.',
      '.##########.',
      '.#oo####oo#.',
      '.##########.',
      '.###.##.###.',
      '.###.##.###.',
      '.##......##.',
    ],
    emblemColors: { '#': 'blood', '+': 'bone', o: 'ink' },
  },
  {
    id: 'rogue',
    name: 'Rogue',
    flavor: 'Light on hands and feet: handstands, balance, tumbling.',
    color: 'amethyst',
    tiers: [
      { name: 'Rogue', rule: stats({ balance: 20 }) },
      { name: 'Shadow', rule: stats({ balance: 60 }) },
      { name: 'Nightblade', rule: stats({ balance: 150 }) },
    ],
    emblem: [
      '#..........#',
      '*#........#*',
      '.*#......#*.',
      '..*#....#*..',
      '...*#..#*...',
      '....*##*....',
      '....+##+....',
      '...+o..o+...',
      '..+o....o+..',
      '.oo......oo.',
      'oo........oo',
      '............',
    ],
    emblemColors: { '#': 'amethyst', '*': 'bone', '+': 'gold', o: 'bronze' },
  },
  {
    id: 'druid',
    name: 'Druid',
    flavor: 'Bends like a willow: mobility drills and deep ranges.',
    color: 'lime',
    tiers: [
      { name: 'Druid', rule: stats({ mobility: 20 }) },
      { name: 'Shaman', rule: stats({ mobility: 60 }) },
      { name: 'Archdruid', rule: stats({ mobility: 150 }) },
    ],
    emblem: [
      '.........##.',
      '.......####.',
      '.....######.',
      '....###*###.',
      '...###*####.',
      '..###*####..',
      '..##*####...',
      '..#*####....',
      '..*####.....',
      '.*.###......',
      '*...........',
      '............',
    ],
    emblemColors: { '#': 'lime', '*': 'verdant' },
  },
  {
    id: 'paladin',
    name: 'Paladin',
    flavor: 'Push and pull in balance, shoulders built to last.',
    color: 'goldLight',
    tiers: [
      { name: 'Paladin', rule: stats({ push: 25, pull: 25 }) },
      { name: 'Crusader', rule: stats({ push: 100, pull: 100 }) },
      { name: 'Lightbringer', rule: stats({ push: 250, pull: 250 }) },
    ],
    emblem: [
      '..########..',
      '..#*######..',
      '..########..',
      '..########..',
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '....++++....',
      '.....++.....',
    ],
    emblemColors: { '#': 'goldLight', '*': 'bone', o: 'bronze', '+': 'gold' },
  },
  {
    id: 'samurai',
    name: 'Samurai',
    flavor: 'Straight arms and a steel core: the lever path.',
    color: 'rune',
    tiers: [
      { name: 'Samurai', rule: stats({ pull: 25, core: 20 }) },
      { name: 'Kensei', rule: stats({ pull: 100, core: 80 }) },
      { name: 'Shogun', rule: stats({ pull: 250, core: 200 }) },
    ],
    emblem: [
      '...........#',
      '..........#*',
      '.........#*.',
      '........#*..',
      '.......#*...',
      '......#*....',
      '.....#*.....',
      '....+++.....',
      '...o+.......',
      '..oo........',
      '.oo.........',
      'o...........',
    ],
    emblemColors: { '#': 'rune', '*': 'bone', '+': 'gold', o: 'steelDark' },
  },
  {
    id: 'templar',
    name: 'Templar',
    flavor: 'Locked arms that hold the body level: the planche path.',
    color: 'bone',
    tiers: [
      { name: 'Templar', rule: stats({ push: 25, core: 20 }) },
      { name: 'Inquisitor', rule: stats({ push: 100, core: 80 }) },
      { name: 'Grand Templar', rule: stats({ push: 250, core: 200 }) },
    ],
    emblem: [
      '############',
      '#++++##++++#',
      '#++++##++++#',
      '#++++##++++#',
      '############',
      '#++++##++++#',
      '.#+++##+++#.',
      '.#+++##+++#.',
      '..#++##++#..',
      '...#+##+#...',
      '....####....',
      '.....##.....',
    ],
    emblemColors: { '#': 'bone', '+': 'blood' },
  },
  {
    id: 'bard',
    name: 'Bard',
    flavor: 'Flow and grace: cartwheels, rolls and poised holds.',
    color: 'orchid',
    tiers: [
      { name: 'Bard', rule: stats({ balance: 15, mobility: 15 }) },
      { name: 'Skald', rule: stats({ balance: 50, mobility: 50 }) },
      { name: 'Virtuoso', rule: stats({ balance: 120, mobility: 120 }) },
    ],
    emblem: [
      '..........oo',
      '.........oo.',
      '........o...',
      '.......o....',
      '...####.....',
      '..######....',
      '.###++###...',
      '.##+**+##...',
      '.###++###...',
      '.########...',
      '..######....',
      '...####.....',
    ],
    emblemColors: { '#': 'orchid', '+': 'gold', '*': 'ink', o: 'bronze' },
  },
  {
    id: 'cleric',
    name: 'Cleric',
    flavor: 'Calm breath, a strong centre and a supple body.',
    color: 'sky',
    tiers: [
      { name: 'Cleric', rule: stats({ core: 20, mobility: 15 }) },
      { name: 'Priest', rule: stats({ core: 80, mobility: 50 }) },
      { name: 'High Priest', rule: stats({ core: 200, mobility: 120 }) },
    ],
    emblem: [
      '.....##.....',
      '.#...##...#.',
      '..#......#..',
      '....####....',
      '...######...',
      '##.##**##.##',
      '##.##**##.##',
      '...######...',
      '....####....',
      '..#......#..',
      '.#...##...#.',
      '.....##.....',
    ],
    emblemColors: { '#': 'sky', '*': 'bone' },
  },
  {
    id: 'knight',
    name: 'Knight',
    flavor: 'Trained in every art: all six attributes.',
    color: 'steel',
    tiers: [
      {
        name: 'Knight',
        rule: stats({ push: 15, pull: 15, core: 15, legs: 15, balance: 15, mobility: 15 }),
      },
      {
        name: 'Knight Commander',
        rule: stats({ push: 50, pull: 50, core: 50, legs: 50, balance: 50, mobility: 50 }),
      },
      {
        name: 'High Lord',
        rule: stats({ push: 120, pull: 120, core: 120, legs: 120, balance: 120, mobility: 120 }),
      },
    ],
    emblem: [
      '.....#.#....',
      '....######..',
      '...########.',
      '..##*######.',
      '.##########.',
      '.####..####.',
      '..##...####.',
      '......####..',
      '.....####...',
      '....######..',
      '...########.',
      '..##########',
    ],
    emblemColors: { '#': 'steel', '*': 'ink' },
  },
  {
    id: 'berserker',
    name: 'Berserker',
    flavor: 'Shows up, again and again: sessions logged.',
    color: 'sunfire',
    tiers: [
      { name: 'Berserker', rule: { kind: 'sessions', count: 20 } },
      { name: 'Bloodrager', rule: { kind: 'sessions', count: 100 } },
      { name: 'Warchief', rule: { kind: 'sessions', count: 250 } },
    ],
    emblem: [
      '............',
      '...#...#...#',
      '..##..##..##',
      '..##..##..##',
      '.##..##..##.',
      '.##..##..##.',
      '.##..##..##.',
      '##..##..##..',
      '##..##..##..',
      '##..##..##..',
      '#...#...#...',
      '............',
    ],
    emblemColors: { '#': 'sunfire' },
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    flavor: 'Mastery across the tree, measured by your rank.',
    color: 'arcane',
    tiers: [
      { name: 'Sorcerer', rule: { kind: 'rank', rank: 'Adept' } },
      { name: 'Archmage', rule: { kind: 'rank', rank: 'Master' } },
      { name: 'Ascendant', rule: { kind: 'rank', rank: 'Legend' } },
    ],
    emblem: [
      '.......##...',
      '......###...',
      '.....####...',
      '.....#*##...',
      '....######..',
      '....###*##..',
      '...########.',
      '...##*#####.',
      '..#########.',
      '++++++++++++',
      '.++++++++++.',
      '............',
    ],
    emblemColors: { '#': 'arcane', '*': 'goldLight', '+': 'amethyst' },
  },
];

/** Classes by id. */
export const HERO_CLASS_BY_ID: ReadonlyMap<string, HeroClass> = new Map(
  HERO_CLASSES.map((heroClass) => [heroClass.id, heroClass]),
);
