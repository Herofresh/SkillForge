/**
 * The companion's body (PLAN 6.10, ADR-059): an original chibi hero drawn as layered part grids,
 * in the spirit of SNES-era JRPG field sprites (a big head, a solid body in clothes, hands and
 * boots), seen from the front, on a 32 × 40 canvas. Parts only name materials and regions; the
 * shading and the selective outline come from `src/lib/sprite.ts`, and accessories recolour
 * regions (a chainmail torso, leather forearms) or draw their own parts on top.
 *
 * Frame anchors: every pose places the head box (14 × 13), the torso box (10 × 8), both arms and
 * the legs; accessories and weapons are placed from these anchors, so they follow every pose.
 */
import type { Legend, Point, SpritePart } from '@/lib/sprite';

export const SPRITE_WIDTH = 32;
export const SPRITE_HEIGHT = 40;

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
  C: { material: 'outfit', region: REGIONS.torso },
  c: { material: 'outfit', region: REGIONS.sleeve },
  T: { material: 'leather', region: REGIONS.belt },
  P: { material: 'pants', region: REGIONS.legs },
  B: { material: 'boots', region: REGIONS.boots },
  k: { fixed: 'eye' },
  w: { fixed: 'eyeShine' },
  m: { fixed: 'mouth' },
  q: { fixed: 'blush' },
};

/** Head and hair, no face (the face is drawn per mood). 14 × 13. */
export const HEAD: SpritePart = {
  rows: [
    '....HHHHHH....',
    '..HHHHHHHHHH..',
    '.HHHHHHHHHHHH.',
    '.HHHHHHHHHHHH.',
    'HHHHHHHHHHHHHH',
    'HHHHSHHHHHSHHH',
    'HHHSSSHHSSSSHH',
    'HHSSSSSSSSSSHH',
    'HHSSSSSSSSSSHH',
    'HHSSSSSSSSSSHH',
    '.HSSSSSSSSSSH.',
    '..SSSSSSSSSS..',
    '...SSSSSSSS...',
  ],
};

/** Torso with neck, belt and the tunic's hem. 10 × 8. */
export const TORSO: SpritePart = {
  rows: [
    '....SS....',
    '.CCCCCCCC.',
    'CCCCCCCCCC',
    'CCCCCCCCCC',
    'CCCCCCCCCC',
    '.CCCCCCCC.',
    '.TTTTTTTT.',
    '.CCCCCCCC.',
  ],
};

/** The left arm (screen left) hanging down; the right arm is its mirror image. 3 × 7. */
export const ARM_DOWN: SpritePart = {
  rows: ['.cc', 'ccc', 'ccc', 'ZZZ', 'ZZZ', 'YYY', '.YY'],
};

/** The left arm raised up and out (hand at the top left). 4 × 8. */
export const ARM_UP: SpritePart = {
  rows: ['YY..', 'YYY.', '.ZZ.', '.ZZ.', '.ZZZ', '..cc', '..cc', '..cc'],
};

/** The left arm held out to the side (a wave). 5 × 4. */
export const ARM_OUT: SpritePart = {
  rows: ['.YYcc', 'YYZcc', 'YZZcc', '.ZZ..'],
};

/** A fist, drawn again over a held weapon's grip. 2 × 2. */
export const FIST: SpritePart = { rows: ['YY', 'YY'] };

export const LEGS_STAND: SpritePart = {
  rows: ['.PPPPPPPP.', '.PPP..PPP.', '.PPP..PPP.', '.BBB..BBB.', '.BBB..BBB.', 'BBBB..BBBB'],
};

/** Mid-hop: knees up, feet tucked. */
export const LEGS_HOP: SpritePart = {
  rows: ['.PPPPPPPP.', '.PPP..PPP.', 'BBBB..BBBB', '.BBB..BBB.'],
};

/** Tapping the right foot. */
export const LEGS_TAP: SpritePart = {
  rows: ['.PPPPPPPP.', '.PPP..PPP.', '.PPP..PPP.', '.BBB..BBB.', '.BBB..BBBB', 'BBBB......'],
};

/** Sitting, knees up, boots in front. 12 × 4. */
export const LEGS_SIT: SpritePart = {
  rows: ['..PPPPPPPP..', '.PPPPPPPPPP.', 'BBBPP..PPBBB', 'BBBB....BBBB'],
};

export type ArmPose = 'down' | 'up' | 'out' | 'hug';
export type LegPose = 'stand' | 'hop' | 'tap' | 'sit';
export type Face = 'calm' | 'smile' | 'down' | 'left' | 'right';

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
}

/** The standing frame; the others move parts from it. */
export const STAND: BodyFrame = {
  head: { x: 9, y: 11 },
  torso: { x: 11, y: 23 },
  arms: ['down', 'down'],
  legs: 'stand',
  legsAt: { x: 11, y: 31 },
  face: 'calm',
};

/** Shifts the upper body (head, torso, arms) by `dy`, and optionally the legs too. */
export function shifted(frame: BodyFrame, dy: number, legsDy = 0): BodyFrame {
  return {
    ...frame,
    head: { x: frame.head.x, y: frame.head.y + dy },
    torso: { x: frame.torso.x, y: frame.torso.y + dy },
    legsAt: { x: frame.legsAt.x, y: frame.legsAt.y + legsDy },
  };
}

/** The top-left of an arm part and the centre of its hand, for side `-1` (left) or `1` (right). */
export function armPlacement(
  frame: BodyFrame,
  side: -1 | 1,
): { at: Point; hand: Point; part: SpritePart } {
  const pose = frame.arms[side === -1 ? 0 : 1];
  const shoulderY = frame.torso.y + 1;
  const left = side === -1;
  switch (pose) {
    case 'up': {
      const x = left ? frame.torso.x - 4 : frame.torso.x + 10;
      return {
        part: ARM_UP,
        at: { x, y: shoulderY - 7 },
        hand: { x: left ? x + 1 : x + 2, y: shoulderY - 6 },
      };
    }
    case 'out': {
      const x = left ? frame.torso.x - 6 : frame.torso.x + 11;
      return {
        part: ARM_OUT,
        at: { x, y: shoulderY + 1 },
        hand: { x: left ? x + 1 : x + 3, y: shoulderY + 2 },
      };
    }
    case 'hug': {
      const x = left ? frame.torso.x - 2 : frame.torso.x + 9;
      return { part: ARM_DOWN, at: { x, y: shoulderY + 1 }, hand: { x: x + 1, y: shoulderY + 7 } };
    }
    case 'down':
    default: {
      const x = left ? frame.torso.x - 4 : frame.torso.x + 11;
      return { part: ARM_DOWN, at: { x, y: shoulderY }, hand: { x: x + 1, y: shoulderY + 6 } };
    }
  }
}

export const LEG_PARTS: Readonly<Record<LegPose, SpritePart>> = {
  stand: LEGS_STAND,
  hop: LEGS_HOP,
  tap: LEGS_TAP,
  sit: LEGS_SIT,
};

/** The face per expression, as cells in the head box: eyes with a glint, a mouth, blush. */
export function faceCells(face: Face): { x: number; y: number; key: string }[] {
  const eye = (x: number, y: number) => [
    { x, y, key: 'eyeShine' },
    { x: x + 1, y, key: 'eye' },
    { x, y: y + 1, key: 'eye' },
    { x: x + 1, y: y + 1, key: 'eye' },
  ];
  const blush = [
    { x: 3, y: 10, key: 'blush' },
    { x: 10, y: 10, key: 'blush' },
  ];
  switch (face) {
    case 'smile':
      return [
        { x: 3, y: 9, key: 'eye' },
        { x: 4, y: 8, key: 'eye' },
        { x: 5, y: 9, key: 'eye' },
        { x: 8, y: 9, key: 'eye' },
        { x: 9, y: 8, key: 'eye' },
        { x: 10, y: 9, key: 'eye' },
        { x: 6, y: 11, key: 'mouth' },
        { x: 7, y: 11, key: 'mouth' },
        { x: 5, y: 10, key: 'mouth' },
        { x: 8, y: 10, key: 'mouth' },
        ...blush,
      ];
    case 'down':
      return [
        { x: 4, y: 9, key: 'eye' },
        { x: 5, y: 9, key: 'eye' },
        { x: 8, y: 9, key: 'eye' },
        { x: 9, y: 9, key: 'eye' },
        { x: 3, y: 8, key: 'eye' },
        { x: 10, y: 8, key: 'eye' },
        { x: 6, y: 11, key: 'mouth' },
        { x: 7, y: 11, key: 'mouth' },
      ];
    case 'left':
      return [...eye(3, 8), ...eye(7, 8), { x: 6, y: 11, key: 'mouth' }];
    case 'right':
      return [...eye(5, 8), ...eye(9, 8), { x: 7, y: 11, key: 'mouth' }];
    case 'calm':
    default:
      return [
        ...eye(4, 8),
        ...eye(8, 8),
        { x: 6, y: 11, key: 'mouth' },
        { x: 7, y: 11, key: 'mouth' },
        ...blush,
      ];
  }
}
