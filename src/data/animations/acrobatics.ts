/**
 * Acrobatics branch, every node animated (PLAN 6.4b-3). Rolls and falls are side views; the
 * cartwheel family turns in the picture plane, so it faces the viewer (front view) and travels
 * left to right. Angles interpolate the short way, so every turn is split into moves of less than
 * 180°; a move with `steps: 1` cuts straight back to the start, so a roll can travel across the
 * frame and begin again. Poses follow the cues in content/progressions/acrobatics.yaml.
 */
import type { Limb, Pose } from '@/lib/figure';
import type { FigureAnimation, Keyframe } from '@/lib/figureAnimation';

import { resting, turned } from './floorPoses';
import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
/** The last move of a travelling skill: jump straight back to the first keyframe. */
const CUT = 1;

/** A shape around the hip at the origin; place it with `resting` or a hip position. */
function shape(spec: {
  torso: number;
  head?: number;
  arms: readonly [Limb, Limb?];
  legs: readonly [Limb, Limb?];
  toes?: 'flex' | 'point';
}): Pose {
  const [arm, armFar = arm] = spec.arms;
  const [leg, legFar = leg] = spec.legs;
  return {
    at: p(0, 0),
    torso: spec.torso,
    head: spec.head,
    arms: [arm, armFar],
    legs: [leg, legFar],
    feet: spec.toes,
  };
}

/** A tight ball: knees to the chest, chin tucked, hands on the shins. */
const TUCK = shape({ torso: -62, head: -28, arms: [[-5, 75]], legs: [[-30, 112]], toes: 'point' });
/** The tuck with the hands by the ears, palms up ("pizza hands") for the backward roll. */
const PIZZA_TUCK = shape({
  torso: -62,
  head: -28,
  arms: [[-20, -150]],
  legs: [[-30, 112]],
  toes: 'point',
});

/** A tuck turned by `delta` and set down on the floor with its hip at column `x`. */
function rolled(base: Pose, delta: number, x: number, lift = 0): Pose {
  const pose = resting(turned(base, delta), x);
  return { ...pose, at: p(pose.at.x, pose.at.y - lift) };
}

/** Squatting on the feet in a ball (ankles at `x`). */
function squatBall(x: number, arms: Limb): Pose {
  return figure({
    hip: p(x - 3, 25.6),
    torso: -62,
    head: -40,
    hands: [arms],
    feet: [{ to: p(x, ON_FLOOR) }],
  });
}

/** Standing (side view) with the ankles at `x`. */
function stand(x: number, arms: readonly [Limb, Limb?], torso = -90): Pose {
  return figure({
    hip: p(x - 0.5, 19.2),
    torso,
    hands: arms,
    feet: [{ to: p(x, ON_FLOOR) }],
    pin: 'ankle',
  });
}

// ---- Cartwheels (front view, travelling right) ----

/** Arms up by the ears. */
const ARMS_UP: readonly [Limb, Limb] = [
  [-80, -82],
  [-100, -98],
];

/** Start: standing sideways, arms up, the lead (near) leg lifted towards the line. */
function cartwheelStart(): Pose {
  return figure({
    hip: p(9, 19.2),
    torso: -88,
    hands: ARMS_UP,
    feet: [[22, 22], { to: p(9, ON_FLOOR) }],
    toes: 'point',
  });
}

/** Lunge in: torso tipped towards the floor, hands reaching down, back leg kicking up. */
function cartwheelReach(hands: number): Pose {
  return figure({
    hip: p(12.5, 20.5),
    torso: 2,
    head: 8,
    hands: [
      [68 - hands, 72 - hands],
      [74, 80],
    ],
    feet: [{ to: p(14.5, ON_FLOOR) }, [-152, -150]],
    toes: 'point',
  });
}

interface InvertedOptions {
  /** Legs: wide straddle (cartwheel) or snapped together (round-off). */
  together?: boolean;
  /** Second arm out to the side instead of on the floor (one-handed cartwheel). */
  oneHand?: boolean;
  /** No hands (aerial): arms tucked in, the body higher in the air. */
  air?: boolean;
}

/** Upside down over the hands, just past vertical, so the turn keeps going clockwise. */
function cartwheelInverted(options: InvertedOptions = {}): Pose {
  const legs: readonly [Limb, Limb] = options.together
    ? [
        [-84, -84],
        [-96, -96],
      ]
    : [
        [-142, -142],
        [-38, -38],
      ];
  const arms: readonly [Limb, Limb] = options.air
    ? [
        [70, -120],
        [110, -60],
      ]
    : options.oneHand
      ? [
          [92, 92],
          [-170, -170],
        ]
      : [
          [80, 80],
          [100, 100],
        ];
  return figure({
    hip: p(16, options.air ? 9.6 : 14.4),
    torso: 96,
    head: 100,
    hands: arms,
    feet: legs,
    toes: 'point',
  });
}

/** Landing: the trailing (far) leg down first, the lead leg still high, arms up. */
function cartwheelLand(): Pose {
  return figure({
    hip: p(22.5, 19.6),
    torso: -98,
    hands: [
      [-104, -108],
      [-122, -126],
    ],
    feet: [[-146, -146], { to: p(24.5, ON_FLOOR) }],
    toes: 'point',
  });
}

/** A cartwheel-family loop: start, reach, upside down, land, then cut back to the start. */
function cartwheel(start: Pose, reach: Pose, inverted: Pose, land: Pose): FigureAnimation {
  const keyframes: Keyframe[] = [
    { hold: 1, pose: start },
    { pose: reach },
    { pose: inverted },
    { hold: 2, steps: CUT, pose: land },
  ];
  return { props: [FLOOR], steps: 3, still: 2, keyframes };
}

/** Side view, facing right: a lunge with arms up (quarter-turn and round-off entries). */
const LUNGE_ARMS_UP = figure({
  hip: p(9.5, 21.2),
  torso: -80,
  hands: [
    [-70, -72],
    [-76, -78],
  ],
  feet: [{ to: p(14.5, 28.5) }, { to: p(3.5, ON_FLOOR) }],
  toes: 'flex',
});

/** Side view, facing back the way it came (left): a lunge, arms up. */
const LUNGE_FACING_BACK = figure({
  hip: p(23.5, 21.2),
  torso: -100,
  hands: [
    [-108, -110],
    [-104, -106],
  ],
  feet: [{ to: p(29.5, 28.4) }, { to: p(18.5, 28.4), bend: 1 }],
  toes: 'point',
});

/**
 * Bunny hop: hands stay on the line; the hip swings over them from one `side` to the other.
 * `overFrom` gives the moment over the hands, tucked legs trailing from that side.
 */
function bunnyHop(side: -1 | 1, overFrom?: -1 | 1): Pose {
  if (overFrom !== undefined) {
    const legs: readonly [Limb, Limb] =
      overFrom === -1
        ? [
            [-132, -20],
            [-124, -12],
          ]
        : [
            [-48, -160],
            [-56, -168],
          ];
    return figure({
      hip: p(16, 15.4),
      torso: 88,
      head: 92,
      hands: [{ to: p(16.8, ON_FLOOR) }, { to: p(15.2, ON_FLOOR) }],
      feet: legs,
      toes: 'point',
      pin: 'hand',
    });
  }
  const hip = p(16 + side * 6, 24.2);
  return figure({
    hip,
    torso: side === -1 ? -26 : 206,
    head: side === -1 ? -10 : 190,
    hands: [{ to: p(16.8, ON_FLOOR) }, { to: p(15.2, ON_FLOOR) }],
    feet: [
      { to: p(hip.x + side * 2, ON_FLOOR), bend: side === -1 ? 1 : -1 },
      { to: p(hip.x + side * 3.6, ON_FLOOR), bend: side === -1 ? 1 : -1 },
    ],
    pin: 'hand',
  });
}

export const ACROBATICS_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  tuck_rock: {
    props: [FLOOR],
    steps: 4,
    keyframes: [
      { hold: 1, pose: squatBall(16, [-5, 75]) },
      { hold: 1, pose: rolled(PIZZA_TUCK, -150, 12.5) },
    ],
  },
  back_breakfall: {
    props: [FLOOR],
    still: 2,
    keyframes: [
      {
        hold: 1,
        pose: stand(17, [
          [0, 0],
          [5, 5],
        ]),
      },
      {
        steps: 2,
        pose: figure({
          hip: p(15, 25.4),
          torso: -70,
          head: -40,
          hands: [[-10, -10]],
          feet: [{ to: p(17, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
      {
        hold: 2,
        steps: 4,
        pose: resting(
          shape({
            torso: 194,
            head: 228,
            arms: [[50, 40]],
            legs: [[-62, -30]],
            toes: 'point',
          }),
          15,
        ),
      },
      {
        pose: figure({
          hip: p(15, 25.4),
          torso: -70,
          head: -40,
          hands: [[-10, -10]],
          feet: [{ to: p(17, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
    ],
  },
  forward_roll: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(9, 20.4),
          torso: 42,
          head: 110,
          hands: [{ to: p(15.4, ON_FLOOR) }],
          feet: [{ to: p(10.5, ON_FLOOR) }],
        }),
      },
      { pose: rolled(TUCK, 192, 12.5) },
      { pose: rolled(TUCK, 292, 17.5) },
      { hold: 1, steps: CUT, pose: squatBall(23.5, [-10, -10]) },
    ],
  },
  side_breakfall: {
    props: [FLOOR],
    still: 2,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(16, 19.6),
          torso: -90,
          hands: [
            [60, 60],
            [120, 120],
          ],
          feet: [{ to: p(18, ON_FLOOR), bend: 1 }, { to: p(14, ON_FLOOR) }],
          pin: 'ankleFar',
        }),
      },
      {
        steps: 2,
        pose: figure({
          hip: p(14.2, 23),
          torso: -96,
          hands: [
            [140, 150],
            [130, 130],
          ],
          feet: [[150, 160], { to: p(14, ON_FLOOR), bend: 1 }],
          toes: 'point',
          pin: 'ankleFar',
        }),
      },
      {
        hold: 2,
        steps: 4,
        pose: resting(
          shape({
            torso: -6,
            head: -26,
            arms: [
              [40, 40],
              [-60, -40],
            ],
            legs: [
              [200, 200],
              [216, 216],
            ],
            toes: 'point',
          }),
          12.5,
        ),
      },
      {
        pose: figure({
          hip: p(14.4, 24.6),
          torso: -80,
          hands: [
            [60, 60],
            [110, 110],
          ],
          feet: [[150, 160], { to: p(15.5, ON_FLOOR), bend: 1 }],
          toes: 'point',
          pin: 'ankleFar',
        }),
      },
    ],
  },
  forward_shoulder_roll: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(9, 20.6),
          torso: -32,
          head: -10,
          hands: [
            [70, 140],
            [10, 40],
          ],
          feet: [{ to: p(13.5, 27.8) }, { to: p(4.5, ON_FLOOR) }],
          toes: 'point',
        }),
      },
      {
        pose: rolled(
          shape({
            torso: -62,
            head: -10,
            arms: [[30, 70]],
            legs: [
              [-40, 60],
              [-20, 80],
            ],
            toes: 'point',
          }),
          192,
          12,
        ),
      },
      {
        pose: resting(
          shape({
            torso: 222,
            head: 250,
            arms: [
              [10, 10],
              [80, 80],
            ],
            legs: [
              [-20, 60],
              [-30, 30],
            ],
            toes: 'point',
          }),
          18.5,
        ),
      },
      {
        hold: 1,
        steps: CUT,
        pose: figure({
          hip: p(22.5, 22.6),
          torso: -84,
          hands: [
            [-40, -40],
            [80, 60],
          ],
          feet: [{ to: p(27.5, ON_FLOOR) }, { to: p(17.5, 28.4), bend: 1 }],
          toes: 'flex',
        }),
      },
    ],
  },
  backward_shoulder_roll: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: squatBall(24, [10, 30]) },
      {
        pose: resting(
          shape({ torso: 168, head: 140, arms: [[10, 10]], legs: [[-120, -150]], toes: 'point' }),
          19,
        ),
      },
      {
        pose: resting(
          shape({ torso: 110, head: 80, arms: [[20, 20]], legs: [[-150, 150]], toes: 'point' }),
          13.5,
        ),
      },
      {
        hold: 1,
        steps: CUT,
        pose: figure({
          hip: p(9, 24),
          torso: -88,
          hands: [[80, 70]],
          feet: [[90, 180]],
          toes: 'point',
        }),
      },
    ],
  },
  bunny_hop_cartwheel: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: bunnyHop(-1) },
      { pose: bunnyHop(1, -1) },
      { hold: 1, pose: bunnyHop(1) },
      { pose: bunnyHop(-1, 1) },
    ],
  },
  backward_roll: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: squatBall(24, [-20, -150]) },
      { pose: rolled(PIZZA_TUCK, -128, 19, 0.4) },
      {
        pose: rolled(
          shape({ torso: -62, head: -28, arms: [[-60, 150]], legs: [[-30, 112]], toes: 'point' }),
          -230,
          15,
          0.8,
        ),
      },
      { hold: 1, steps: CUT, pose: squatBall(9, [10, 30]) },
    ],
  },
  cartwheel: cartwheel(cartwheelStart(), cartwheelReach(0), cartwheelInverted(), cartwheelLand()),
  quarter_turn_cartwheel: cartwheel(
    LUNGE_ARMS_UP,
    cartwheelReach(0),
    cartwheelInverted(),
    LUNGE_FACING_BACK,
  ),
  one_handed_cartwheel: cartwheel(
    cartwheelStart(),
    figure({
      hip: p(12.5, 20.5),
      torso: 2,
      head: 8,
      hands: [
        [70, 74],
        [-150, -150],
      ],
      feet: [{ to: p(14.5, ON_FLOOR) }, [-152, -150]],
      toes: 'point',
    }),
    cartwheelInverted({ oneHand: true }),
    cartwheelLand(),
  ),
  round_off: cartwheel(
    LUNGE_ARMS_UP,
    cartwheelReach(0),
    cartwheelInverted({ together: true }),
    figure({
      hip: p(23, 18.9),
      torso: -102,
      head: -98,
      hands: [
        [-112, -116],
        [-108, -112],
      ],
      // On tiptoe: a flexed foot would point right, against the facing-back landing.
      feet: [{ to: p(25.4, ON_FLOOR - 1.5), bend: 1 }],
      toes: 'point',
    }),
  ),
  aerial_cartwheel: cartwheel(
    cartwheelStart(),
    figure({
      hip: p(12.5, 18.5),
      torso: 0,
      head: 10,
      hands: [
        [40, -100],
        [60, -60],
      ],
      feet: [{ to: p(14, ON_FLOOR) }, [-150, -150]],
      toes: 'point',
    }),
    cartwheelInverted({ air: true }),
    cartwheelLand(),
  ),
};
