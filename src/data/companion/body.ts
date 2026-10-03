/**
 * The companion's bodies (PLAN 6.10 / 6.13, ADR-059 / ADR-061): an original JRPG field-sprite hero
 * drawn as layered part grids, in the spirit of SNES-era Final Fantasy and Octopath Traveler's
 * taller sprites (inspiration only, nothing copied): a lean, heroic build with the head about a
 * quarter of the height, broad shoulders, long legs, a determined face and sharp hair. Two bodies
 * (man, woman) share every anchor, so each accessory and weapon fits both. Seen from the front on a
 * `SPRITE_WIDTH` × `SPRITE_HEIGHT` canvas. Parts only name materials and regions; the shading and
 * the selective outline come from `src/lib/sprite.ts`, and accessories recolour regions (a
 * chainmail torso, leather forearms) or draw their own parts on top.
 *
 * Frame anchors: every pose places the head box (12 × 10), the torso box (12 × 13), both arms and
 * the legs; accessories and weapons are placed from these anchors, so they follow every pose.
 */
import type { CompanionBody } from '@/domain/companion';
import type { Legend, Point, SpriteCell, SpritePart } from '@/lib/sprite';

/** The sprite canvas in sprite pixels. The one place its size is set (UI, widget, scripts). */
export const SPRITE_SIZE = { width: 32, height: 44 } as const;
export const SPRITE_WIDTH = SPRITE_SIZE.width;
export const SPRITE_HEIGHT = SPRITE_SIZE.height;

/** The bottom row of the boots in a standing or kneeling frame. */
export const GROUND_Y = 41;

/** Width of the head and torso boxes (accessories are drawn against these). */
export const HEAD_WIDTH = 12;
export const TORSO_WIDTH = 12;

/** Region names accessories recolour. */
export const REGIONS = {
  face: 'face',
  hair: 'hair',
  torso: 'torso',
  sleeve: 'sleeve',
  forearm: 'forearm',
  hand: 'hand',
  belt: 'belt',
  legs: 'legs',
  boots: 'boots',
  gear: 'gear',
} as const;

export const BODY_LEGEND: Legend = {
  S: { material: 'skin', region: REGIONS.face },
  Z: { material: 'skin', region: REGIONS.forearm },
  Y: { material: 'skin', region: REGIONS.hand },
  H: { material: 'hair', region: REGIONS.hair },
  h: { material: 'hair', region: REGIONS.hair, tone: 'shadow' },
  C: { material: 'outfit', region: REGIONS.torso },
  c: { material: 'outfit', region: REGIONS.sleeve },
  T: { material: 'leather', region: REGIONS.belt },
  P: { material: 'pants', region: REGIONS.legs },
  B: { material: 'boots', region: REGIONS.boots },
};

// --- Heads ---------------------------------------------------------------------------------------

/** The man's head: skull, a squarer jaw, the hair cap (styles add the rest). 12 × 10. */
const HEAD_MAN: SpritePart = {
  rows: [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '.HHHHHHHHHH.',
    '.HHHHHHHHHH.',
    '.HSSSSSSSSH.',
    '.HSSSSSSSSH.',
    '.HSSSSSSSSH.',
    '..SSSSSSSS..',
    '..SSSSSSSS..',
    '...SSSSSS...',
  ],
};

/** The woman's head: the same box, a narrower, softer jaw. 12 × 10. */
const HEAD_WOMAN: SpritePart = {
  rows: [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '.HHHHHHHHHH.',
    '.HHHHHHHHHH.',
    '.HSSSSSSSSH.',
    '.HSSSSSSSSH.',
    '.HSSSSSSSSH.',
    '..SSSSSSSS..',
    '...SSSSSS...',
    '....SSSS....',
  ],
};

// --- Torsos --------------------------------------------------------------------------------------

/**
 * The man's torso: neck, broad shoulders tapering to the waist (a V), a leather baldric across the
 * chest, the belt and the tunic's hem over the hips. 12 × 13.
 */
const TORSO_MAN: SpritePart = {
  rows: [
    '....SSSS....',
    '.CCCCCCCCCC.',
    'CCTCCCCCCCCC',
    'CCCTCCCCCCCC',
    'CCCCTCCCCCCC',
    'CCCCCTCCCCCC',
    '.CCCCCTCCCC.',
    '..CCCCCTCC..',
    '..CCCCCCTC..',
    '..TTTTTTTT..',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.CCCCCCCCCC.',
  ],
};

/**
 * The woman's torso: narrower shoulders, a fitted jerkin with the baldric, a belt on the hips and
 * a longer split tunic skirt (practical, like a travelling swordswoman). 12 × 15.
 */
const TORSO_WOMAN: SpritePart = {
  rows: [
    '....SSSS....',
    '..CCCCCCCC..',
    '.CTCCCCCCCC.',
    '.CCTCCCCCCC.',
    '.CCCTCCCCCC.',
    '..CCCTCCCC..',
    '..CCCCTCCC..',
    '...CCCCTC...',
    '..CCCCCCTC..',
    '..TTTTTTTT..',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.CCCCC.CCCC.',
    'CCCCC..CCCCC',
    'CCCC....CCCC',
  ],
};

// --- Arms (screen-left; the screen-right arm is the mirror image) --------------------------------

export type ArmPose = 'down' | 'up' | 'shoulder' | 'hip' | 'cross' | 'salute';

interface ArmDef {
  part: SpritePart;
  /** Top-left of the part relative to the torso box (screen-left side). */
  dx: number;
  dy: number;
  /** The screen-right arm's extra row offset (crossed arms stack). */
  rightDy?: number;
  /** Top-left of the 2 × 2 hand in the part. */
  hand: Point;
  /** Drawn over the head (a hand at the brow). */
  overHead?: boolean;
}

const ARMS: Readonly<Record<ArmPose, ArmDef>> = {
  /** Hanging at the side. */
  down: {
    part: {
      rows: ['.cc', 'ccc', 'ccc', 'ccc', 'ccc', 'ccc', 'ZZ.', 'ZZ.', 'ZZ.', 'ZZ.', 'YY.', 'YY.'],
    },
    dx: -2,
    dy: 1,
    hand: { x: 0, y: 10 },
  },
  /** Raised up and out, the hand above the shoulder (a weapon brandished). */
  up: {
    part: {
      rows: ['YY...', 'YY...', 'ZZ...', 'ZZZ..', '.ZZ..', '.Zcc.', '..ccc', '..ccc', '...cc'],
    },
    dx: -5,
    dy: -4,
    hand: { x: 0, y: 0 },
  },
  /** Bent, the hand at the chest by the shoulder: a weapon held upright, resting at the shoulder. */
  shoulder: {
    part: { rows: ['.cc.', 'ccc.', 'ccc.', 'ccc.', 'ccc.', 'ccYY', 'cZYY', 'ZZZ.', '.Z..'] },
    dx: -2,
    dy: 1,
    hand: { x: 2, y: 5 },
  },
  /** The fist on the hip, the elbow out. */
  hip: {
    part: {
      rows: [
        '..cc..',
        '.ccc..',
        '.ccc..',
        'ccc...',
        'ccc...',
        'ZZZ...',
        '.ZZZ..',
        '..ZZYY',
        '....YY',
      ],
    },
    dx: -4,
    dy: 1,
    hand: { x: 4, y: 7 },
  },
  /** Folded across the chest (the right forearm lies over the left). */
  cross: {
    part: {
      rows: [
        '.cc.......',
        'ccc.......',
        'ccc.......',
        'ccc.......',
        'ccc.......',
        'cZZZZZZYY.',
        '.ZZZZZZYY.',
      ],
    },
    dx: -2,
    dy: 1,
    rightDy: 2,
    hand: { x: 7, y: 5 },
  },
  /** A salute: the elbow out, the hand at the brow. */
  salute: {
    part: {
      rows: [
        '......YYY',
        '.....ZYY.',
        '....ZZ...',
        '...ZZ....',
        '..ZZ.....',
        '.ZZ......',
        'cZ.......',
        'ccccc....',
        '.cccc....',
      ],
    },
    dx: -5,
    dy: -6,
    hand: { x: 6, y: 0 },
    overHead: true,
  },
};

/** A fist, drawn again over a held weapon's grip. 2 × 2. */
export const FIST: SpritePart = { rows: ['YY', 'YY'] };

// --- Legs (14 wide, drawn at the torso box's x − 1) ------------------------------------------------

export type LegPose = 'stand' | 'wide' | 'shift' | 'kneel';

const LEGS: Readonly<Record<LegPose, SpritePart>> = {
  /** A firm stance, feet slightly apart. 17 rows. */
  stand: {
    rows: [
      '...PPPPPPPP...',
      '...PPPPPPPP...',
      '...PPP..PPP...',
      '...PPP..PPP...',
      '...PPP..PPP...',
      '...PPP..PPP...',
      '..PPP....PPP..',
      '..PPP....PPP..',
      '..PPP....PPP..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '.BBBB....BBBB.',
      '.BBBB....BBBB.',
    ],
  },
  /** The weight on the screen-left leg, the other knee relaxed. 17 rows. */
  shift: {
    rows: [
      '...PPPPPPPP...',
      '...PPPPPPPP...',
      '...PPP..PPP...',
      '...PPP..PPP...',
      '...PPP..PPP...',
      '..PPP...PPP...',
      '..PPP...PPP...',
      '..PPP....PPP..',
      '..PPP....PPP..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '..BBB....BBB..',
      '..BBB.....BBB.',
      '..BBB.....BBB.',
      '..BBB.....BBB.',
      '.BBBB.....BBBB',
      '.BBBB.....BBBB',
    ],
  },
  /** A wide, strong stance (victory). 17 rows. */
  wide: {
    rows: [
      '...PPPPPPPP...',
      '...PPPPPPPP...',
      '..PPPP..PPPP..',
      '..PPP....PPP..',
      '..PPP....PPP..',
      '.PPP......PPP.',
      '.PPP......PPP.',
      '.PPP......PPP.',
      '.PPP......PPP.',
      '.BBB......BBB.',
      '.BBB......BBB.',
      '.BBB......BBB.',
      '.BBB......BBB.',
      '.BBB......BBB.',
      '.BBB......BBB.',
      'BBBB......BBBB',
      'BBBB......BBBB',
    ],
  },
  /** On one knee: the screen-left foot planted, the screen-right knee on the ground. 11 rows. */
  kneel: {
    rows: [
      '...PPPPPPPP....',
      '..PPPPPPPPPP...',
      '.PPPPP.PPPPP...',
      '.PPPPP..PPPP...',
      '.PPPP...PPPP...',
      '.BBBB...PPPP...',
      '..BBB...PPPP...',
      '..BBB....PPP...',
      '..BBB....PPPBB.',
      '.BBBB....PPBBBB',
      '.BBBB....PPBBBB',
    ],
  },
};

export const LEG_PARTS: Readonly<Record<LegPose, SpritePart>> = LEGS;

// --- Hair styles ---------------------------------------------------------------------------------

/**
 * A hair style: `top` is the volume over the skull (hidden under helmets, hoods and hats),
 * `locks` the fringe and side locks (drawn under headgear), `back` hangs behind the body. Parts
 * are placed relative to the head box. Every style suits both bodies.
 */
export interface HairStyle {
  id: string;
  name: string;
  top?: PlacedBodyPart;
  locks?: PlacedBodyPart;
  back?: PlacedBodyPart;
}

export interface PlacedBodyPart extends SpritePart {
  dx: number;
  dy: number;
}

const placed = (dx: number, dy: number, rows: readonly string[]): PlacedBodyPart => ({
  dx,
  dy,
  rows,
});

export const HAIR_STYLES: readonly HairStyle[] = [
  {
    id: 'spiky',
    name: 'Spiky',
    top: placed(-1, -3, [
      '......H...H...',
      '..H..HH..HH...',
      '..HHHHHHHHHHH.',
      '.HHHhHHHhHHHHH',
      'HHHHHhHHHhHHHH',
      '.HHHHHHhHHHHHH',
      'HHHHHHHHHHHHH.',
    ]),
    locks: placed(-1, 4, ['.HHHHHHHHHHHH.', '.HH...HH...HH.', '.H..........H.', '.H..........H.']),
  },
  {
    id: 'long',
    name: 'Long',
    top: placed(-1, -2, [
      '....HHHHHH....',
      '..HHHHHHHHHH..',
      '.HHHHHHhHHHHH.',
      '.HHHHHhHHHHHH.',
      'HHHHHHhHHHHHHH',
      'HHHHHhHHHHHHHH',
    ]),
    locks: placed(-1, 4, [
      'HHHHHHh.HHHHHH',
      'HHH.H....H.HHH',
      'HHH........HHH',
      'HHH........HHH',
      'HHH........HHH',
      'HH..........HH',
      'HH..........HH',
      'HH..........HH',
      '.H..........H.',
    ]),
    back: placed(-2, 6, [
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      '..HHHHHHHHHHHH..',
      '..HHH.HHHH.HHH..',
    ]),
  },
  {
    id: 'ponytail',
    name: 'Ponytail',
    top: placed(-1, -2, [
      '....HHHHHH....',
      '..HHHHHHHHHH..',
      '.HHHHHHHHHHHH.',
      '.HhHHHHHhHHHHH',
      'HHHhHHHHHhHHHH',
      'HHHHHHHHHHHHHH',
    ]),
    locks: placed(-1, 4, ['.HHHH.HHHHHHH.', '.HH.H...H..HH.', '.H..........H.']),
    // Tied high on the screen-left side, away from the weapon hand.
    back: placed(-4, -1, [
      '.HHH..',
      'HHHHH.',
      'HHTT..',
      'HHH...',
      'HHH...',
      'HHH...',
      'HHHH..',
      '.HHH..',
      '.HHH..',
      '..HH..',
      '...HH.',
    ]),
  },
];

export const HAIR_STYLE_BY_ID: ReadonlyMap<string, HairStyle> = new Map(
  HAIR_STYLES.map((style) => [style.id, style]),
);

// --- Bodies --------------------------------------------------------------------------------------

export interface BodyShape {
  id: CompanionBody;
  name: string;
  head: SpritePart;
  torso: SpritePart;
  /** How far the arms sit in from the torso box's edges (narrower shoulders). */
  armInset: number;
  /** A lash pixel at the outer corner of each eye. */
  lashes: boolean;
  /** The hair style a hero who never chose one wears. */
  defaultHair: string;
}

export const BODY_SHAPES: Readonly<Record<CompanionBody, BodyShape>> = {
  man: {
    id: 'man',
    name: 'Man',
    head: HEAD_MAN,
    torso: TORSO_MAN,
    armInset: 0,
    lashes: false,
    defaultHair: 'spiky',
  },
  woman: {
    id: 'woman',
    name: 'Woman',
    head: HEAD_WOMAN,
    torso: TORSO_WOMAN,
    armInset: 1,
    lashes: true,
    defaultHair: 'long',
  },
};

// --- Frames --------------------------------------------------------------------------------------

export type Face = 'calm' | 'smirk' | 'down' | 'left' | 'right' | 'fierce';

/** One frame of the companion: where everything goes. */
export interface BodyFrame {
  head: Point;
  torso: Point;
  /** Screen-left arm, screen-right arm. */
  arms: readonly [ArmPose, ArmPose];
  legs: LegPose;
  /** Where the legs part goes (its top-left). */
  legsAt: Point;
  face: Face;
  /** Cloak and long hair sway: the lower part of back parts moves this many pixels. */
  sway?: number;
}

/** The standing frame; the others move parts from it. */
export const STAND: BodyFrame = {
  head: { x: 10, y: 4 },
  torso: { x: 10, y: 14 },
  arms: ['down', 'down'],
  legs: 'stand',
  legsAt: { x: 9, y: 25 },
  face: 'calm',
};

/** Shifts the upper body (head, torso, arms) by `dy` (and `dx`), and optionally the legs too. */
export function shifted(frame: BodyFrame, dy: number, legsDy = 0, dx = 0): BodyFrame {
  return {
    ...frame,
    head: { x: frame.head.x + dx, y: frame.head.y + dy },
    torso: { x: frame.torso.x + dx, y: frame.torso.y + dy },
    legsAt: { x: frame.legsAt.x, y: frame.legsAt.y + legsDy },
  };
}

/** The top-left of an arm part and its hand (the grip cell), for side `-1` (left) or `1` (right). */
export function armPlacement(
  frame: BodyFrame,
  side: -1 | 1,
  shape: BodyShape = BODY_SHAPES.man,
): { at: Point; hand: Point; part: SpritePart; overHead: boolean } {
  const pose = frame.arms[side === -1 ? 0 : 1];
  const arm = ARMS[pose];
  const width = Math.max(...arm.part.rows.map((row) => row.length));
  const y = frame.torso.y + arm.dy + (side === 1 ? (arm.rightDy ?? 0) : 0);
  if (side === -1) {
    const x = frame.torso.x + arm.dx + shape.armInset;
    // The left hand's grip is the hand's left column (weapons there are mirrored).
    return {
      part: arm.part,
      at: { x, y },
      hand: { x: x + arm.hand.x, y: y + arm.hand.y + 1 },
      overHead: arm.overHead === true,
    };
  }
  const x = frame.torso.x + TORSO_WIDTH - arm.dx - width - shape.armInset;
  const handX = x + width - arm.hand.x - 2;
  return {
    part: arm.part,
    at: { x, y },
    hand: { x: handX + 1, y: y + arm.hand.y + 1 },
    overHead: arm.overHead === true,
  };
}

/** A face cell: a fixed colour (eyes, mouth) or a material tone (brows, nose shade). */
export interface FaceCell {
  x: number;
  y: number;
  cell: SpriteCell;
}

const fixed = (x: number, y: number, key: string): FaceCell => ({ x, y, cell: { fixed: key } });
const brow = (x: number, y: number): FaceCell => ({
  x,
  y,
  cell: { material: 'hair', region: REGIONS.hair, tone: 'outline' },
});
const shade = (x: number, y: number): FaceCell => ({
  x,
  y,
  cell: { material: 'skin', region: REGIONS.face, tone: 'shadow' },
});

/**
 * The face per expression, as cells in the head box (brows row 5, eyes row 6, mouth row 8):
 * narrow, determined eyes under a low brow and a set mouth; no blush, no big round eyes.
 */
export function faceCells(face: Face, shape: BodyShape = BODY_SHAPES.man): FaceCell[] {
  const look = face === 'left' ? -1 : face === 'right' ? 1 : 0;
  const eyes = (row: number, closed = false): FaceCell[] =>
    closed
      ? [
          shade(3, row),
          shade(4, row),
          shade(7, row),
          shade(8, row),
          ...(shape.lashes ? [shade(2, row), shade(9, row)] : []),
        ]
      : [
          fixed(3 + look, row, look > 0 ? 'eye' : 'iris'),
          fixed(4 + look, row, look > 0 ? 'iris' : 'eye'),
          fixed(7 + look, row, look < 0 ? 'iris' : 'eye'),
          fixed(8 + look, row, look < 0 ? 'eye' : 'iris'),
          ...(shape.lashes ? [fixed(2, row, 'eye'), fixed(9, row, 'eye')] : []),
        ];
  // Brows: low and straight, the inner ends a touch lower for resolve (fierce: lower still).
  const brows: FaceCell[] =
    face === 'down'
      ? [brow(3, 5), brow(4, 5), brow(7, 5), brow(8, 5)]
      : face === 'fierce'
        ? [brow(2, 5), brow(3, 5), brow(4, 6), brow(7, 6), brow(8, 5), brow(9, 5)]
        : shape.lashes
          ? [brow(3, 5), brow(4, 5), brow(7, 5), brow(8, 5)]
          : [brow(2, 5), brow(3, 5), brow(4, 5), brow(7, 5), brow(8, 5), brow(9, 5)];
  const nose = [shade(6, 7)];
  const mouth: FaceCell[] =
    face === 'smirk' || face === 'fierce'
      ? [fixed(5, 8, 'mouth'), fixed(6, 8, 'mouth'), fixed(7, 7, 'mouth')]
      : [fixed(5, 8, 'mouth'), fixed(6, 8, 'mouth')];
  if (face === 'fierce') {
    return [
      ...brows,
      fixed(3, 6, 'iris'),
      fixed(4, 6, 'eye'),
      fixed(7, 6, 'eye'),
      fixed(8, 6, 'iris'),
      ...nose,
      ...mouth,
    ];
  }
  return [...brows, ...eyes(face === 'down' ? 7 : 6, face === 'down'), ...nose, ...mouth];
}
