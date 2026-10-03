/**
 * The companion's accessories and class weapons as layered pixel parts (PLAN 6.10, ADR-059).
 * Original art in the spirit of SNES-era JRPG sprites. Each accessory is one or more of:
 * - `head`: a part placed relative to the head box (14 × 13; it may reach above or beside it),
 * - `back`: a part behind the body, relative to the torso box (10 × 8): cloaks, banners, a lute,
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

/** A cloak behind the body: `length` rows from the shoulders, flaring, with a hem pattern. */
function cloakRows(
  fill: string,
  edge: string,
  length: number,
  hem?: (x: number) => string,
): string[] {
  const rows: string[] = [];
  for (let y = 0; y < length; y += 1) {
    const half = Math.min(9.5, 6 + Math.floor(y / 3));
    let row = '';
    for (let x = 0; x < 20; x += 1) {
      const d = Math.abs(x - 9.5);
      if (d > half) row += '.';
      else if (y >= length - 2 && hem) row += hem(x);
      else row += d > half - 1 ? edge : fill;
    }
    rows.push(row);
  }
  return rows;
}

/** A collar over both shoulders, in front of the body, at the torso's top. */
const collar = (rows: readonly string[]): PlacedPart => part(-2, 0, rows);

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

export const ACCESSORY_ART: Readonly<Record<string, AccessoryArt>> = {
  // --- Head ------------------------------------------------------------------------------------
  rope_headband: {
    head: part(0, 4, ['LlLlLlLlLlLlLlL.', '..............lL', '...............l']),
  },
  iron_circlet: {
    head: part(0, 3, ['......EE......', 'IIIIIIEEIIIIII']),
  },
  golden_crown: {
    head: part(1, -4, [
      'G....GG....G',
      'GG..GGGG..GG',
      'GGGGGRRGGGGG',
      'GEGGGRRGGGEG',
      'gggggggggggg',
    ]),
  },
  iron_helm: {
    head: part(-1, -1, [
      '.....IIIIII.....',
      '...IIIIIIIIII...',
      '..IIIIIIIIIIII..',
      '.IIIIIIIIIIIIII.',
      '.IIIIIIIIIIIIII.',
      'iiiiiiiiiiiiiiii',
      '.......ii.......',
      '.......ii.......',
    ]),
  },
  warlord_helm: {
    head: part(-2, -5, [
      'W................W',
      'W................W',
      'WW..............WW',
      '.WW............WW.',
      '..WW..JJJJJJ..WW..',
      '...WJJJJJJJJJJW...',
      '...JJJJJJJJJJJJ...',
      '..JJJJJJJJJJJJJJ..',
      '..JJJJJJRRJJJJJJ..',
      '.GGGGGGGGGGGGGGGG.',
      '........jj........',
      '........jj........',
    ]),
  },
  green_hood: {
    head: part(-1, -1, [
      '.....VVVVVV.....',
      '...VVVVVVVVVV...',
      '..VVVVVVVVVVVV..',
      '.VVVVVVVVVVVVVV.',
      '.VVVVVVVVVVVVVV.',
      'VVVVVvvvvvvVVVVV',
      'VVVv........vVVV',
      'VVV..........VVV',
      'VVV..........VVV',
      'VVV..........VVV',
      'VVVV........VVVV',
      '.VVVV......VVVV.',
      '..VVVV....VVVV..',
      '..VVVVVVVVVVVV..',
    ]),
  },
  bone_crown: {
    head: part(1, -3, [
      'W...W..W...W',
      'W..WW..WW..W',
      'WW.WW..WW.WW',
      'WWWWWWWWWWWW',
      'WMWMW**WMWMW',
    ]),
  },
  shadow_mask: {
    head: part(0, 4, [
      'NNNNNNNNNNNNNNN.',
      '..............NN',
      '...............N',
      '................',
      '................',
      '................',
      '..NNNNNNNNNN....',
      '..NNNNNNNNNN....',
      '...NNNNNNNN.....',
    ]),
  },
  nightblade_cowl: {
    head: part(-1, -1, [
      '.....NNNNNN.....',
      '...NNNNNNNNNN...',
      '..NNNNNNNNNNNN..',
      '.NNNNNNNNNNNNNN.',
      '.NNNNNNNNNNNNNN.',
      'NNNNNnnnnnnNNNNN',
      'NNNn........nNNN',
      'NNN..........NNN',
      'NNN..........NNN',
      'NNN..........NNN',
      'NNNNNNNNNNNNNNNN',
      '.NNNNNNNNNNNNNN.',
      '..NNNNNNNNNNNN..',
      '..NNNNNNNNNNNN..',
    ]),
  },
  antler_wreath: {
    head: part(-1, -4, [
      'W..W........W..W',
      'W.W..........W.W',
      '.WW.W......W.WW.',
      '..WW........WW..',
      '...W........W...',
      '.VvVvVvVvVvVvVv.',
    ]),
  },
  leaf_crown: {
    head: part(0, -3, ['...V..OV..V...', '.V.VV.VV.VV.V.', 'VVvVVvVVvVVvVV', '.OVvVVVVVVvVO.']),
  },
  hachimaki: {
    head: part(-3, 4, ['...WWWWWWWRRWWWWW', '.Ww..............', 'Ww...............']),
  },
  kabuto: {
    head: part(-2, -5, [
      '..G............G..',
      '...G..........G...',
      '....GG......GG....',
      '.....GGGGGGGG.....',
      '....RRRRRRRRRR....',
      '...RRRRRRRRRRRR...',
      '..RRRRRRRRRRRRRR..',
      '..GGGGGGGGGGGGGG..',
      '.RRR..........RRR.',
      'RRR............RRR',
    ]),
  },
  feathered_cap: {
    head: part(-1, -2, [
      '..............G..',
      '....XXXXXXX..GW..',
      '..XXXXXXXXXXXGW..',
      '.XXXXXXXXXXXXW...',
      'XXXXXXXXXXXXXXX..',
      '.xxxxxxxxxxxxxxx.',
    ]),
  },
  mitre: {
    head: part(2, -6, [
      '...W..W...',
      '..WW..WW..',
      '.WWW..WWW.',
      '.WWWGGWWW.',
      'WWWWGGWWWW',
      'WWGGGGGGWW',
      'WWWWGGWWWW',
      'WWWWGGWWWW',
      'GGGGGGGGGG',
    ]),
  },
  crested_helm: {
    head: part(0, -4, [
      '.....XXXX.....',
      '....XXXXXX....',
      '.....XxxX.....',
      '....IIIIII....',
      '..IIIIIIIIII..',
      '.IIIIIIIIIIII.',
      '.IIIIIIIIIIII.',
      'IIIIIIIIIIIIII',
      'IIIIIIIIIIIIII',
      'II**********II',
      'IIIIII**IIIIII',
      'IIIIII**IIIIII',
      'IIIIIIIIIIIIII',
      '.IIIIIIIIIIII.',
      '..IIIIIIIIII..',
      '...iiiiiiii...',
    ]),
  },
  pointed_hat: {
    head: part(-2, -8, [
      '............AA....',
      '...........AAA....',
      '..........AAA.....',
      '.........AAAA.....',
      '........AA!AA.....',
      '.......AAAAAA.....',
      '......AAAAAAAA....',
      '.....AAAAAAAAAA...',
      '.....GGGGGGGGGG...',
      '....AAAAAAAAAAAA..',
      'AAAAAAAAAAAAAAAAAA',
      '.aaaaaaaaaaaaaaaa.',
    ]),
  },

  // --- Cloak and back ----------------------------------------------------------------------------
  hooded_cloak: {
    back: part(-5, 1, cloakRows('X', 'x', 12)),
    behindHead: part(-2, 6, [
      '..xxxxxxxxxxxxxx..',
      '.xxxxxxxxxxxxxxxx.',
      'xxxxxxxxxxxxxxxxxx',
      'xxxxxxxxxxxxxxxxxx',
    ]),
    front: collar(['XX..........XX', 'XXX...GG...XXX']),
  },
  fur_pelt: {
    back: part(
      -5,
      1,
      cloakRows('M', 'm', 6, (x) => (x % 2 === 0 ? 'm' : '.')),
    ),
    front: collar(['MMMMM....MMMMM', 'MmMmMm..mMmMmM', '.m.m.m..m.m.m.']),
  },
  veterans_scarf: {
    back: part(-7, 0, ['xX.......', 'XXx......', '.XXx.....', '..xXX....']),
    front: part(-1, 0, [
      'XXXXXXXXXXXX',
      '.xxxxxxxxxx.',
      '.......XX...',
      '.......Xx...',
      '.......xX...',
    ]),
  },
  knights_mantle: {
    back: part(
      -5,
      1,
      cloakRows('X', 'x', 12, () => 'G'),
    ),
    front: collar(['GGG........GGG', 'GXGG..GG..GGXG', '.GG........GG.']),
  },
  warden_cloak: {
    back: part(
      -5,
      1,
      cloakRows('V', 'v', 12, (x) => (x % 2 === 0 ? 'V' : 'v')),
    ),
    front: collar(['VvV........VvV', 'vVvV..OO..VvVv']),
  },
  templar_cape: {
    back: part(
      -5,
      1,
      cloakRows('W', 'w', 13, () => 'R'),
    ),
    front: collar(['RRR........RRR', 'RWRR..RR..RRWR']),
  },
  high_lord_cape: {
    back: part(
      -5,
      1,
      cloakRows('X', 'x', 14, (x) => (x % 3 === 0 ? '*' : 'W')),
    ),
    front: collar(['WWWW......WWWW', 'W*WWW.GG.WW*WW', '.WW*W....W*WW.']),
  },
  phoenix_cloak: {
    back: part(
      -5,
      1,
      cloakRows('R', 'r', 13, (x) => (x % 2 === 0 ? 'F' : 'f')),
    ),
    front: collar(['FFF........FFF', 'FRFF..FF..FFRF']),
  },

  // --- Body ------------------------------------------------------------------------------------
  travelers_tunic: {
    recolor: { regions: { torso: 'leather' } },
    front: part(0, 0, [
      '....SS....',
      '...XSSX...',
      '....XX....',
      '..........',
      '..........',
      '..........',
      '....GG....',
    ]),
  },
  prayer_beads: {
    front: part(0, 1, [
      '.W......W.',
      '..D....D..',
      '...W..W...',
      '....DD....',
      '....RR....',
      '....rr....',
    ]),
  },
  holy_symbol: {
    front: part(0, 1, ['..G....G..', '...G..G...', '....GG....', '...G!!G...', '...GGGG...']),
  },
  templar_tabard: {
    recolor: { regions: { torso: 'bone' } },
    front: part(1, 1, [
      '...RR...',
      '...RR...',
      '.RRRRRR.',
      '...RR...',
      '...RR...',
      '........',
      'WWWWWWWW',
      'WWWWWWWW',
      'wWWWWWWw',
    ]),
  },
  chainmail_vest: {
    recolor: { regions: { torso: 'iron', belt: 'leather' }, pattern: rings },
  },
  grandmaster_robe: {
    recolor: { regions: { torso: 'robe', sleeve: 'robe', belt: 'leather', legs: 'robe' } },
    front: part(0, 1, ['.L........', '..L.......', '...L......', '....L.....', '.....L....']),
  },
  dragonscale_armour: {
    recolor: { regions: { torso: 'leaf', sleeve: 'leaf', belt: 'gold' }, pattern: scales },
    shoulders: part(-1, -1, ['GVV', 'VVv']),
  },

  // --- Hands and arms ----------------------------------------------------------------------------
  leather_bracers: {
    recolor: { regions: { forearm: 'leather' } },
  },
  runed_gauntlets: {
    recolor: { regions: { forearm: 'iron', hand: 'iron' } },
  },
  shield_emblem: {
    leftHand: part(-3, -4, [
      'GGGGGGG',
      'GWWWWWG',
      'GWW!WWG',
      'GW!G!WG',
      'GWW!WWG',
      '.GWWWG.',
      '..GWG..',
      '...G...',
    ]),
  },
  skull_pauldrons: {
    shoulders: part(-1, -2, ['WWWW', 'W**W', 'WWWW', '.ww.']),
  },

  // --- Aura and emblem ---------------------------------------------------------------------------
  trial_medallion: {
    front: part(2, 1, ['X....X', '.X..X.', '..GG..', '.GRRG.', '.GRRG.', '..GG..']),
  },
  war_paint: {
    head: part(2, 9, ['RR......RR', '..........', 'RR......RR']),
  },
  ember_aura: {
    glow: 'glowFire',
    sparkles: sparkle(
      [
        [-3, -2],
        [16, 0],
        [-4, 9],
        [17, 12],
        [15, -4],
        [-2, 18],
      ],
      'sparkFire',
    ),
  },
  lute_emblem: {
    back: part(-6, 1, [
      '..............DG',
      '.............D..',
      '............D...',
      '...........D....',
      '..........D.....',
      '.........D......',
      '..LLL...D.......',
      '.LLLLLLD........',
      'LLLlLLLL........',
      'LLLLLLLL........',
      '.LLLLLL.........',
      '..LLLL..........',
    ]),
  },
  war_banner: {
    back: part(-9, -16, [
      'G.........',
      'D.........',
      'DXXXXXXX..',
      'DXXXXXXXX.',
      'DXXGGXXXX.',
      'DXXGGXXXX.',
      'DXXXXXXXX.',
      'DXXXXXXXX.',
      'DX.XX.XX..',
      ...Array.from({ length: 20 }, () => 'D.........'),
    ]),
  },
  lightbringer_halo: {
    head: part(2, -5, ['..!!!!!!..', '!!......!!', '..!!!!!!..']),
    glow: 'glowLight',
  },
  arcane_aura: {
    glow: 'glowArcane',
    sparkles: [
      ...stars(
        [
          [-4, 2],
          [17, 6],
        ],
        'sparkArcane',
        'sparkWhite',
      ),
      ...sparkle(
        [
          [0, -5],
          [14, -4],
          [-5, 17],
          [18, 19],
        ],
        'sparkArcane',
      ),
    ],
  },
  flame_aura: {
    glow: 'glowFlame',
    sparkles: sparkle(
      [
        [-3, -1],
        [-3, -2],
        [-4, 0],
        [16, -3],
        [16, -4],
        [17, -2],
        [6, -6],
        [7, -7],
        [-5, 12],
        [-5, 11],
        [18, 14],
        [18, 13],
      ],
      'sparkFire',
    ),
  },
  starforged_halo: {
    head: part(2, -5, ['..EEEEEE..', 'EE......EE', '..EEEEEE..']),
    sparkles: stars(
      [
        [-4, 4],
        [17, 1],
        [-5, 20],
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
          [-4, 0],
          [17, -2],
          [18, 16],
        ],
        'sparkGold',
        'sparkWhite',
      ),
      ...sparkle(
        [
          [-5, 14],
          [12, -6],
          [0, -4],
        ],
        'sparkGold',
      ),
    ],
  },
};

// --- Class weapons -------------------------------------------------------------------------------

export interface WeaponArt {
  /** Drawn upright, as held at the side. */
  part: SpritePart;
  /** The cell the hand holds (the fist is drawn over it). */
  grip: { x: number; y: number };
  /** Both hands carry one (the left one mirrored). */
  twin?: boolean;
  /** Material swaps for the tier III version (e.g. iron → rune: a glowing blade). */
  upgrade: Readonly<Record<string, string>>;
  /** Extra cells of the upgraded version (gems, glints), in part coordinates. */
  upgradeMarks?: readonly { x: number; y: number; fixed: string }[];
  /** Carried on the screen-left arm as well: the Knight's shield (relative to that hand). */
  offHand?: PlacedPart;
}

const blade = (length: number, hilt: readonly string[]) => [
  ...Array.from({ length }, () => '.I.'),
  ...hilt,
];

export const WEAPON_ART: Readonly<Record<string, WeaponArt>> = {
  recruit: {
    part: { rows: ['.D.', '.D.', '.D.', '.D.', '.D.', '.D.', 'DDD', '.L.', '.L.', '.D.'] },
    grip: { x: 1, y: 7 },
    upgrade: {},
  },
  warrior: {
    part: { rows: blade(8, ['GGG', '.L.', '.L.', '.G.']) },
    grip: { x: 1, y: 9 },
    upgrade: { iron: 'rune' },
    upgradeMarks: [{ x: 1, y: 11, fixed: 'sparkRed' }],
  },
  ranger: {
    part: {
      rows: [
        'WD..',
        'W.D.',
        'W..D',
        'W..D',
        'W..D',
        'W..D',
        'W.LD',
        'W.LD',
        'W..D',
        'W..D',
        'W..D',
        'W..D',
        'W.D.',
        'WD..',
      ],
    },
    grip: { x: 2, y: 7 },
    upgrade: { wood: 'leaf' },
    upgradeMarks: [
      { x: 2, y: 0, fixed: 'sparkGold' },
      { x: 2, y: 13, fixed: 'sparkGold' },
    ],
  },
  monk: {
    part: { rows: ['I', ...Array.from({ length: 17 }, () => 'D'), 'I'] },
    grip: { x: 0, y: 12 },
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
        'II.D.II',
        '...D...',
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
    upgradeMarks: [{ x: 3, y: 2, fixed: 'sparkRed' }],
  },
  rogue: {
    part: { rows: ['.I.', '.I.', '.I.', 'GGG', '.L.', '.L.'] },
    grip: { x: 1, y: 4 },
    twin: true,
    upgrade: { iron: 'arcane' },
  },
  druid: {
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
      ],
    },
    grip: { x: 2, y: 12 },
    upgrade: { orchid: 'rune', wood: 'leaf' },
    upgradeMarks: [
      { x: 0, y: 0, fixed: 'sparkGold' },
      { x: 3, y: 0, fixed: 'sparkGold' },
    ],
  },
  paladin: {
    part: {
      rows: [
        'IIIII',
        'IIIII',
        'IIIII',
        '..D..',
        '..D..',
        '..D..',
        '..D..',
        '..D..',
        '..L..',
        '..L..',
        '..G..',
      ],
    },
    grip: { x: 2, y: 8 },
    upgrade: { iron: 'gold' },
    upgradeMarks: [{ x: 2, y: 1, fixed: 'sparkWhite' }],
  },
  samurai: {
    part: {
      rows: [
        '..I',
        '.II',
        '.I.',
        '.I.',
        '.I.',
        'I..',
        'I..',
        'I..',
        'I..',
        'G..',
        'R..',
        'R..',
        'R..',
      ],
    },
    grip: { x: 0, y: 11 },
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
        '..L..',
        '..L..',
      ],
    },
    grip: { x: 2, y: 8 },
    upgrade: { iron: 'gold' },
  },
  bard: {
    part: {
      rows: [
        '..DD.',
        '..D..',
        '..D..',
        '..D..',
        '..D..',
        '.LLL.',
        'LLLLL',
        'LLlLL',
        'LLLLL',
        '.LLL.',
      ],
    },
    grip: { x: 2, y: 4 },
    upgrade: { wood: 'gold' },
    upgradeMarks: [{ x: 0, y: 0, fixed: 'sparkGold' }],
  },
  cleric: {
    part: { rows: ['.G.', 'GGG', 'G!G', 'GGG', '.G.', '.L.', '.L.', '.L.', '.L.', '.G.'] },
    grip: { x: 1, y: 7 },
    upgrade: { leather: 'gold' },
    upgradeMarks: [
      { x: -1, y: 0, fixed: 'sparkGold' },
      { x: 3, y: 0, fixed: 'sparkGold' },
    ],
  },
  knight: {
    part: { rows: blade(8, ['GGG', '.L.', '.L.', '.G.']) },
    grip: { x: 1, y: 9 },
    upgrade: { iron: 'gold' },
    offHand: part(-3, -4, [
      '.IIIII.',
      'IXXXXXI',
      'IXXGXXI',
      'IXGGGXI',
      'IXXGXXI',
      'IXXXXXI',
      '.IIIII.',
    ]),
  },
  berserker: {
    part: { rows: ['II.', 'IID', 'IID', '..D', '..D', '..L', '..L'] },
    grip: { x: 2, y: 5 },
    twin: true,
    upgrade: { iron: 'red' },
  },
  sorcerer: {
    part: { rows: ['.A.', 'AAA', '.A.', '.D.', '.D.', '.D.', '.D.'] },
    grip: { x: 1, y: 5 },
    upgrade: { wood: 'night', arcane: 'rune' },
    upgradeMarks: [
      { x: 1, y: -2, fixed: 'sparkWhite' },
      { x: -1, y: 0, fixed: 'sparkArcane' },
      { x: 3, y: 0, fixed: 'sparkArcane' },
    ],
  },
};
