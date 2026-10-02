/**
 * Horizontal pull branch, every node animated (PLAN 6.4b). Side view: the body pivots on the
 * heels and the chest comes up to the hands. Rows get steeper as they get easier (band row
 * standing, incline row slanted, horizontal row flat); the one-arm rows free one arm, the archer
 * row holds a second ring out on a straight arm, and the lever rows reuse the front lever
 * shapes. A straddle is drawn as a V of the legs, as on the lever branches. Poses follow the cues
 * in content/progressions/h_pull.yaml.
 */
import type { Limb, Point, Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { frontLever, LEVER_BAR } from './front_lever';
import type { LeverShape } from './lever';
import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
const TORSO = 7;
const LEGS = 10;
const RADIANS = Math.PI / 180;

interface RowOptions {
  /** Where the heels rest on the floor (the pivot). */
  heel: Point;
  /** Body angle from the floor, degrees (the torso and legs in one line). */
  angle: number;
  hand: Point;
  /** The other arm: on the same grip (default), free, or on its own grip. */
  other?: Limb | { to: Point; bend?: 1 | -1 };
  /** Legs: together (default) or spread into a V. */
  straddle?: boolean;
}

/**
 * A straight body pivoting on the heels, hands on the grip. Face up with the head to the left
 * (as in the front lever), so the heels are on the right and the toes point up.
 */
function row(options: RowOptions): Pose {
  const { heel, angle } = options;
  const dx = Math.cos(angle * RADIANS);
  const dy = Math.sin(angle * RADIANS);
  const hip = p(heel.x - dx * LEGS, heel.y - dy * LEGS);
  const hand = { to: options.hand };
  const legs: Limb = [angle, angle];
  const spread = 8;
  return figure({
    hip,
    torso: angle - 180,
    hands: [hand, options.other ?? hand],
    feet: options.straddle
      ? [
          [legs[0] - spread, legs[1] - spread],
          [legs[0] + spread, legs[1] + spread],
        ]
      : [legs],
    toes: 'flex',
    pin: 'hand',
  });
}

/**
 * The body angle at the top of a row: the shoulders come as close to the grip as a straight body
 * pivoting on the heels allows (on the line from the heels to the grip).
 */
function topAngle(heel: Point, grip: Point): number {
  return (Math.atan2(heel.y - grip.y, heel.x - grip.x) * 180) / Math.PI;
}

/** A two-keyframe row: straight arms, then the chest up to the hands. */
function rowAnimation(
  props: FigureAnimation['props'],
  bottom: RowOptions,
  top: Partial<RowOptions>,
): FigureAnimation {
  return {
    props,
    keyframes: [
      { hold: 1, pose: row(bottom) },
      { hold: 1, pose: row({ ...bottom, ...top }) },
    ],
  };
}

/** Where the shoulders are for a straight body at `angle` pivoting on `heel`. */
function shoulderOf(heel: Point, angle: number): Point {
  const reach = LEGS + TORSO;
  return p(heel.x - Math.cos(angle * RADIANS) * reach, heel.y - Math.sin(angle * RADIANS) * reach);
}

/** Incline row on rings: steep body, rings above the chest. */
const INCLINE_HEEL = p(26, ON_FLOOR - 0.6);
const INCLINE_ANGLE = 36;
const INCLINE_RING = (() => {
  const shoulder = shoulderOf(INCLINE_HEEL, INCLINE_ANGLE);
  return p(shoulder.x + 1.3, shoulder.y - 7.45);
})();

/** Horizontal row on low rings: body nearly flat. */
const ROW_HEEL = p(29, ON_FLOOR - 0.6);
const ROW_RING = (() => {
  const shoulder = shoulderOf(ROW_HEEL, 12);
  return p(shoulder.x - 0.9, shoulder.y - 7.5);
})();

/** The wide row's bar sits where the rings are; its rig stands behind the head. */
const WIDE_BAR = ROW_RING;
const WIDE_BAR_PROP = { kind: 'bar', x: WIDE_BAR.x, y: WIDE_BAR.y } as const;

/** The archer row's straight-arm ring, further out towards the head. */
const ARCHER_OUT_RING = p(ROW_RING.x - 6.2, ROW_RING.y + 1.6);

/** The free arm of a one-arm row, reaching out to the side (drawn up and forward). */
const FREE_ARM: Limb = [-72, -72];

const RINGS = (ring: Point) => ({ kind: 'rings', x: ring.x, y: ring.y }) as const;

/** Lever rows: from the straight-arm lever, the lower chest comes up to the bar. */
function leverRow(shape: LeverShape): FigureAnimation {
  return {
    props: [FLOOR, { kind: 'bar', x: LEVER_BAR.x, y: LEVER_BAR.y }],
    keyframes: [
      { hold: 1, pose: frontLever(shape) },
      {
        hold: 1,
        pose: frontLever(shape, { shoulder: p(LEVER_BAR.x - 2.6, LEVER_BAR.y + 3.4) }),
      },
    ],
  };
}

/** The band row's door, anchor height and band. */
const DOOR_X = 28;
const BAND_Y = 14;
const BAND = { kind: 'rail', x: 16, y: BAND_Y, width: DOOR_X - 16 } as const;

function standingRow(hand: Point): Pose {
  return figure({
    hip: p(14.4, 19.2),
    torso: -96,
    hands: [{ to: hand }],
    feet: [{ to: p(15.6, ON_FLOOR) }, { to: p(12.4, ON_FLOOR) }],
    pin: 'ankle',
  });
}

export const H_PULL_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  band_row: {
    props: [FLOOR, { kind: 'wall', x: DOOR_X }, BAND],
    keyframes: [
      { hold: 1, pose: standingRow(p(21.2, BAND_Y - 0.5)) },
      { hold: 1, pose: standingRow(p(16.6, BAND_Y)) },
    ],
  },
  incline_row: rowAnimation(
    [FLOOR, RINGS(INCLINE_RING)],
    { heel: INCLINE_HEEL, angle: INCLINE_ANGLE, hand: INCLINE_RING },
    { angle: topAngle(INCLINE_HEEL, INCLINE_RING) },
  ),
  horizontal_row: rowAnimation(
    [FLOOR, RINGS(ROW_RING)],
    { heel: ROW_HEEL, angle: 12, hand: ROW_RING },
    { angle: topAngle(ROW_HEEL, ROW_RING) },
  ),
  wide_row: rowAnimation(
    [FLOOR, WIDE_BAR_PROP],
    { heel: ROW_HEEL, angle: 12, hand: WIDE_BAR },
    // Elbows out: at the top the upper arm points down to the floor, not back.
    { angle: topAngle(ROW_HEEL, WIDE_BAR) - 2 },
  ),
  archer_row: rowAnimation(
    [FLOOR, RINGS(ROW_RING), RINGS(ARCHER_OUT_RING)],
    {
      heel: ROW_HEEL,
      angle: 12,
      hand: ROW_RING,
      other: { to: ARCHER_OUT_RING, bend: -1 },
    },
    {
      angle: topAngle(ROW_HEEL, ROW_RING) - 6,
      other: { to: ARCHER_OUT_RING, bend: -1 },
    },
  ),
  tuck_front_lever_row: leverRow('tuck'),
  advanced_tuck_front_lever_row: leverRow('advancedTuck'),
  straddle_one_arm_row: rowAnimation(
    [FLOOR, RINGS(ROW_RING)],
    { heel: ROW_HEEL, angle: 12, hand: ROW_RING, other: FREE_ARM, straddle: true },
    { angle: topAngle(ROW_HEEL, ROW_RING) },
  ),
  one_arm_row: rowAnimation(
    [FLOOR, RINGS(ROW_RING)],
    { heel: ROW_HEEL, angle: 12, hand: ROW_RING, other: FREE_ARM },
    { angle: topAngle(ROW_HEEL, ROW_RING) },
  ),
  straddle_front_lever_row: leverRow('straddle'),
};
