/**
 * The companion's accessories and class weapons as layered pixel parts (PLAN 6.10 / 6.13,
 * ADR-059 / ADR-061). Original art in the spirit of SNES-era JRPG and Octopath-style field
 * sprites, fitted to the taller hero (both bodies share the anchors). Each accessory is one or
 * more of:
 * - `head`: a part placed relative to the head box (12 × 10; it may reach above or beside it),
 *   `hidesHair` for helmets, hoods and hats that cover the hair's volume,
 * - `back`: a part behind the body, relative to the torso box (12 × 13): cloaks, banners, a lute
 *   (its lower half sways with the idle loop),
 * - `behindHead`: a part behind the head (a lowered hood),
 * - `front`: a part over the body, relative to the torso box: collars, pendants, beads,
 * - `recolor`: regions repainted in another material (a chainmail torso, leather forearms),
 *   with an optional pattern of forced shadow cells (rings, scales),
 * - `leftHand` / `shoulders`: parts at the screen-left hand (a shield) or both shoulders,
 * - an aura: a glow around the whole sprite and sparkles (relative to the head box).
 *
 * Part cells use `GEAR_LEGEND`: an uppercase letter is a material (shaded automatically), the
 * same letter in lowercase forces that material's shadow tone; `X`/`x` is the hero's outfit dye.
 */
import type { Legend, SpriteCell, SpritePart } from '@/lib/sprite';

import { REGIONS } from './body';

const gear = (material: string, shadow = false): SpriteCell =>
  shadow ? { material, region: REGIONS.gear, tone: 'shadow' } : { material, region: REGIONS.gear };

const MATERIAL_LETTERS: Readonly<Record<string, string>> = {
  L: 'leather',
  I: 'iron',
  J: 'darkIron',
  G: 'gold',
  W: 'bone',
  M: 'fur',
  V: 'leaf',
  N: 'night',
  R: 'red',
  E: 'rune',
  A: 'arcane',
  F: 'fire',
  D: 'wood',
  O: 'orchid',
  X: 'outfit',
  K: 'robe',
  S: 'skin',
};

export const GEAR_LEGEND: Legend = {
  ...Object.fromEntries(
    Object.entries(MATERIAL_LETTERS).flatMap(([letter, material]) => [
      [letter, gear(material)],
      [letter.toLowerCase(), gear(material, true)],
    ]),
  ),
  '+': { fixed: 'sparkWhite' },
  '*': { fixed: 'eye' },
  '!': { fixed: 'sparkGold' },
};

/** A part placed at an offset from its anchor box. */
export interface PlacedPart extends SpritePart {
  dx: number;
  dy: number;
}

export interface Recolor {
  /** Region → material. */
  regions: Readonly<Partial<Record<string, string>>>;
  /** Cells (canvas coordinates relative to the torso box) that take the shadow tone. */
  pattern?: (x: number, y: number) => boolean;
}

export interface AccessoryArt {
  head?: PlacedPart;
  /** The head part covers the hair's volume (helmets, hoods, hats); fringe and long hair stay. */
  hidesHair?: boolean;
  back?: PlacedPart;
  behindHead?: PlacedPart;
  front?: PlacedPart;
  recolor?: Recolor;
  leftHand?: PlacedPart;
  /** Drawn at the left shoulder and mirrored at the right one. */
  shoulders?: PlacedPart;
  glow?: string;
  sparkles?: readonly { x: number; y: number; fixed: string }[];
}

const part = (dx: number, dy: number, rows: readonly string[]): PlacedPart => ({ dx, dy, rows });

/** Cloak width at the hem and how far it reaches left of the torso box. */
const CLOAK_WIDTH = 24;
const CLOAK_DX = -6;

/**
 * A cloak behind the body: `length` rows from the shoulders, flaring from the shoulders to the
 * hem, a darker edge, an optional hem pattern on its last two rows.
 */
function cloakRows(
  fill: string,
  edge: string,
  length: number,
  hem?: (x: number) => string,
): string[] {
  const rows: string[] = [];
  const centre = (CLOAK_WIDTH - 1) / 2;
  for (let y = 0; y < length; y += 1) {
    const half = Math.min(centre, 8 + Math.floor(y / 5));
    let row = '';
    for (let x = 0; x < CLOAK_WIDTH; x += 1) {
      const d = Math.abs(x - centre);
      if (d > half) row += '.';
      else if (y >= length - 2 && hem) row += hem(x);
      else if (d > half - 1) row += edge;
      else row += y > 4 && Math.abs(Math.round(d)) % 5 === 3 ? edge : fill;
    }
    rows.push(row);
  }
  return rows;
}

const cloak = (fill: string, edge: string, length: number, hem?: (x: number) => string) =>
  part(CLOAK_DX, 1, cloakRows(fill, edge, length, hem));

/** A collar over both shoulders, in front of the body (16 wide, from the arms' outer edge). */
const collar = (rows: readonly string[]): PlacedPart => part(-2, 1, rows);

const sparkle = (points: readonly [number, number][], fixed: string) =>
  points.map(([x, y]) => ({ x, y, fixed }));

/** A + shaped star of `fixed` around each point (head-box coordinates). */
const stars = (points: readonly [number, number][], fixed: string, core: string) =>
  points.flatMap(([x, y]) => [
    { x, y, fixed: core },
    { x: x - 1, y, fixed },
    { x: x + 1, y, fixed },
    { x, y: y - 1, fixed },
    { x, y: y + 1, fixed },
  ]);

const rings = (x: number, y: number) => (x + y) % 2 === 0;
const scales = (x: number, y: number) => y % 2 === 1 && (x + Math.floor(y / 2)) % 2 === 0;

/** A hood framing the face (`F` fill, `f` brim shadow), the face open from row 4. */
const hoodRows = (fill: string, mask?: string): string[] => {
  const f = fill;
  const s = fill.toLowerCase();
  const m = mask ?? '.';
  return [
    `.....${f.repeat(6)}.....`,
    `...${f.repeat(10)}...`,
    `..${f.repeat(12)}..`,
    `.${f.repeat(14)}.`,
    `.${f.repeat(14)}.`,
    `${f.repeat(5)}${s.repeat(6)}${f.repeat(5)}`,
    `${f.repeat(3)}${s}........${s}${f.repeat(3)}`,
    `${f.repeat(3)}..........${f.repeat(3)}`,
    `${f.repeat(3)}..........${f.repeat(3)}`,
    `${f.repeat(3)}${m.repeat(10)}${f.repeat(3)}`,
    `${f.repeat(4)}${m.repeat(8)}${f.repeat(4)}`,
    `.${f.repeat(4)}${m.repeat(6)}${f.repeat(4)}.`,
    `..${f.repeat(12)}..`,
    `..${f.repeat(12)}..`,
  ];
};

export const ACCESSORY_ART: Readonly<Record<string, AccessoryArt>> = {
  // --- Head ------------------------------------------------------------------------------------
  rope_headband: {
    head: part(0, 3, ['WwWwWwWwWwWw..', '..........wWW.', '............wW']),
  },
  iron_circlet: {
    head: part(0, 2, ['.....EE.....', 'IIIIIEEIIIII']),
  },
  golden_crown: {
    head: part(2, -4, ['G..GG..G', 'GG.GG.GG', 'GGGRRGGG', 'GEGRRGEG', 'gggggggg']),
  },
  iron_helm: {
    hidesHair: true,
    head: part(-1, -1, [
      '....IIIIII....',
      '..IIIIIIIIII..',
      '.IIIIIIIIIIII.',
      '.IIIIIIIIIIII.',
      'IIIIIIIIIIIIII',
      'iiiiiiiiiiiiii',
      'II....ii....II',
      'II....ii....II',
      '.I....ii....I.',
    ]),
  },
  warlord_helm: {
    hidesHair: true,
    head: part(-3, -4, [
      'W................W',
      'WW..............WW',
      '.WW....JJJJ....WW.',
      '..WWJJJJJJJJJJWW..',
      '....JJJJJJJJJJ....',
      '...JJJJJJRRJJJJJ..',
      '...JJJJJJJJJJJJJ..',
      '..GGGGGGGGGGGGGGG.',
      '..JJ....jj....JJ..',
      '..JJ....jj....JJ..',
      '...J....jj....J...',
    ]),
  },
  green_hood: {
    hidesHair: true,
    head: part(-2, -2, hoodRows('V')),
  },
  bone_crown: {
    hidesHair: false,
    head: part(1, -4, [
      'W...WW...W',
      'W..WWWW..W',
      'WW.WWWW.WW',
      'WWWW**WWWW',
      'WWWWWWWWWW',
      'WMWMWMWMWM',
    ]),
  },
  shadow_mask: {
    head: part(1, 3, [
      'NNNNNNNNNNNNN',
      '...........NN',
      '............N',
      '.............',
      '.NNNNNNNNNN..',
      '.NNNNNNNNNN..',
      '..NNNNNNNN...',
    ]),
  },
  nightblade_cowl: {
    hidesHair: true,
    head: part(-2, -2, hoodRows('N', 'N')),
  },
  antler_wreath: {
    head: part(-3, -4, [
      'W..W..........W..W',
      '.W.W..........W.W.',
      '..WW.W......W.WW..',
      '...WW........WW...',
      '....W........W....',
      '....VvVvVvVvVvVv..',
    ]),
  },
  leaf_crown: {
    head: part(0, -3, ['..V..OV..V..', '.VV.VVVV.VV.', 'VVvVVvVVvVVv', '.OVvVVVVvVO.']),
  },
  hachimaki: {
    head: part(-4, 3, ['....WWWWWRRWWWWW', '.Ww.............', 'Ww..............']),
  },
  kabuto: {
    hidesHair: true,
    head: part(-3, -4, [
      '..G............G..',
      '...GG........GG...',
      '.....GGGGGGGG.....',
      '....RRRRRRRRRR....',
      '...RRRRRRRRRRRR...',
      '..RRRRRRRRRRRRRR..',
      '..RRRRRRRRRRRRRR..',
      '..GGGGGGGGGGGGGG..',
      '.RRRR........RRRR.',
      'RRRR..........RRRR',
      'RRR............RRR',
    ]),
  },
  feathered_cap: {
    hidesHair: true,
    head: part(-1, -3, [
      '.............G.',
      '....XXXXXX..GW.',
      '..XXXXXXXXXXGW.',
      '.XXXXXXXXXXXW..',
      'XXXXXXXXXXXXXX.',
      'XXXXXXXXXXXXXXX',
      '.xxxxxxxxxxxxx.',
    ]),
  },
  mitre: {
    hidesHair: true,
    head: part(2, -4, [
      '.WW..WW.',
      '.WWGGWW.',
      'WWWGGWWW',
      'WGGGGGGW',
      'WWWGGWWW',
      'WWWGGWWW',
      'WWWGGWWW',
      'GGGGGGGG',
    ]),
  },
  crested_helm: {
    hidesHair: true,
    head: part(0, -4, [
      '....XXXX....',
      '...XXXXXX...',
      '....XxxX....',
      '...IIIIII...',
      '.IIIIIIIIII.',
      'IIIIIIIIIIII',
      'IIIIIIIIIIII',
      'IIIIIIIIIIII',
      'IIIIIIIIIIII',
      'IIIIIIIIIIII',
      'I**********I',
      'IIIII**IIIII',
      'IIIII**IIIII',
      '.IIIIIIIIII.',
      '..iiiiiiii..',
    ]),
  },
  pointed_hat: {
    hidesHair: true,
    head: part(-3, -4, [
      '..........AAA.....',
      '.........AAA......',
      '........AA!A......',
      '.......AAAAAA.....',
      '......AAAAAAAA....',
      '.....GGGGGGGGGG...',
      '....AAAAAAAAAAAA..',
      'AAAAAAAAAAAAAAAAAA',
      '.aaaaaaaaaaaaaaaa.',
    ]),
  },

  // --- Cloak and back ----------------------------------------------------------------------------
  hooded_cloak: {
    back: cloak('X', 'x', 24),
    behindHead: part(-2, 8, [
      '..xxxxxxxxxxxx..',
      '.xxxxxxxxxxxxxx.',
      'xxxxxxxxxxxxxxxx',
      'xxxxxxxxxxxxxxxx',
    ]),
    front: collar(['XXX..........XXX', 'XXXX...GG...XXXX']),
  },
  fur_pelt: {
    back: part(
      CLOAK_DX,
      1,
      cloakRows('M', 'm', 9, (x) => (x % 2 === 0 ? 'm' : '.')),
    ),
    front: collar(['MMMMMM....MMMMMM', 'MmMmMmM..MmMmMmM', '.m.m.m....m.m.m.']),
  },
  veterans_scarf: {
    back: part(-8, 0, ['xX........', 'XXx.......', '.XXx......', '..xXX.....', '....xX....']),
    front: part(1, 0, [
      'XXXXXXXXXX',
      '.xxxxxxxx.',
      '......XX..',
      '......Xx..',
      '......xX..',
      '......X...',
    ]),
  },
  knights_mantle: {
    back: cloak('X', 'x', 25, () => 'G'),
    front: collar(['GGG..........GGG', 'GXGG...GG...GGXG', '.GG..........GG.']),
  },
  warden_cloak: {
    back: cloak('V', 'v', 25, (x) => (x % 2 === 0 ? 'V' : 'v')),
    front: collar(['VvV..........VvV', 'vVvV...OO...VvVv']),
  },
  templar_cape: {
    back: cloak('W', 'w', 26, () => 'R'),
    front: collar(['RRR..........RRR', 'RWRR...RR...RRWR']),
  },
  high_lord_cape: {
    back: cloak('X', 'x', 27, (x) => (x % 3 === 0 ? '*' : 'W')),
    front: collar(['WWWW........WWWW', 'W*WWW..GG..WW*WW', '.WW*W......W*WW.']),
  },
  phoenix_cloak: {
    back: cloak('R', 'r', 26, (x) => (x % 2 === 0 ? 'F' : 'f')),
    front: collar(['FFF..........FFF', 'FRFF...FF...FFRF']),
  },

  // --- Body ------------------------------------------------------------------------------------
  travelers_tunic: {
    recolor: { regions: { torso: 'leather' } },
    front: part(3, 0, [
      '.SSSS.',
      '.XSSX.',
      '..XX..',
      '......',
      '......',
      '......',
      '......',
      '......',
      '......',
      '..GG..',
    ]),
  },
  prayer_beads: {
    front: part(0, 1, [
      '.W........W.',
      '..D......D..',
      '...W....W...',
      '....D..D....',
      '.....WW.....',
      '.....RR.....',
      '.....rr.....',
    ]),
  },
  holy_symbol: {
    front: part(2, 1, ['G......G', '.G....G.', '..G..G..', '..GGGG..', '..G!!G..', '...GG...']),
  },
  templar_tabard: {
    recolor: { regions: { torso: 'bone' } },
    front: part(2, 1, [
      '...RR...',
      '...RR...',
      '.RRRRRR.',
      '...RR...',
      '...RR...',
      '...RR...',
      '........',
      '........',
      '........',
      'WWWWWWWW',
      'WWWRRWWW',
      'WWWRRWWW',
      'wWWRRWWw',
      '.WWWWWW.',
    ]),
  },
  chainmail_vest: {
    recolor: { regions: { torso: 'iron', belt: 'leather' }, pattern: rings },
  },
  grandmaster_robe: {
    recolor: { regions: { torso: 'robe', sleeve: 'robe', belt: 'leather', legs: 'robe' } },
    front: part(1, 1, [
      'L.........',
      '.L........',
      '..L.......',
      '...L......',
      '....L.....',
      '.....L....',
      '......L...',
      '.......L..',
    ]),
  },
  dragonscale_armour: {
    recolor: { regions: { torso: 'leaf', sleeve: 'leaf', belt: 'gold' }, pattern: scales },
    shoulders: part(-1, -1, ['.GVV', 'GVVV', 'VVVv']),
  },

  // --- Hands and arms ----------------------------------------------------------------------------
  leather_bracers: {
    recolor: { regions: { forearm: 'leather' } },
  },
  runed_gauntlets: {
    recolor: { regions: { forearm: 'iron', hand: 'iron' } },
  },
  shield_emblem: {
    leftHand: part(-4, -6, [
      'GGGGGGG',
      'GWWWWWG',
      'GWW!WWG',
      'GW!G!WG',
      'GWW!WWG',
      'GWWWWWG',
      '.GWWWG.',
      '..GWG..',
      '...G...',
    ]),
  },
  skull_pauldrons: {
    shoulders: part(-1, -2, ['.WWW.', 'WW*WW', 'W*W*W', 'WWWWW', '.w.w.']),
  },

  // --- Aura and emblem ---------------------------------------------------------------------------
  trial_medallion: {
    front: part(3, 1, ['X....X', '.X..X.', '..GG..', '.GRRG.', '.GRRG.', '..GG..']),
  },
  war_paint: {
    head: part(2, 7, ['R......R', '.R....R.']),
  },
  ember_aura: {
    glow: 'glowFire',
    sparkles: sparkle(
      [
        [-5, -1],
        [17, 1],
        [-6, 12],
        [18, 15],
        [15, -3],
        [-5, 26],
        [17, 30],
      ],
      'sparkFire',
    ),
  },
  lute_emblem: {
    back: part(-6, -3, [
      '..............DG',
      '.............D..',
      '............D...',
      '...........D....',
      '..........D.....',
      '.........D......',
      '........D.......',
      '.......D........',
      '..LLL.D.........',
      '.LLLLLD.........',
      'LLLlLLLL........',
      'LLLLLLLL........',
      'LLLLLLLL........',
      '.LLLLLL.........',
      '..LLLL..........',
    ]),
  },
  war_banner: {
    back: part(-9, -14, [
      'G..........',
      'D..........',
      'DXXXXXXXX..',
      'DXXXXXXXXX.',
      'DXXXGGXXXX.',
      'DXXGGGGXXX.',
      'DXXXGGXXXX.',
      'DXXXXXXXXX.',
      'DXXXXXXXXX.',
      'DX.XXX.XX..',
      ...Array.from({ length: 22 }, () => 'D..........'),
    ]),
  },
  lightbringer_halo: {
    head: part(1, -4, ['..!!!!!!..', '!!......!!', '..!!!!!!..']),
    glow: 'glowLight',
  },
  arcane_aura: {
    glow: 'glowArcane',
    sparkles: [
      ...stars(
        [
          [-5, 3],
          [17, 8],
        ],
        'sparkArcane',
        'sparkWhite',
      ),
      ...sparkle(
        [
          [0, -4],
          [14, -3],
          [-6, 20],
          [18, 24],
        ],
        'sparkArcane',
      ),
    ],
  },
  flame_aura: {
    glow: 'glowFlame',
    sparkles: sparkle(
      [
        [-4, -1],
        [-4, -2],
        [-5, 0],
        [16, -2],
        [16, -3],
        [17, -1],
        [-6, 16],
        [-6, 15],
        [18, 20],
        [18, 19],
        [-5, 28],
        [17, 31],
      ],
      'sparkFire',
    ),
  },
  starforged_halo: {
    head: part(1, -4, ['..EEEEEE..', 'EE......EE', '..EEEEEE..']),
    sparkles: stars(
      [
        [-5, 4],
        [17, 1],
        [-6, 22],
      ],
      'sparkRune',
      'sparkWhite',
    ),
  },
  golden_aura: {
    glow: 'glowGold',
    sparkles: [
      ...stars(
        [
          [-5, 1],
          [17, -1],
          [18, 20],
        ],
        'sparkGold',
        'sparkWhite',
      ),
      ...sparkle(
        [
          [-6, 16],
          [12, -4],
          [-1, -3],
        ],
        'sparkGold',
      ),
    ],
  },
};

// --- Class weapons -------------------------------------------------------------------------------

export interface WeaponArt {
  /** Drawn upright, as held at the shoulder or brandished. */
  part: SpritePart;
  /** The cell the hand holds (the fist is drawn over it). */
  grip: { x: number; y: number };
  /** Both hands carry one (the left one mirrored). */
  twin?: boolean;
  /**
   * How it is lowered or planted on the ground: `flip` point down (blades, axes, hammers rest on
   * their heads), `upright` as drawn (staffs, the bow, the lute, the wand). Default `flip`.
   */
  plant?: 'flip' | 'upright';
  /** Planted mirrored, so a curved blade leans towards the hero. */
  plantMirror?: boolean;
  /** Material swaps for the tier III version (e.g. iron → rune: a glowing blade). */
  upgrade: Readonly<Record<string, string>>;
  /** Extra cells of the upgraded version (gems, glints), in part coordinates. */
  upgradeMarks?: readonly { x: number; y: number; fixed: string }[];
  /** Carried on the screen-left arm as well: the Knight's shield (relative to that hand). */
  offHand?: PlacedPart;
}

/** A straight two-pixel blade of `length` rows over a hilt (4 wide). */
const blade = (length: number, hilt: readonly string[]) => [
  '.I..',
  ...Array.from({ length }, () => '.II.'),
  ...hilt,
];

export const WEAPON_ART: Readonly<Record<string, WeaponArt>> = {
  recruit: {
    part: {
      rows: ['.D..', ...Array.from({ length: 7 }, () => '.DD.'), 'DDDD', '.L..', '.L..', '.D..'],
    },
    grip: { x: 1, y: 9 },
    upgrade: {},
  },
  warrior: {
    part: { rows: blade(8, ['GGGG', '.L..', '.L..', '.G..']) },
    grip: { x: 1, y: 10 },
    upgrade: { iron: 'rune' },
    upgradeMarks: [{ x: 1, y: 12, fixed: 'sparkRed' }],
  },
  ranger: {
    plant: 'upright',
    part: {
      rows: [
        'WD...',
        'W.D..',
        'W..D.',
        'W...D',
        'W...D',
        'W...D',
        'W...D',
        'W..LD',
        'W..LD',
        'W...D',
        'W...D',
        'W...D',
        'W...D',
        'W..D.',
        'W.D..',
        'WD...',
      ],
    },
    grip: { x: 3, y: 8 },
    upgrade: { wood: 'leaf' },
    upgradeMarks: [
      { x: 2, y: 0, fixed: 'sparkGold' },
      { x: 2, y: 15, fixed: 'sparkGold' },
    ],
  },
  monk: {
    plant: 'upright',
    part: { rows: ['I', 'I', ...Array.from({ length: 19 }, () => 'D'), 'I'] },
    grip: { x: 0, y: 10 },
    upgrade: { iron: 'fire' },
    upgradeMarks: [{ x: 0, y: -1, fixed: 'sparkFire' }],
  },
  barbarian: {
    part: {
      rows: [
        '...D...',
        'II.D.II',
        'IIIDIII',
        'IIIDIII',
        'IIIDIII',
        'II.D.II',
        '...D...',
        '...D...',
        '...D...',
        '...D...',
        '...L...',
        '...L...',
        '...D...',
      ],
    },
    grip: { x: 3, y: 10 },
    upgrade: { iron: 'bone', wood: 'darkIron' },
    upgradeMarks: [{ x: 3, y: 3, fixed: 'sparkRed' }],
  },
  rogue: {
    part: { rows: ['.I.', '.I.', '.I.', '.I.', 'GGG', '.L.', '.L.'] },
    grip: { x: 1, y: 5 },
    twin: true,
    upgrade: { iron: 'arcane' },
  },
  druid: {
    plant: 'upright',
    part: {
      rows: [
        '.DD.',
        'DOOD',
        'DOOD',
        '.DD.',
        '.D..',
        '..D.',
        '..D.',
        '.VD.',
        '..D.',
        '..D.',
        '..DV',
        '..D.',
        '..D.',
        '..D.',
        '..D.',
        '..D.',
        '..D.',
        '..D.',
        '..D.',
        '..D.',
      ],
    },
    grip: { x: 2, y: 10 },
    upgrade: { orchid: 'rune', wood: 'leaf' },
    upgradeMarks: [
      { x: 0, y: 0, fixed: 'sparkGold' },
      { x: 3, y: 0, fixed: 'sparkGold' },
    ],
  },
  paladin: {
    part: {
      rows: [
        'IIIIII',
        'IIIIII',
        'IIIIII',
        'IIIIII',
        '..DD..',
        '..DD..',
        '..DD..',
        '..DD..',
        '..DD..',
        '..LL..',
        '..LL..',
        '..GG..',
      ],
    },
    grip: { x: 2, y: 9 },
    upgrade: { iron: 'gold' },
    upgradeMarks: [{ x: 2, y: 1, fixed: 'sparkWhite' }],
  },
  samurai: {
    part: {
      rows: [
        '...I',
        '..II',
        '..I.',
        '.II.',
        '.I..',
        '.I..',
        'II..',
        'I...',
        'I...',
        'I...',
        'GG..',
        'R...',
        'R...',
        'R...',
      ],
    },
    grip: { x: 0, y: 11 },
    plantMirror: true,
    upgrade: { iron: 'rune' },
  },
  templar: {
    part: {
      rows: [
        '.I.I.',
        'IIIII',
        '.III.',
        'IIIII',
        '.I.I.',
        '..D..',
        '..D..',
        '..D..',
        '..D..',
        '..L..',
        '..L..',
        '..G..',
      ],
    },
    grip: { x: 2, y: 9 },
    upgrade: { iron: 'gold' },
  },
  bard: {
    plant: 'upright',
    part: {
      rows: [
        '..DD.',
        '..D..',
        '..D..',
        '..D..',
        '..D..',
        '..D..',
        '.LLL.',
        'LLLLL',
        'LLlLL',
        'LLLLL',
        'LLLLL',
        '.LLL.',
      ],
    },
    grip: { x: 2, y: 5 },
    upgrade: { wood: 'gold' },
    upgradeMarks: [{ x: 0, y: 0, fixed: 'sparkGold' }],
  },
  cleric: {
    part: {
      rows: ['.G.', 'GGG', 'G!G', 'GGG', '.G.', '.L.', '.L.', '.L.', '.L.', '.L.', '.G.'],
    },
    grip: { x: 1, y: 8 },
    upgrade: { leather: 'gold' },
    upgradeMarks: [
      { x: -1, y: 0, fixed: 'sparkGold' },
      { x: 3, y: 0, fixed: 'sparkGold' },
    ],
  },
  knight: {
    part: { rows: blade(8, ['GGGG', '.L..', '.L..', '.G..']) },
    grip: { x: 1, y: 10 },
    upgrade: { iron: 'gold' },
    offHand: part(-4, -6, [
      'IIIIIII',
      'IXXXXXI',
      'IXXGXXI',
      'IXGGGXI',
      'IXXGXXI',
      'IXXGXXI',
      '.IXXXI.',
      '..IXI..',
      '...I...',
    ]),
  },
  berserker: {
    part: {
      rows: ['.II..', 'IIIID', 'IIIID', 'IIIID', '.II.D', '....D', '....D', '....L', '....L'],
    },
    grip: { x: 4, y: 7 },
    twin: true,
    upgrade: { iron: 'red' },
  },
  sorcerer: {
    plant: 'upright',
    part: { rows: ['.A.', 'AAA', 'AAA', '.A.', 'G.G', '.G.', '.D.', '.D.', '.D.', '.D.', '.D.'] },
    grip: { x: 1, y: 8 },
    upgrade: { wood: 'night', arcane: 'rune' },
    upgradeMarks: [
      { x: 1, y: -2, fixed: 'sparkWhite' },
      { x: -1, y: 0, fixed: 'sparkArcane' },
      { x: 3, y: 0, fixed: 'sparkArcane' },
    ],
  },
};
