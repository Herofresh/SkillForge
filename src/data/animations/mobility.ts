/**
 * Mobility branch, every node animated (PLAN 6.4b-3). Drills show the movement itself, slowly.
 * Side view, except where the movement is sideways: wall angel, 90/90 switch and cossack squat
 * face the viewer, and the open book is seen from above (lying on the side on a mat). Poses
 * follow the cues in content/progressions/mobility.yaml.
 */
import type { Limb, Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { allFours } from './flexibility';
import { armVia, legVia, shouldersOf } from './floorPoses';
import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
const SEAT_Y = 28.3;
const STAND_HIP = p(15, 19.2);
const STAND_FOOT = p(15.5, ON_FLOOR);

/** Standing tall (side view) with the given arms. */
function standing(arms: readonly [Limb, Limb], legs?: readonly [Limb, Limb]): Pose {
  return figure({
    hip: STAND_HIP,
    torso: -90,
    hands: arms,
    feet: legs ?? [{ to: STAND_FOOT }],
    pin: legs ? 'ankleFar' : 'ankle',
  });
}

/** Squatting with the ankles at {@link STAND_FOOT}. */
function squat(hip: [number, number], torso: number, arms: Limb): Pose {
  return figure({
    hip: p(...hip),
    torso,
    head: Math.max(torso, -80),
    hands: [arms],
    feet: [{ to: STAND_FOOT }],
    pin: 'ankle',
  });
}

/** Front view, standing on two feet a little apart. */
function frontStanding(arms: readonly [Limb, Limb]): Pose {
  return figure({
    hip: p(16, 19.6),
    torso: -90,
    hands: arms,
    feet: [{ to: p(18, ON_FLOOR), bend: 1 }, { to: p(14, ON_FLOOR) }],
    pin: 'ankle',
  });
}

const FRONT_SEAT = p(16, SEAT_Y);
/** Front view, seated: hands together in front of the chest, elbows out. */
const CHEST_HANDS = (() => {
  const shoulders = shouldersOf(FRONT_SEAT, -90);
  const hands = p(16, shoulders.y + 3.4);
  return [
    armVia(shoulders, p(19.4, shoulders.y + 3), hands),
    armVia(shoulders, p(12.6, shoulders.y + 3), hands),
  ] as const;
})();
/** The 90/90 seat sits a little higher, as on a cushion, so the folded feet stay above the floor. */
const NINETY_SEAT = p(16, 26.8);
const NINETY_FEET = [p(20.6, ON_FLOOR), p(11.4, ON_FLOOR)] as const;

/** Front view, 90/90 seat: both knees tipped to one side (`side` 1 right, -1 left) or up (0). */
function ninetyNinety(side: -1 | 0 | 1): Pose {
  const hip = NINETY_SEAT;
  const [nearFoot, farFoot] = NINETY_FEET;
  const legs: readonly [Limb, Limb] =
    side === 0
      ? [legVia(hip, p(19.4, 23.8), nearFoot), legVia(hip, p(12.6, 23.8), farFoot)]
      : side === 1
        ? [legVia(hip, p(20.9, 27.4), p(16.4, 28.4)), legVia(hip, p(18.6, 24), p(23, 28.6))]
        : [legVia(hip, p(13.4, 24), p(9, 28.6)), legVia(hip, p(11.1, 27.4), p(15.6, 28.4))];
  return figure({
    hip,
    torso: -90 + side * 4,
    hands: CHEST_HANDS,
    feet: legs,
  });
}

/** Front view, cossack squat: sunk over one foot (`side` 1 right, -1 left), or standing wide (0). */
function cossack(side: -1 | 0 | 1): Pose {
  const hip = side === 0 ? p(16, 21.4) : p(16 + side * 3.2, 25.6);
  const shoulders = shouldersOf(hip, -90);
  const hands = p(hip.x, shoulders.y + 4.2);
  return figure({
    hip,
    torso: -90,
    hands: [
      armVia(shoulders, p(hip.x + 3, shoulders.y + 3), hands),
      armVia(shoulders, p(hip.x - 3, shoulders.y + 3), hands),
    ],
    feet: [
      { to: p(23.4, ON_FLOOR), bend: side === 1 ? -1 : 1 },
      { to: p(8.6, ON_FLOOR), bend: side === -1 ? 1 : -1 },
    ],
    toes: 'flex',
  });
}

/** Seen from above: lying on the side on a mat, knees bent, the top arm at `arm` degrees. */
function openBook(arm: number): Pose {
  return figure({
    hip: p(20, 17),
    torso: 180,
    head: 180,
    hands: [
      [arm, arm],
      [92, 92],
    ],
    feet: [[82, 2]],
    toes: 'point',
  });
}

/** Overhead and deep squats share the standing start. */
const STAND_ARMS_DOWN = standing([
  [95, 85],
  [95, 85],
]);

export const MOBILITY_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  cat_cow: {
    props: [FLOOR],
    steps: 5,
    keyframes: [
      { hold: 2, pose: allFours(4, { torso: -20, head: 72 }) },
      { hold: 2, pose: allFours(-4, { torso: -3, head: -42 }) },
    ],
  },
  ankle_rocks: (() => {
    const pose = (hip: [number, number], torso: number) =>
      figure({
        hip: p(...hip),
        torso,
        hands: [{ to: p(23, 15.5) }],
        feet: [{ to: p(20, ON_FLOOR) }, { to: p(8.5, ON_FLOOR) }],
        pin: 'ankle',
      });
    return {
      props: [FLOOR, { kind: 'wall', x: 24 }],
      steps: 4,
      keyframes: [
        { hold: 1, pose: pose([14.2, 20.8], -84) },
        { hold: 1, pose: pose([16.6, 22.6], -80) },
      ],
    };
  })(),
  hip_cars: (() => {
    const arms: readonly [Limb, Limb] = [
      [60, 20],
      [70, 30],
    ];
    const pose = (leg: Limb) => standing(arms, [leg, [90, 90]]);
    return {
      props: [FLOOR],
      steps: 4,
      keyframes: [
        { hold: 1, pose: pose([-8, 85]) },
        { pose: pose([42, -15]) },
        { hold: 1, pose: pose([122, 175]) },
        { pose: pose([96, 150]) },
      ],
    };
  })(),
  shoulder_cars: (() => {
    const pose = (arm: number) =>
      standing([
        [arm, arm],
        [95, 88],
      ]);
    return {
      props: [FLOOR],
      steps: 4,
      keyframes: [
        { pose: pose(92) },
        { pose: pose(0) },
        { hold: 1, pose: pose(-90) },
        { pose: pose(180) },
      ],
    };
  })(),
  open_book: {
    props: [],
    steps: 4,
    still: 2,
    keyframes: [
      { hold: 1, pose: openBook(90) },
      { pose: openBook(180) },
      { hold: 3, pose: openBook(-90) },
      { pose: openBook(180) },
    ],
  },
  wall_angel: (() => {
    const shoulders = shouldersOf(p(16, 19.6), -90);
    const goalPost = frontStanding([
      armVia(
        shoulders,
        p(shoulders.x + 3.6, shoulders.y + 1.8),
        p(shoulders.x + 4.2, shoulders.y - 2),
      ),
      armVia(
        shoulders,
        p(shoulders.x - 3.6, shoulders.y + 1.8),
        p(shoulders.x - 4.2, shoulders.y - 2),
      ),
    ]);
    const overhead = frontStanding([
      [-50, -56],
      [-130, -124],
    ]);
    return {
      props: [FLOOR],
      steps: 5,
      keyframes: [
        { hold: 1, pose: goalPost },
        { hold: 1, pose: overhead },
      ],
    };
  })(),
  hip_90_90_switch: {
    props: [FLOOR],
    steps: 4,
    keyframes: [
      { hold: 2, pose: ninetyNinety(-1) },
      { pose: ninetyNinety(0) },
      { hold: 2, pose: ninetyNinety(1) },
      { pose: ninetyNinety(0) },
    ],
  },
  deep_squat_hold: {
    props: [FLOOR],
    steps: 5,
    still: 1,
    keyframes: [
      { hold: 1, pose: STAND_ARMS_DOWN },
      { hold: 5, pose: squat([12.4, 26.6], -68, [8, 2]) },
    ],
  },
  cossack_squat: {
    props: [FLOOR],
    steps: 5,
    keyframes: [
      { pose: cossack(0) },
      { hold: 2, pose: cossack(-1) },
      { pose: cossack(0) },
      { hold: 2, pose: cossack(1) },
    ],
  },
  three_point_bridge: {
    props: [FLOOR],
    steps: 5,
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(15, SEAT_Y),
          torso: -122,
          hands: [{ to: p(9, ON_FLOOR) }],
          feet: [{ to: p(22, ON_FLOOR) }],
        }),
      },
      {
        hold: 3,
        pose: figure({
          hip: p(18.4, 20.6),
          torso: 160,
          head: 140,
          hands: [[192, 196], { to: p(10.6, ON_FLOOR) }],
          feet: [{ to: p(23.2, ON_FLOOR) }, { to: p(25, ON_FLOOR) }],
        }),
      },
    ],
  },
  overhead_squat: {
    props: [FLOOR],
    steps: 4,
    keyframes: [
      {
        hold: 1,
        pose: standing([
          [-96, -96],
          [-100, -100],
        ]),
      },
      {
        hold: 1,
        pose: squat([12, 25.6], -66, [-100, -100]),
      },
    ],
  },
};
