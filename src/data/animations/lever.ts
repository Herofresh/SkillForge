/**
 * Lever leg shapes shared by the front lever, back lever and lever-row animations (PLAN 6.4b):
 * the same tuck → advanced tuck → one leg → straddle → half lay → full ladder, so neighbouring
 * progressions look different in the same way on every branch.
 *
 * Shapes are written for a front lever (body horizontal, face up, head to the left, so the chest
 * is the top side); a back lever is the same figure turned half a circle (face down, head right).
 */
import type { Limb } from '@/lib/figure';

export type LeverShape = 'tuck' | 'advancedTuck' | 'oneLeg' | 'straddle' | 'halfLay' | 'full';

/** Near leg, far leg as [thigh, shin] angles for a face-up lever with the hip right of the head. */
const FACE_UP_LEGS: Readonly<Record<LeverShape, readonly [Limb, Limb]>> = {
  /** Knees pulled to the chest, back rounded: a compact ball over the hip. */
  tuck: [
    [-128, 12],
    [-128, 12],
  ],
  /** Hips open to a right angle: thighs straight up, shins pointing back like a table. */
  advancedTuck: [
    [-90, 0],
    [-90, 0],
  ],
  /** The near leg straight out, the far one in the advanced tuck. */
  oneLeg: [
    [0, 0],
    [-90, 0],
  ],
  /** Straight legs spread wide: drawn as a V so the side view shows the straddle. */
  straddle: [
    [11, 11],
    [-11, -11],
  ],
  /** Hips open, legs together, knees bent so the shins hang down. */
  halfLay: [
    [0, 88],
    [0, 88],
  ],
  full: [
    [0, 0],
    [0, 0],
  ],
};

const HALF_TURN = 180;

function turn(limb: Limb, by: number): Limb {
  return [limb[0] + by, limb[1] + by];
}

/** Leg angles for a lever shape; `faceDown` turns them half a circle for a back lever. */
export function leverLegs(shape: LeverShape, faceDown = false): readonly [Limb, Limb] {
  const [near, far] = FACE_UP_LEGS[shape];
  if (!faceDown) return [near, far];
  return [turn(near, HALF_TURN), turn(far, HALF_TURN)];
}
