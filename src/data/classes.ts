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
import { k } from '@/i18n';
import type {
  Attribute,
  ClassChallengeDefinition,
  ClassDefinition,
  ClassRule,
} from '@/domain/types';

/** The emblem roles, the same as the pixel icons' (`src/components/ui/icons.ts`). */
export type EmblemRole = '#' | '+' | '*' | 'o';

export interface HeroClass extends ClassDefinition {
  /** One short line of flavour for the class sheet. */
  flavor: string;
  /** The class color (its title and frame), a Palette key. */
  color: PaletteColor;
  /** The weekly challenge the class offers while worn (PLAN 6.9b, ADR-058). */
  challenge: ClassChallengeDefinition;
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

/**
 * A weekly challenge of sessions that train every listed attribute, with one target per tier
 * (ADR-058: a little more at tier II / III, never more than three or four sessions a week).
 */
const trainIn = (
  attributes: readonly Attribute[],
  targets: readonly number[],
): ClassChallengeDefinition => ({ goal: { kind: 'sessions_training', attributes }, targets });

export const HERO_CLASSES: readonly HeroClass[] = [
  {
    id: 'recruit',
    name: k('Recruit'),
    flavor: k('Every legend starts with a first rep.'),
    color: 'mist',
    challenge: { goal: { kind: 'sessions' }, targets: [2] },
    tiers: [{ name: k('Recruit'), rule: { kind: 'start' } }],
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
    name: k('Warrior'),
    flavor: k('Push the world away: dips, push-ups, presses.'),
    color: 'ember',
    challenge: trainIn(['push'], [2, 3, 3]),
    tiers: [
      { name: k('Warrior'), rule: stats({ push: 30 }) },
      { name: k('Veteran'), rule: stats({ push: 120 }) },
      { name: k('Warlord'), rule: stats({ push: 300 }) },
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
    name: k('Ranger'),
    flavor: k('A climber of cliffs and trees: pull-ups, rows, levers.'),
    color: 'verdant',
    challenge: trainIn(['pull'], [2, 3, 3]),
    tiers: [
      { name: k('Ranger'), rule: stats({ pull: 30 }) },
      { name: k('Pathfinder'), rule: stats({ pull: 120 }) },
      { name: k('Warden'), rule: stats({ pull: 300 }) },
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
    name: k('Monk'),
    flavor: k('A centre of stone: hollow holds, L-sits, compression.'),
    color: 'gold',
    challenge: trainIn(['core'], [2, 3, 3]),
    tiers: [
      { name: k('Monk'), rule: stats({ core: 25 }) },
      { name: k('Ascetic'), rule: stats({ core: 100 }) },
      { name: k('Grandmaster'), rule: stats({ core: 250 }) },
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
    name: k('Barbarian'),
    flavor: k('Legs like tree trunks: squats, lunges, jumps.'),
    color: 'blood',
    challenge: trainIn(['legs'], [2, 2, 3]),
    tiers: [
      { name: k('Barbarian'), rule: stats({ legs: 25 }) },
      { name: k('Marauder'), rule: stats({ legs: 70 }) },
      { name: k('Chieftain'), rule: stats({ legs: 120 }) },
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
    name: k('Rogue'),
    flavor: k('Light on hands and feet: handstands, balance, tumbling.'),
    color: 'amethyst',
    challenge: trainIn(['balance'], [2, 3, 3]),
    tiers: [
      { name: k('Rogue'), rule: stats({ balance: 20 }) },
      { name: k('Shadow'), rule: stats({ balance: 60 }) },
      { name: k('Nightblade'), rule: stats({ balance: 150 }) },
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
    name: k('Druid'),
    flavor: k('Bends like a willow: mobility drills and deep ranges.'),
    color: 'lime',
    challenge: { goal: { kind: 'exercises_training', attribute: 'mobility' }, targets: [3, 4, 5] },
    tiers: [
      { name: k('Druid'), rule: stats({ mobility: 20 }) },
      { name: k('Shaman'), rule: stats({ mobility: 60 }) },
      { name: k('Archdruid'), rule: stats({ mobility: 150 }) },
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
    name: k('Paladin'),
    flavor: k('Push and pull in balance, shoulders built to last.'),
    color: 'goldLight',
    challenge: trainIn(['push', 'pull'], [2, 2, 3]),
    tiers: [
      { name: k('Paladin'), rule: stats({ push: 25, pull: 25 }) },
      { name: k('Crusader'), rule: stats({ push: 100, pull: 100 }) },
      { name: k('Lightbringer'), rule: stats({ push: 250, pull: 250 }) },
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
    name: k('Samurai'),
    flavor: k('Straight arms and a steel core: the lever path.'),
    color: 'rune',
    challenge: trainIn(['pull', 'core'], [2, 2, 3]),
    tiers: [
      { name: k('Samurai'), rule: stats({ pull: 25, core: 20 }) },
      { name: k('Kensei'), rule: stats({ pull: 100, core: 80 }) },
      { name: k('Shogun'), rule: stats({ pull: 250, core: 200 }) },
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
    name: k('Templar'),
    flavor: k('Locked arms that hold the body level: the planche path.'),
    color: 'bone',
    challenge: trainIn(['push', 'core'], [2, 2, 3]),
    tiers: [
      { name: k('Templar'), rule: stats({ push: 25, core: 20 }) },
      { name: k('Inquisitor'), rule: stats({ push: 100, core: 80 }) },
      { name: k('Grand Templar'), rule: stats({ push: 250, core: 200 }) },
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
    name: k('Bard'),
    flavor: k('Flow and grace: cartwheels, rolls and poised holds.'),
    color: 'orchid',
    challenge: trainIn(['balance', 'mobility'], [1, 2, 2]),
    tiers: [
      { name: k('Bard'), rule: stats({ balance: 15, mobility: 15 }) },
      { name: k('Skald'), rule: stats({ balance: 50, mobility: 50 }) },
      { name: k('Virtuoso'), rule: stats({ balance: 120, mobility: 120 }) },
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
    name: k('Cleric'),
    flavor: k('Calm breath, a strong centre and a supple body.'),
    color: 'sky',
    challenge: trainIn(['core', 'mobility'], [2, 2, 3]),
    tiers: [
      { name: k('Cleric'), rule: stats({ core: 20, mobility: 15 }) },
      { name: k('Priest'), rule: stats({ core: 80, mobility: 50 }) },
      { name: k('High Priest'), rule: stats({ core: 200, mobility: 120 }) },
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
    name: k('Knight'),
    flavor: k('Trained in every art: all six attributes.'),
    color: 'steel',
    challenge: { goal: { kind: 'complete_sessions' }, targets: [2, 3, 3] },
    tiers: [
      {
        name: k('Knight'),
        rule: stats({ push: 15, pull: 15, core: 15, legs: 15, balance: 15, mobility: 15 }),
      },
      {
        name: k('Knight Commander'),
        rule: stats({ push: 50, pull: 50, core: 50, legs: 50, balance: 50, mobility: 50 }),
      },
      {
        name: k('High Lord'),
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
    name: k('Berserker'),
    flavor: k('Shows up, again and again: sessions logged.'),
    color: 'sunfire',
    challenge: { goal: { kind: 'sessions' }, targets: [3, 3, 4] },
    tiers: [
      { name: k('Berserker'), rule: { kind: 'sessions', count: 20 } },
      { name: k('Bloodrager'), rule: { kind: 'sessions', count: 100 } },
      { name: k('Warchief'), rule: { kind: 'sessions', count: 250 } },
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
    name: k('Sorcerer'),
    flavor: k('Mastery across the tree, measured by your rank.'),
    color: 'arcane',
    challenge: { goal: { kind: 'trial_attempts' }, targets: [1, 1, 2] },
    tiers: [
      { name: k('Sorcerer'), rule: { kind: 'rank', rank: 'Adept' } },
      { name: k('Archmage'), rule: { kind: 'rank', rank: 'Master' } },
      { name: k('Ascendant'), rule: { kind: 'rank', rank: 'Legend' } },
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
