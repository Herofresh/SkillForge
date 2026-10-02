/**
 * Flexibility branch, every node animated (PLAN 6.4b-3). Stretches ease slowly into the pose and
 * hold it. Side view, except where the stretch opens sideways: butterfly, the lotus seats, pancake
 * and middle split face the viewer (front view, legs out to the sides). Poses follow the cues in
 * content/progressions/flexibility.yaml.
 */
import type { Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { armVia, legVia, shouldersOf } from './floorPoses';
import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
/** Hip height of a seated figure: the torso's bottom edge rests on the floor. */
const SEAT_Y = 28.3;
/** Frames per move for the slow stretches. */
const SLOW = 5;

/** On hands and knees, rocked forward (`lean` > 0) or back; the head angle shows cat or cow. */
export function allFours(lean: number, options: { torso?: number; head?: number } = {}): Pose {
  const knee = p(11, ON_FLOOR);
  const thigh = 90 + lean;
  const torso = options.torso ?? -12;
  const hip = p(
    knee.x - Math.cos((thigh * Math.PI) / 180) * 5,
    knee.y - Math.sin((thigh * Math.PI) / 180) * 5,
  );
  return figure({
    hip,
    torso,
    head: options.head ?? torso + 10,
    hands: [{ to: p(18.6, ON_FLOOR) }],
    feet: [[thigh, 180]],
    toes: 'point',
  });
}

/** Seated with straight legs together, folding `torso` towards them. */
function seatedFold(torso: number, reach: number): Pose {
  const hip = p(10, SEAT_Y);
  const shoulders = shouldersOf(hip, torso);
  return figure({
    hip,
    torso,
    head: torso + (torso < -60 ? 0 : 12),
    hands: [{ to: p(shoulders.x + reach, Math.max(shoulders.y + 2.5, 27)) }],
    feet: [[0, 0]],
    toes: 'flex',
  });
}

/** Front view, seated: a leg from the hip out to `knee` and back in to `foot`. */
function seatedLeg(hip: { x: number; y: number }, knee: [number, number], foot: [number, number]) {
  return legVia(hip, p(...knee), p(...foot));
}

const FRONT_SEAT = p(16, SEAT_Y);
/** Front view: palms together in front of the chest, elbows out. */
const PRAYER_HANDS = (() => {
  const shoulders = shouldersOf(FRONT_SEAT, -90);
  const hands = p(16, 24.2);
  return [
    armVia(shoulders, p(19.4, 23.6), hands),
    armVia(shoulders, p(12.6, 23.6), hands),
  ] as const;
})();

/** Front view, cross-legged (`up` 0) or with the near / both feet lifted onto the thighs. */
function lotusSeat(nearUp: boolean, farUp: boolean): Pose {
  const hip = FRONT_SEAT;
  const footY = (up: boolean) => (up ? 25.6 : 29);
  const kneeY = (up: boolean) => (up ? 28.4 : 27.4);
  return figure({
    hip,
    torso: -90,
    hands: PRAYER_HANDS,
    feet: [
      seatedLeg(hip, [21, kneeY(nearUp)], [nearUp ? 13.5 : 14.5, footY(nearUp)]),
      seatedLeg(hip, [11, kneeY(farUp)], [farUp ? 18.5 : 17.5, footY(farUp)]),
    ],
    toes: 'point',
  });
}

/** Pigeon: front leg folded under the hip (knee forward), back leg long behind. */
function pigeon(hipY: number, torso: number, hands: [number, number]): Pose {
  const hip = p(14, hipY);
  return figure({
    hip,
    torso,
    head: torso < -60 ? torso : torso + 25,
    hands: [{ to: p(...hands) }],
    feet: [{ to: p(14.6, ON_FLOOR - 0.3) }, { to: p(4.2, ON_FLOOR) }],
    toes: 'point',
  });
}

/** Wheel: hands and feet on the floor, hip high, head hanging between the arms. */
function wheel(nearLegUp: boolean): Pose {
  return figure({
    hip: p(18.5, 20),
    torso: 145,
    head: 112,
    hands: [{ to: p(9.4, ON_FLOOR), bend: -1 }],
    feet: [nearLegUp ? [-78, -78] : { to: p(23, ON_FLOOR) }, { to: p(23, ON_FLOOR) }],
    toes: nearLegUp ? 'point' : 'flex',
  });
}

const WHEEL_LYING = figure({
  hip: p(17, 28.3),
  torso: 180,
  head: 178,
  hands: [[-80, 125]],
  feet: [{ to: p(22, ON_FLOOR) }],
});

export const FLEXIBILITY_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  wrist_prep: {
    props: [FLOOR],
    steps: 4,
    keyframes: [
      { hold: 1, pose: allFours(-18) },
      { hold: 2, pose: allFours(22, { torso: -6 }) },
    ],
  },
  butterfly_stretch: {
    props: [FLOOR],
    steps: SLOW,
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: FRONT_SEAT,
          torso: -90,
          hands: [{ to: p(17.2, 28.2), bend: -1 }, { to: p(14.8, 28.2) }],
          feet: [
            seatedLeg(FRONT_SEAT, [20.5, 25.3], [16.8, ON_FLOOR]),
            seatedLeg(FRONT_SEAT, [11.5, 25.3], [15.2, ON_FLOOR]),
          ],
          toes: 'point',
        }),
      },
      {
        hold: 3,
        pose: figure({
          hip: FRONT_SEAT,
          torso: -90,
          hands: [{ to: p(17.2, 28.2), bend: -1 }, { to: p(14.8, 28.2) }],
          feet: [
            seatedLeg(FRONT_SEAT, [21, 28.4], [16.8, ON_FLOOR]),
            seatedLeg(FRONT_SEAT, [11, 28.4], [15.2, ON_FLOOR]),
          ],
          toes: 'point',
        }),
      },
    ],
  },
  shoulder_dislocate: (() => {
    const stand = (arm: number) =>
      figure({
        hip: p(15, 19.2),
        torso: -90,
        hands: [[arm, arm]],
        feet: [{ to: p(15.5, ON_FLOOR) }],
        pin: 'ankle',
      });
    return {
      props: [FLOOR],
      steps: 4,
      keyframes: [
        { hold: 1, pose: stand(72) },
        { pose: stand(-90) },
        { hold: 1, pose: stand(128) },
        { pose: stand(-90) },
      ],
    };
  })(),
  pike_fold: {
    props: [FLOOR],
    steps: SLOW,
    still: 1,
    keyframes: [
      { hold: 1, pose: seatedFold(-92, 2) },
      { hold: 4, pose: seatedFold(-34, 7.5) },
    ],
  },
  half_split: (() => {
    const hip = p(10, 24);
    const pose = (torso: number, hand: [number, number]) =>
      figure({
        hip,
        torso,
        head: torso + (torso < -60 ? 0 : 8),
        hands: [{ to: p(...hand) }],
        feet: [{ to: p(19.6, 28.2) }, [90, 180]],
        toes: 'flex',
      });
    return {
      props: [FLOOR],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pose(-88, [12.4, 24.6]) },
        { hold: 4, pose: pose(-28, [19, ON_FLOOR]) },
      ],
    };
  })(),
  pigeon_pose: {
    props: [FLOOR],
    steps: SLOW,
    still: 1,
    keyframes: [
      { hold: 1, pose: pigeon(26.2, -88, [16.5, ON_FLOOR]) },
      { hold: 2, pose: pigeon(SEAT_Y, -92, [16, ON_FLOOR]) },
      { hold: 3, pose: pigeon(SEAT_Y, -12, [26, ON_FLOOR]) },
    ],
  },
  table_bridge: {
    props: [FLOOR],
    steps: 4,
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(14, SEAT_Y),
          torso: -122,
          hands: [{ to: p(8, ON_FLOOR) }],
          feet: [{ to: p(21, ON_FLOOR) }],
        }),
      },
      {
        hold: 3,
        pose: figure({
          hip: p(18.5, 21.6),
          torso: 180,
          head: 180,
          hands: [{ to: p(12.6, ON_FLOOR) }],
          feet: [{ to: p(24, ON_FLOOR) }],
        }),
      },
    ],
  },
  frog_stretch: (() => {
    const knee = p(12, ON_FLOOR);
    const pose = (hipX: number, hipY: number, torso: number) => {
      const hip = p(hipX, hipY);
      return figure({
        hip,
        torso,
        head: torso - 10,
        hands: [{ to: p(23.4, ON_FLOOR) }],
        feet: [legVia(hip, knee, p(knee.x - 6, ON_FLOOR))],
        toes: 'point',
      });
    };
    return {
      props: [FLOOR],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pose(12.3, 24.1, 12) },
        { hold: 3, pose: pose(9.4, 25.4, 6) },
      ],
    };
  })(),
  couch_stretch: (() => {
    const hip = p(8.8, 24.8);
    const backLeg = legVia(hip, p(6.2, ON_FLOOR), p(6.6, 20));
    const pose = (torso: number, hand: [number, number]) =>
      figure({
        hip,
        torso,
        head: torso + (torso < -60 ? 0 : 15),
        hands: [{ to: p(...hand) }],
        feet: [{ to: p(16.5, ON_FLOOR) }, backLeg],
        toes: 'flex',
      });
    return {
      props: [FLOOR, { kind: 'box', x: 0, width: 4, height: 16 }],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pose(-38, [15, ON_FLOOR]) },
        { hold: 4, pose: pose(-96, [13.4, 22]) },
      ],
    };
  })(),
  half_lotus: {
    props: [FLOOR],
    steps: SLOW,
    still: 1,
    keyframes: [
      { hold: 2, pose: lotusSeat(false, false) },
      { hold: 4, pose: lotusSeat(true, false) },
    ],
  },
  full_bridge: {
    props: [FLOOR],
    steps: 4,
    still: 1,
    keyframes: [
      { hold: 1, pose: WHEEL_LYING },
      { hold: 4, pose: wheel(false) },
    ],
  },
  pancake: (() => {
    const pose = (head: number, hands: number, handY: number) =>
      figure({
        hip: FRONT_SEAT,
        torso: -90,
        head,
        hands: [{ to: p(16 + hands, handY) }, { to: p(16 - hands, handY) }],
        feet: [
          [0, 0],
          [180, 180],
        ],
        toes: 'point',
      });
    return {
      props: [FLOOR],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pose(-90, 5, 27.5) },
        { hold: 4, pose: pose(90, 3.5, ON_FLOOR) },
      ],
    };
  })(),
  front_split: (() => {
    const pose = (hipY: number, front: number, back: number) =>
      figure({
        hip: p(16, hipY),
        torso: -90,
        hands: [{ to: p(18.6, ON_FLOOR) }],
        feet: [{ to: p(front, 28.6) }, { to: p(back, 28.6) }],
        toes: 'flex',
      });
    return {
      props: [FLOOR],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pose(23.6, 24.4, 7.6) },
        { hold: 4, pose: pose(SEAT_Y, 26.2, 5.8) },
      ],
    };
  })(),
  lotus: {
    props: [FLOOR],
    steps: SLOW,
    still: 1,
    keyframes: [
      { hold: 2, pose: lotusSeat(true, false) },
      { hold: 4, pose: lotusSeat(true, true) },
    ],
  },
  one_leg_wheel: {
    props: [FLOOR],
    steps: 4,
    still: 1,
    keyframes: [
      { hold: 1, pose: wheel(false) },
      { hold: 3, pose: wheel(true) },
    ],
  },
  middle_split: (() => {
    const pose = (hipY: number, spread: number, handY: number) =>
      figure({
        hip: p(16, hipY),
        torso: -90,
        hands: [{ to: p(20.5, handY) }, { to: p(11.5, handY) }],
        feet: [{ to: p(16 + spread, 28.6) }, { to: p(16 - spread, 28.6) }],
        toes: 'point',
      });
    return {
      props: [FLOOR],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pose(21, 7.6, 28) },
        { hold: 4, pose: pose(SEAT_Y, 10.4, ON_FLOOR) },
      ],
    };
  })(),
  king_pigeon: (() => {
    const hip = p(14, SEAT_Y);
    const torso = -92;
    const shoulders = shouldersOf(hip, torso);
    return {
      props: [FLOOR],
      steps: SLOW,
      still: 1,
      keyframes: [
        { hold: 1, pose: pigeon(SEAT_Y, -92, [16, ON_FLOOR]) },
        {
          hold: 4,
          pose: figure({
            hip,
            torso,
            head: -104,
            hands: [armVia(shoulders, p(13.6, 17), p(10.4, 21.6))],
            feet: [{ to: p(14.6, ON_FLOOR - 0.3) }, [176, -82]],
            toes: 'point',
          }),
        },
      ],
    };
  })(),
};
