/**
 * Planche branch, every node animated (PLAN 6.4b). Side view, facing right; the full planche is
 * in iconic.ts. Every hold leans the straight arms forward with the hands under the hips, and the
 * legs tell the stages apart: knees pulled to the chest (tuck), thighs down and shins back with a
 * flat back (advanced tuck), straight legs in a V (straddle), knees bent behind a level body
 * (half lay). The push-ups bend the arms in that shape. Poses follow content/progressions/planche.yaml.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';
import type { Limb, Point, Pose } from '@/lib/figure';

import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
const RADIANS = Math.PI / 180;
const HAND = p(18, ON_FLOOR);
const LEAN_HAND = p(20, ON_FLOOR);
const TORSO = 7;
/** Ankle row of a plank on the toes. */
const TOES_Y = 27.6;
/** Shoulders of a straight-arm planche: forward of the hands. */
const SHOULDERS = p(21, 22.2);
/** Shoulders at the bottom of a planche push-up: lower, further forward. */
const SHOULDERS_LOW = p(22.4, 25.2);

/** Leg shapes as [thigh, shin] angles, the body facing right. */
const TUCK: Limb = [35, 175];
const ADVANCED_TUCK: Limb = [95, 180];
const HALF_LAY: Limb = [180, 115];
const STRADDLE_NEAR: Limb = [172, 172];
const STRADDLE_FAR: Limb = [190, 190];

interface HoldOptions {
  shoulders?: Point;
  /** Torso angle hip → shoulders (0 level, positive when the hips sit higher). */
  torso: number;
  legs: Limb;
  legsFar?: Limb;
  head?: number;
}

/** A planche-type hold: straight (or bent, for a push-up) arms to the hands, legs as given. */
function hold(options: HoldOptions): Pose {
  const shoulders = options.shoulders ?? SHOULDERS;
  const hip = p(
    shoulders.x - Math.cos(options.torso * RADIANS) * TORSO,
    shoulders.y - Math.sin(options.torso * RADIANS) * TORSO,
  );
  return figure({
    hip,
    torso: options.torso,
    head: options.head ?? options.torso + 10,
    hands: [{ to: HAND }],
    feet: [options.legs, options.legsFar ?? options.legs],
    toes: 'point',
    pin: 'hand',
  });
}

/** Squatting on the toes behind the hands, hips below the shoulders: the moment before the lift. */
const TUCK_ON_TOES = figure({
  hip: p(12.8, 23.4),
  torso: -15,
  hands: [{ to: HAND }],
  feet: [{ to: p(11, 28.4) }],
  toes: 'point',
  pin: 'hand',
});

const TUCK_HOLD = hold({ torso: 8, legs: TUCK });
const ADVANCED_TUCK_HOLD = hold({ torso: 0, legs: ADVANCED_TUCK });
const STRADDLE_HOLD = hold({ torso: 0, legs: STRADDLE_NEAR, legsFar: STRADDLE_FAR });

export const PLANCHE_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  planche_lean: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(12.3, 24.1),
          torso: -18,
          hands: [{ to: LEAN_HAND }],
          feet: [{ to: p(2.8, TOES_Y) }],
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(15.8, 24.4),
          torso: -9,
          head: 0,
          hands: [{ to: LEAN_HAND }],
          feet: [{ to: p(5.9, TOES_Y) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  straight_arm_frog_stand: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      { hold: 1, pose: TUCK_ON_TOES },
      {
        hold: 4,
        pose: figure({
          hip: p(12.4, 19.2),
          torso: 20,
          hands: [{ to: HAND }],
          feet: [[43, 160]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  tuck_planche: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      { hold: 1, pose: TUCK_ON_TOES },
      { hold: 4, pose: TUCK_HOLD },
    ],
  },
  advanced_tuck_planche: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      { hold: 1, pose: TUCK_ON_TOES },
      { hold: 4, pose: ADVANCED_TUCK_HOLD },
    ],
  },
  tuck_planche_push_up: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: TUCK_HOLD },
      { pose: hold({ shoulders: SHOULDERS_LOW, torso: 8, legs: TUCK }) },
    ],
  },
  straddle_planche: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      { hold: 1, pose: ADVANCED_TUCK_HOLD },
      { hold: 4, pose: STRADDLE_HOLD },
    ],
  },
  advanced_tuck_planche_push_up: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: ADVANCED_TUCK_HOLD },
      { pose: hold({ shoulders: SHOULDERS_LOW, torso: 6, legs: ADVANCED_TUCK }) },
    ],
  },
  half_lay_planche: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      { hold: 1, pose: ADVANCED_TUCK_HOLD },
      { hold: 4, pose: hold({ torso: 0, legs: HALF_LAY }) },
    ],
  },
  straddle_planche_push_up: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: STRADDLE_HOLD },
      {
        pose: hold({
          shoulders: SHOULDERS_LOW,
          torso: 0,
          legs: STRADDLE_NEAR,
          legsFar: STRADDLE_FAR,
        }),
      },
    ],
  },
};
