/**
 * Handstand branch, every node animated (PLAN 6.4b). Side view; the freestanding handstand is in
 * iconic.ts. The wall drill that faces away from the wall (back-to-wall handstand, straddle
 * eccentric) has the wall behind the back on the right. The ones that walk the feet up the wall
 * (wall plank, chest-to-wall) are authored facing right with the wall on the left and mirrored,
 * since a `wall` prop always stands on the right. The one-arm handstand is a front view (like the
 * archer pull-up): its free arm goes out to the side. Poses follow content/progressions/handstand.yaml.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';
import { FIGURE_GRID, type Limb, type Pose } from '@/lib/figure';

import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
/** The wall behind a back-to-wall handstand. */
const WALL_X = 21;
/** Before mirroring, the wall's face sits at this column on the left (cells left of it are wall). */
const LEFT_WALL = 8;
const BOX = { kind: 'box', x: 2, width: 8, height: 6 } as const;
const RING = p(18.6, 22);
const HAND = p(17, ON_FLOOR);

/** The same pose seen from the other side: x mirrored, angles reflected. */
function mirror(pose: Pose): Pose {
  const flip = (angle: number) => 180 - angle;
  const flipLimb = (limb: Limb): Limb => [flip(limb[0]), flip(limb[1])];
  return {
    ...pose,
    at: p(FIGURE_GRID - pose.at.x, pose.at.y),
    torso: flip(pose.torso),
    head: pose.head === undefined ? undefined : flip(pose.head),
    arms: [flipLimb(pose.arms[0]), flipLimb(pose.arms[1])],
    legs: [flipLimb(pose.legs[0]), flipLimb(pose.legs[1])],
  };
}

const MIRRORED_WALL = { kind: 'wall', x: FIGURE_GRID - LEFT_WALL } as const;

/** Push-up position with the feet up against the (left) wall, before mirroring. */
const FEET_ON_WALL_PLANK = figure({
  hip: p(LEFT_WALL + 11, 23),
  torso: -12,
  hands: [{ to: p(LEFT_WALL + 18, ON_FLOOR) }],
  feet: [{ to: p(LEFT_WALL + 1.5, 25) }],
  toes: 'point',
  pin: 'hand',
});

/** The wall plank's L: hands under the shoulders, legs level into the (left) wall. */
const WALL_L = figure({
  hip: p(LEFT_WALL + 11.3, 14.4),
  torso: 90,
  hands: [{ to: p(LEFT_WALL + 11.3, ON_FLOOR) }],
  feet: [{ to: p(LEFT_WALL + 1.3, 14.4) }],
  toes: 'point',
  pin: 'hand',
});

/** Chest to the (left) wall: stacked over the hands, toes touching the wall. */
function chestToWall(arms: { near?: Limb; far?: Limb } = {}): Pose {
  const hand = { to: p(LEFT_WALL + 3, ON_FLOOR) };
  return figure({
    hip: p(LEFT_WALL + 2.6, 14.4),
    torso: 88,
    hands: [arms.near ?? hand, arms.far ?? hand],
    feet: [{ to: p(LEFT_WALL + 1.3, 4.4) }],
    toes: 'point',
    pin: arms.near ? 'handFar' : 'hand',
  });
}

/** A hand tapping its shoulder in an upside-down stack: the elbow points away from the wall. */
const TAP: Limb = [40, -140];

/** Back-to-wall handstand: hands a little out from the wall, heels resting on it. */
const BACK_TO_WALL = figure({
  hip: p(18.6, 14.5),
  torso: 95,
  hands: [{ to: HAND }],
  feet: [{ to: p(WALL_X - 0.8, 4.6) }],
  toes: 'point',
  pin: 'hand',
});

/** Halfway up a kick to handstand: one leg swinging over, the other leaving the floor. */
const KICK_UP = figure({
  hip: p(15, 16),
  torso: 95,
  hands: [{ to: HAND }],
  feet: [{ to: p(9, 10) }, { to: p(10, ON_FLOOR) }],
});

/** Straddle legs as [near, far] limbs at `angle` (both straight), spread by `spread`° each way. */
function straddle(angle: number, spread = 12): readonly [Limb, Limb] {
  return [
    [angle - spread, angle - spread],
    [angle + spread, angle + spread],
  ];
}

/** Hips over the shoulders, straddled legs level: the middle of a press. */
function pressMiddle(hipX: number): Pose {
  const legs = straddle(180);
  return figure({
    hip: p(hipX, 14.6),
    torso: 88,
    hands: [{ to: HAND }],
    feet: [legs[0], legs[1]],
    toes: 'point',
    pin: 'hand',
  });
}

/** Folded straddle stand: feet down by the hands, hips high, shoulders leaning over the hands. */
const STRADDLE_STAND = figure({
  hip: p(14, 18.5),
  torso: 38,
  hands: [{ to: HAND }],
  feet: [{ to: p(11, 28.2) }, { to: p(13.5, 28.2) }],
  pin: 'hand',
});

/** A straddled handstand stack, legs closing above. */
function straddleHandstand(spread: number): Pose {
  const legs = straddle(-90, spread);
  return figure({
    hip: p(16.8, 14.4),
    torso: 90,
    hands: [{ to: HAND }],
    feet: [legs[0], legs[1]],
    toes: 'point',
    pin: 'hand',
  });
}

export const HANDSTAND_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  wall_plank: {
    props: [FLOOR, MIRRORED_WALL],
    still: 1,
    steps: 5,
    keyframes: [
      { hold: 1, pose: mirror(FEET_ON_WALL_PLANK) },
      { hold: 4, pose: mirror(WALL_L) },
    ],
  },
  wall_handstand: {
    props: [FLOOR, { kind: 'wall', x: WALL_X }],
    still: 2,
    keyframes: [
      {
        pose: figure({
          hip: p(10, 19.5),
          torso: -75,
          hands: [[-80, -80]],
          feet: [{ to: p(14, ON_FLOOR) }, { to: p(6, ON_FLOOR) }],
        }),
      },
      { pose: KICK_UP },
      { hold: 4, pose: BACK_TO_WALL },
      { pose: KICK_UP },
    ],
  },
  chest_to_wall_handstand: {
    props: [FLOOR, MIRRORED_WALL],
    still: 2,
    steps: 4,
    keyframes: [
      { pose: mirror(FEET_ON_WALL_PLANK) },
      { pose: mirror(WALL_L) },
      { hold: 4, pose: mirror(chestToWall()) },
    ],
  },
  chest_to_wall_shoulder_taps: {
    props: [FLOOR, MIRRORED_WALL],
    keyframes: [
      { pose: mirror(chestToWall()) },
      { hold: 1, pose: mirror(chestToWall({ near: TAP })) },
      { pose: mirror(chestToWall()) },
      { hold: 1, pose: mirror(chestToWall({ far: TAP })) },
    ],
  },
  frog_stand: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(12, 25),
          torso: -30,
          hands: [{ to: p(18.5, ON_FLOOR) }],
          feet: [{ to: p(14, ON_FLOOR) }],
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(14.2, 21.8),
          torso: 30,
          head: 20,
          hands: [{ to: HAND }],
          feet: [[58, 175]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  ring_shoulder_stand: {
    props: [FLOOR, { kind: 'rings', x: RING.x, y: RING.y }],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(15.6, 15),
          torso: 90,
          hands: [{ to: RING }],
          feet: [[0, 0]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(15.6, 15),
          torso: 90,
          hands: [{ to: RING }],
          feet: [[-90, -90]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  wall_straddle_press_eccentric: {
    props: [FLOOR, { kind: 'wall', x: WALL_X }],
    keyframes: [
      { hold: 2, steps: 5, pose: BACK_TO_WALL },
      { steps: 5, pose: pressMiddle(18) },
      { hold: 1, steps: 3, pose: STRADDLE_STAND },
    ],
  },
  straddle_press_to_handstand: {
    props: [FLOOR],
    still: 2,
    keyframes: [
      { hold: 1, steps: 5, pose: STRADDLE_STAND },
      { steps: 4, pose: pressMiddle(17.4) },
      { hold: 3, pose: straddleHandstand(6) },
    ],
  },
  elevated_straddle_press: {
    props: [FLOOR, BOX],
    still: 2,
    keyframes: [
      {
        hold: 1,
        steps: 5,
        pose: figure({
          hip: p(13.4, 16),
          torso: 52,
          hands: [{ to: HAND }],
          feet: [{ to: p(7, 23.4) }, { to: p(9, 23.4) }],
          pin: 'hand',
        }),
      },
      { steps: 4, pose: pressMiddle(17.4) },
      { hold: 3, pose: straddleHandstand(6) },
    ],
  },
  one_arm_handstand: {
    props: [FLOOR],
    still: 1,
    steps: 4,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(16, 15),
          torso: 90,
          hands: [{ to: p(12.4, ON_FLOOR) }, { to: p(19.6, ON_FLOOR) }],
          feet: [
            [-105, -105],
            [-75, -75],
          ],
          toes: 'point',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(16.8, 14.6),
          torso: 90,
          hands: [{ to: p(16.8, ON_FLOOR) }, [188, 172]],
          feet: [
            [-112, -112],
            [-68, -68],
          ],
          toes: 'point',
        }),
      },
    ],
  },
};
