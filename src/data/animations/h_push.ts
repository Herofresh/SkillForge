/**
 * Horizontal push branch, every node animated (PLAN 6.4b). Side view, facing right; the push-up
 * itself is in iconic.ts. Each variation keeps the push-up's plank and changes what tells it
 * apart: a wall or box under the hands, knees down, hands under the chest, rings, one arm with
 * the free hand behind the back, the far arm reaching out straight (archer) or the hands back by
 * the hips (pseudo planche). Poses follow the cues in content/progressions/h_push.yaml.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';
import type { Limb, Point, Pose } from '@/lib/figure';

import { figure, ON_FLOOR, p, type LimbSpec } from './pose';

const FLOOR = { kind: 'floor' } as const;
const RADIANS = Math.PI / 180;
const LEG = 10;
const THIGH = 5;
/** Ankle row of a plank on the toes (the flexed foot reaches the floor). */
const TOES_Y = 27.6;
/** Knee row when kneeling on the floor. */
const KNEE_Y = 28.6;
/** The free arm of a one-arm push-up, the hand resting on the lower back. */
const HAND_ON_BACK: Limb = [-160, 5];

function along(from: Point, angle: number, length: number): Point {
  return p(
    from.x + Math.cos(angle * RADIANS) * length,
    from.y + Math.sin(angle * RADIANS) * length,
  );
}

interface PlankOptions {
  /** Ankle (on the toes) the straight body rises from. */
  ankle: Point;
  /** Body angle: 0 flat, negative rising to the right (towards the head). */
  angle: number;
  hand: Point;
  handFar?: LimbSpec;
  /** Far foot when the feet are apart. */
  ankleFar?: Point;
  /** Bend at the hip, degrees (a piked straddle); 0 is a straight line. */
  pike?: number;
  head?: number;
}

/** A straight-body plank from the toes to the shoulders, the near hand at `hand`. */
function plank(options: PlankOptions): Pose {
  const { ankle, angle, hand } = options;
  const hip = along(ankle, angle, LEG);
  return figure({
    hip,
    torso: angle + (options.pike ?? 0),
    head: options.head,
    hands: [{ to: hand }, options.handFar],
    feet: [{ to: ankle }, options.ankleFar ? { to: options.ankleFar } : undefined],
    pin: 'hand',
  });
}

/** A plank from the knees: the shins lie back on the floor, feet a little raised. */
function kneePlank(knee: Point, angle: number, hand: Point): Pose {
  const hip = along(knee, angle, THIGH);
  return figure({
    hip,
    torso: angle,
    hands: [{ to: hand }],
    feet: [[angle + 180, 195]],
    toes: 'point',
    pin: 'hand',
  });
}

const WALL_X = 25;
const WALL_HAND = p(WALL_X - 0.6, 13.5);
const BOX = { x: 17, width: 8, height: 4 } as const;
const BOX_HAND = p(20.5, 30 - BOX.height - 0.6);
const RINGS = p(21, 22.5);
const HAND = p(21, ON_FLOOR);
/** Diamond: the hands sit together under the chest, further back than in a push-up. */
const DIAMOND_HAND = p(18.5, ON_FLOOR);
const ONE_ARM_BOX = { x: 17, width: 7, height: 3 } as const;
const ONE_ARM_BOX_HAND = p(20.5, 30 - ONE_ARM_BOX.height - 0.6);

export const H_PUSH_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  wall_push_up: {
    props: [FLOOR, { kind: 'wall', x: WALL_X }],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: along(p(10, ON_FLOOR), -66, LEG),
          torso: -66,
          hands: [{ to: WALL_HAND }],
          feet: [{ to: p(10, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
      {
        pose: figure({
          hip: along(p(10, ON_FLOOR), -54, LEG),
          torso: -54,
          head: -70,
          hands: [{ to: WALL_HAND }],
          feet: [{ to: p(10, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
    ],
  },
  incline_push_up: {
    props: [FLOOR, { kind: 'box', ...BOX }],
    keyframes: [
      { hold: 1, pose: plank({ ankle: p(5, TOES_Y), angle: -35, hand: BOX_HAND }) },
      { pose: plank({ ankle: p(5, TOES_Y), angle: -19, hand: BOX_HAND }) },
    ],
  },
  knee_push_up: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: kneePlank(p(9.5, KNEE_Y), -35, p(19.5, ON_FLOOR)) },
      { pose: kneePlank(p(9.5, KNEE_Y), -11, p(19.5, ON_FLOOR)) },
    ],
  },
  diamond_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: plank({ ankle: p(4.5, TOES_Y), angle: -23, hand: DIAMOND_HAND }),
      },
      {
        pose: plank({ ankle: p(4.5, TOES_Y), angle: -5, hand: DIAMOND_HAND, head: 5 }),
      },
    ],
  },
  ring_push_up: {
    props: [FLOOR, { kind: 'rings', ...RINGS }],
    keyframes: [
      { hold: 1, pose: plank({ ankle: p(4, TOES_Y - 0.4), angle: -31, hand: RINGS }) },
      { pose: plank({ ankle: p(4, TOES_Y - 0.4), angle: -12, hand: RINGS }) },
    ],
  },
  elevated_one_arm_push_up: {
    props: [FLOOR, { kind: 'box', ...ONE_ARM_BOX }],
    keyframes: [
      {
        hold: 1,
        pose: plank({
          ankle: p(4.5, TOES_Y),
          angle: -27,
          hand: ONE_ARM_BOX_HAND,
          handFar: HAND_ON_BACK,
        }),
      },
      {
        pose: plank({
          ankle: p(4.5, TOES_Y),
          angle: -14,
          hand: ONE_ARM_BOX_HAND,
          handFar: HAND_ON_BACK,
        }),
      },
    ],
  },
  archer_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: plank({
          ankle: p(3, TOES_Y),
          angle: -19,
          hand: p(27, ON_FLOOR),
          handFar: { to: p(19, ON_FLOOR) },
        }),
      },
      {
        pose: plank({
          ankle: p(3, TOES_Y),
          angle: -6,
          hand: p(27.5, ON_FLOOR),
          handFar: { to: p(19, ON_FLOOR) },
        }),
      },
    ],
  },
  straddle_one_arm_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: plank({
          ankle: p(4, TOES_Y),
          ankleFar: p(7.5, TOES_Y),
          angle: -22,
          pike: -6,
          hand: HAND,
          handFar: HAND_ON_BACK,
        }),
      },
      {
        pose: plank({
          ankle: p(4, TOES_Y),
          ankleFar: p(7.5, TOES_Y),
          angle: -10,
          pike: -4,
          hand: HAND,
          handFar: HAND_ON_BACK,
        }),
      },
    ],
  },
  pseudo_planche_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: plank({ ankle: p(5, TOES_Y), angle: -14, hand: p(16, ON_FLOOR) }),
      },
      {
        pose: plank({ ankle: p(6, TOES_Y), angle: -3, hand: p(16, ON_FLOOR), head: 8 }),
      },
    ],
  },
  one_arm_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: plank({ ankle: p(4.5, TOES_Y), angle: -20, hand: HAND, handFar: HAND_ON_BACK }),
      },
      {
        pose: plank({ ankle: p(4.5, TOES_Y), angle: -7, hand: HAND, handFar: HAND_ON_BACK }),
      },
    ],
  },
};
