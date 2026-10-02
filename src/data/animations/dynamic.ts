/**
 * Dynamic branch, every node animated (PLAN 6.4b): kip swing and muscle-ups on a bar seen end-on,
 * the ring muscle-up on rings, the elbow lever on the floor and the human flags on a pole (a front
 * view: the body sideways off the pole, legs drawn in the picture plane so tuck, advanced tuck,
 * straddle and full differ). Poses follow the cues in content/progressions/dynamic.yaml.
 *
 * A muscle-up spans a hang and a support above the bar, more than the 32-cell frame holds, so the
 * muscle-ups start at the pull (a kip or a high pull) instead of a dead hang.
 */
import type { Limb, Point, Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { leverLegs, type LeverShape } from './lever';
import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
const TORSO = 7;

/** The kip swing's bar: high enough for a straight-arm hang. */
const SWING_BAR = p(16, 3.6);
const SWING_BAR_PROP = { kind: 'bar', x: SWING_BAR.x, y: SWING_BAR.y } as const;

/** The muscle-up bar: low enough that the support on top keeps the head in the frame. */
const MU_BAR = p(14, 12.8);
const MU_BAR_PROP = { kind: 'bar', x: MU_BAR.x, y: MU_BAR.y } as const;
const MU_RING = p(15, 12.8);
const MU_RINGS = { kind: 'rings', x: MU_RING.x, y: MU_RING.y } as const;

/** Straight-arm support on top: hips at the bar, shoulders leaning a little over it. */
function support(grip: Point): Pose {
  return figure({
    hip: p(grip.x - 1.4, grip.y - 0.6),
    torso: -74,
    head: -40,
    hands: [{ to: grip }],
    feet: [[96, 96]],
    toes: 'point',
    pin: 'hand',
  });
}

/** The turnover: chest over the bar, elbows bent behind, hips below and behind. */
function turnover(grip: Point, deep = false): Pose {
  const shoulder = p(grip.x + 2, grip.y + (deep ? 1 : -1.5));
  const torso = deep ? -62 : -50;
  const radians = (torso * Math.PI) / 180;
  return figure({
    hip: p(shoulder.x - Math.cos(radians) * TORSO, shoulder.y - Math.sin(radians) * TORSO),
    torso,
    head: torso + 15,
    hands: [{ to: grip }],
    // Knees bend in the deep ring dip so the feet stay off the floor.
    feet: deep ? [[28, 118]] : [[100, 100]],
    toes: 'point',
    pin: 'hand',
  });
}

/** A high pull: chest to the bar, elbows down, body nearly upright, legs a little forward. */
function highPull(grip: Point, legs = 60): Pose {
  return figure({
    hip: p(grip.x - 0.6, grip.y + 7.6),
    torso: -96,
    hands: [{ to: grip }],
    feet: [[legs, legs]],
    toes: 'point',
    pin: 'hand',
  });
}

/** The pole of the human flags. */
const POLE_X = 4;
const POLE = { kind: 'pole', x: POLE_X } as const;
const FLAG_HANDS = [p(POLE_X + 1.6, 11.2), p(POLE_X + 1.6, 19.8)] as const;
const FLAG_SHOULDER = p(POLE_X + 7.6, 15.5);

/** Flag legs: the lever shapes mirrored so bent knees hang below the body. */
function flagLegs(shape: LeverShape): readonly [Limb, Limb] {
  const [near, far] = leverLegs(shape);
  const mirror = (limb: Limb): Limb => [-limb[0], -limb[1]];
  return [mirror(near), mirror(far)];
}

/** A human flag hold: both arms locked on the pole, body sideways and level. */
function flag(shape: LeverShape, tilt = 0): Pose {
  const radians = ((180 + tilt) * Math.PI) / 180;
  const tilted = (limb: Limb): Limb => [limb[0] + tilt, limb[1] + tilt];
  const [near, far] = flagLegs(shape);
  return figure({
    hip: p(
      FLAG_SHOULDER.x - Math.cos(radians) * TORSO,
      FLAG_SHOULDER.y - Math.sin(radians) * TORSO,
    ),
    torso: 180 + tilt,
    head: 168 + tilt,
    hands: [
      // The pushing (bottom) arm in front, the pulling (top) arm behind the head.
      { to: FLAG_HANDS[1], bend: 1 },
      { to: FLAG_HANDS[0], bend: -1 },
    ],
    feet: [tilted(near), tilted(far)],
    toes: 'point',
  });
}

function flagHold(shape: LeverShape): FigureAnimation {
  return {
    props: [FLOOR, POLE],
    still: 1,
    steps: 4,
    keyframes: [
      // Legs swing up from hanging off the pole at an angle.
      { pose: flag(shape, 38) },
      { hold: 4, pose: flag(shape) },
    ],
  };
}

const ELBOW_LEVER_HAND = p(16, ON_FLOOR);

export const DYNAMIC_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  kipping_swing: {
    props: [FLOOR, SWING_BAR_PROP],
    steps: 4,
    keyframes: [
      {
        // Arch: chest pushed through in front of the bar, legs behind.
        hold: 1,
        pose: figure({
          hip: p(SWING_BAR.x + 2.8, SWING_BAR.y + 14),
          torso: -102,
          hands: [{ to: SWING_BAR }],
          feet: [[122, 128]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        // Hollow: chest back behind the bar, legs swung in front.
        hold: 1,
        pose: figure({
          hip: p(SWING_BAR.x - 2.2, SWING_BAR.y + 14),
          torso: -74,
          hands: [{ to: SWING_BAR }],
          feet: [[52, 52]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  muscle_up_negative: {
    props: [FLOOR, MU_BAR_PROP],
    keyframes: [
      { hold: 2, steps: 5, pose: support(MU_BAR) },
      { steps: 6, pose: turnover(MU_BAR) },
      { hold: 1, steps: 2, pose: highPull(MU_BAR) },
    ],
  },
  kipping_muscle_up: {
    props: [FLOOR, MU_BAR_PROP],
    keyframes: [
      {
        // Hollow kip under the bar, arms straight, legs swung up in front.
        hold: 1,
        pose: figure({
          hip: p(MU_BAR.x + 2.3, MU_BAR.y + 11.7),
          torso: -150,
          hands: [{ to: MU_BAR }],
          feet: [[18, 18]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        // The bar pulled to the hips: body leaning back, legs still in front.
        steps: 2,
        pose: figure({
          hip: p(MU_BAR.x + 1.5, MU_BAR.y + 7.2),
          torso: -125,
          hands: [{ to: MU_BAR }],
          feet: [[35, 40]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      { steps: 2, pose: turnover(MU_BAR) },
      { hold: 2, steps: 3, pose: support(MU_BAR) },
    ],
  },
  ring_muscle_up: {
    props: [FLOOR, MU_RINGS],
    keyframes: [
      { hold: 1, pose: highPull(MU_RING, 42) },
      { pose: turnover(MU_RING, true) },
      { hold: 2, pose: support(MU_RING) },
    ],
  },
  elbow_lever: {
    props: [FLOOR],
    still: 1,
    steps: 4,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(12, 25.2),
          torso: -14,
          hands: [{ to: ELBOW_LEVER_HAND }],
          feet: [{ to: p(2.6, 28.4) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(12, 22.8),
          torso: 0,
          hands: [{ to: ELBOW_LEVER_HAND }],
          feet: [[180, 180]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  tuck_human_flag: flagHold('tuck'),
  advanced_tuck_human_flag: flagHold('advancedTuck'),
  straddle_human_flag: flagHold('straddle'),
  human_flag: flagHold('full'),
  strict_bar_muscle_up: {
    props: [FLOOR, MU_BAR_PROP],
    keyframes: [
      { hold: 1, steps: 4, pose: highPull(MU_BAR) },
      { steps: 2, pose: turnover(MU_BAR) },
      { hold: 2, steps: 4, pose: support(MU_BAR) },
    ],
  },
};
