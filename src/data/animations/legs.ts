/**
 * Legs branch, every node animated (PLAN 6.4b). Side view, facing right; the bodyweight squat is
 * in iconic.ts. The near leg is the working one: split squats put the far leg behind (on a box
 * for the Bulgarian), shrimp squats bend it behind (shin flat on the floor for the beginner, toes
 * up for the intermediate), pistols hold it straight out in front. Assisted versions hold a pole;
 * nordic curls kneel with the heels under an anchor bar. Poses follow content/progressions/legs.yaml.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';
import type { Limb, Point, Pose } from '@/lib/figure';

import { figure, ON_FLOOR, p, type LimbSpec } from './pose';

const FLOOR = { kind: 'floor' } as const;
const RADIANS = Math.PI / 180;
const THIGH = 5;
const FOOT = p(15.5, ON_FLOOR);
const POLE_X = 24;
const POLE = { kind: 'pole', x: POLE_X } as const;
const ARMS_FORWARD: Limb = [-5, -5];
const ARMS_DOWN: Limb = [95, 85];
/** Arms crossed on the chest (nordic curls). */
const ARMS_CROSSED: Limb = [60, -120];
const KNEE = p(12, 28.6);
const ANCHOR = { kind: 'bar', x: 7.4, y: 26.6 } as const;
const BOX = { kind: 'box', x: 1, width: 7, height: 6 } as const;

interface StandOptions {
  hip: Point;
  torso?: number;
  hands?: LimbSpec;
  /** The far leg: a foot target or explicit angles; defaults to the near foot. */
  far?: LimbSpec;
  foot?: Point;
  toes?: 'flex' | 'point';
}

/** Standing on the near foot (pinned), the far leg as given. */
function stand(options: StandOptions): Pose {
  const foot = options.foot ?? FOOT;
  return figure({
    hip: options.hip,
    torso: options.torso ?? -90,
    hands: [options.hands ?? ARMS_DOWN],
    feet: [{ to: foot }, options.far],
    toes: options.toes,
    pin: 'ankle',
  });
}

/** Kneeling with the body straight from the knees at `angle` (-90 upright), shins flat behind. */
function kneel(angle: number, hands: LimbSpec): Pose {
  const hip = p(
    KNEE.x + Math.cos(angle * RADIANS) * THIGH,
    KNEE.y + Math.sin(angle * RADIANS) * THIGH,
  );
  return figure({
    hip,
    torso: angle,
    hands: [hands],
    feet: [[angle + 180, 180]],
    pin: 'knee',
  });
}

const STANDING = stand({ hip: p(15, 19.2) });

export const LEGS_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  assisted_squat: {
    props: [FLOOR, POLE],
    keyframes: [
      {
        hold: 1,
        pose: stand({
          hip: p(15.6, 19.2),
          foot: p(16, ON_FLOOR),
          hands: { to: p(POLE_X - 0.3, 15.5) },
        }),
      },
      {
        pose: stand({
          hip: p(11.6, 25),
          torso: -64,
          foot: p(16, ON_FLOOR),
          hands: { to: p(POLE_X - 0.3, 20.5) },
        }),
      },
    ],
  },
  single_leg_deadlift: {
    props: [FLOOR],
    keyframes: [
      { hold: 1, pose: stand({ hip: p(15, 19.3), far: { to: p(12.5, 27.4) }, toes: 'flex' }) },
      {
        hold: 1,
        pose: stand({
          hip: p(14, 19.8),
          torso: -4,
          hands: [88, 92],
          far: [182, 182],
          toes: 'flex',
        }),
      },
    ],
  },
  deep_squat: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      { hold: 1, pose: STANDING },
      {
        hold: 2,
        pose: stand({ hip: p(13.6, 26.4), torso: -74, hands: ARMS_FORWARD }),
      },
    ],
  },
  split_squat: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: stand({ hip: p(14.5, 20), foot: p(19.5, ON_FLOOR), far: { to: p(8.6, 27.4) } }),
      },
      {
        pose: stand({ hip: p(14.2, 24.2), foot: p(19.5, ON_FLOOR), far: { to: p(8.6, 27.6) } }),
      },
    ],
  },
  bulgarian_split_squat: {
    props: [FLOOR, BOX],
    keyframes: [
      {
        hold: 1,
        pose: stand({
          hip: p(15.4, 20.4),
          foot: p(20.5, ON_FLOOR),
          far: { to: p(6.8, 23.3) },
          toes: 'point',
        }),
      },
      {
        pose: stand({
          hip: p(14.8, 24.4),
          torso: -82,
          foot: p(20.5, ON_FLOOR),
          far: { to: p(6.8, 23.3) },
          toes: 'point',
        }),
      },
    ],
  },
  beginner_shrimp_squat: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: stand({
          hip: p(15, 19.3),
          torso: -86,
          hands: ARMS_FORWARD,
          far: [100, 180],
          toes: 'point',
        }),
      },
      {
        pose: stand({
          hip: p(12.3, 24),
          torso: -48,
          hands: ARMS_FORWARD,
          far: [96, 180],
          toes: 'point',
        }),
      },
    ],
  },
  assisted_pistol_squat: {
    props: [FLOOR, POLE],
    keyframes: [
      {
        hold: 1,
        pose: stand({
          hip: p(16.5, 19.4),
          foot: p(17, ON_FLOOR),
          hands: { to: p(POLE_X - 0.3, 15.5) },
          far: [40, 40],
          toes: 'point',
        }),
      },
      {
        pose: stand({
          hip: p(13.8, 26),
          torso: -60,
          foot: p(17, ON_FLOOR),
          hands: { to: p(POLE_X - 0.3, 20.5) },
          far: [-6, -6],
          toes: 'point',
        }),
      },
    ],
  },
  intermediate_shrimp_squat: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: stand({
          hip: p(15, 19.3),
          torso: -86,
          hands: ARMS_FORWARD,
          far: [100, -145],
          toes: 'point',
        }),
      },
      {
        pose: stand({
          hip: p(12.3, 24),
          torso: -46,
          hands: ARMS_FORWARD,
          far: [96, -140],
          toes: 'point',
        }),
      },
    ],
  },
  pistol_squat: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: stand({ hip: p(15, 19.4), hands: ARMS_FORWARD, far: [32, 32], toes: 'point' }),
      },
      {
        pose: stand({
          hip: p(12.4, 26),
          torso: -56,
          hands: ARMS_FORWARD,
          far: [-6, -6],
          toes: 'point',
        }),
      },
    ],
  },
  nordic_curl_negative: {
    props: [FLOOR, ANCHOR],
    keyframes: [
      { hold: 1, steps: 8, pose: kneel(-90, ARMS_CROSSED) },
      { steps: 2, pose: kneel(-28, [35, 60]) },
      { hold: 1, steps: 3, pose: kneel(-15, { to: p(23.5, 28.6) }) },
    ],
  },
  nordic_curl: {
    props: [FLOOR, ANCHOR],
    steps: 6,
    keyframes: [
      { hold: 1, pose: kneel(-90, ARMS_CROSSED) },
      { hold: 1, pose: kneel(-30, ARMS_CROSSED) },
    ],
  },
};
