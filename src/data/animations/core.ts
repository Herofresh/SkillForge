/**
 * Core branch, every node animated (PLAN 6.4b). Side view: floor holds, the L-sit family on
 * parallettes or the floor (each hold enters from the progression before it, so the step up is
 * what moves), and the hanging raises on a bar. The side plank is a front view, the free arm
 * pointing up. Poses follow the cues in content/progressions/core.yaml.
 */
import type { Limb, Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { PATTERN_ANIMATIONS } from './generic';
import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;

/** Parallettes tall enough that a tucked or straight leg clears the floor. */
const PARALLETTE_HEIGHT = 5;
const PARALLETTES = { kind: 'parallettes', x: 12, width: 8, height: PARALLETTE_HEIGHT } as const;
/** The hand on top of the parallette rail. */
const PARALLETTE_HAND = p(16, 30 - PARALLETTE_HEIGHT - 0.5);
/** Hip of a straight-arm support on the parallettes, just behind the hands. */
const SUPPORT_HIP = p(15.4, PARALLETTE_HAND.y - 0.6);

/** A straight-arm support on the parallettes with the given legs. */
function parallettesSupport(legs: Limb | { to: { x: number; y: number } }, dy = 0): Pose {
  return figure({
    hip: p(SUPPORT_HIP.x, SUPPORT_HIP.y + dy),
    torso: -88,
    hands: [{ to: PARALLETTE_HAND }],
    feet: [legs],
    toes: 'point',
    pin: 'hand',
  });
}

const FOOT_SUPPORTED_LEGS = { to: p(25.6, ON_FLOOR) };
const TUCK_LEGS: Limb = [-34, 80];
const L_LEGS: Limb = [0, 0];

/** Hands on the floor for the floor holds (straddle L-sit, V-sit, manna). */
const FLOOR_HAND = p(15, ON_FLOOR);

const HANG_BAR = p(18, 4.4);
const HANG_BAR_PROP = { kind: 'bar', x: HANG_BAR.x, y: HANG_BAR.y } as const;

function deadHang(): Pose {
  return figure({
    hip: p(HANG_BAR.x - 0.3, HANG_BAR.y + 14.6),
    torso: -90,
    hands: [{ to: HANG_BAR }],
    feet: [[93, 93]],
    toes: 'point',
    pin: 'hand',
  });
}

/** Side plank (front view): body in one line from the feet to the shoulder over the elbow. */
function sidePlank(hipDrop: number): Pose {
  const shoulder = p(19.6, ON_FLOOR - 4);
  const torso = -12.6;
  const radians = (torso * Math.PI) / 180;
  const hip = p(shoulder.x - Math.cos(radians) * 7, shoulder.y - Math.sin(radians) * 7 + hipDrop);
  const shoulderAngle = (Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x) * 180) / Math.PI;
  return figure({
    hip,
    torso: shoulderAngle,
    hands: [
      [-90, -90],
      [92, 0],
    ],
    feet: [{ to: p(2.6, ON_FLOOR - 0.4) }],
    toes: 'flex',
  });
}

export const CORE_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  hollow_hold: PATTERN_ANIMATIONS.core,
  side_plank: {
    props: [FLOOR],
    still: 1,
    steps: 4,
    keyframes: [
      { hold: 1, pose: sidePlank(1.8) },
      { hold: 4, pose: sidePlank(0) },
    ],
  },
  foot_supported_l_sit: {
    props: [FLOOR, PARALLETTES],
    still: 1,
    keyframes: [
      // Seated between the parallettes, then the hips lift on straight arms.
      { hold: 1, pose: parallettesSupport({ to: p(25.4, ON_FLOOR) }, 3.6) },
      { hold: 4, pose: parallettesSupport(FOOT_SUPPORTED_LEGS) },
    ],
  },
  tuck_l_sit: {
    props: [FLOOR, PARALLETTES],
    still: 1,
    keyframes: [
      { hold: 1, pose: parallettesSupport(FOOT_SUPPORTED_LEGS) },
      { hold: 4, pose: parallettesSupport(TUCK_LEGS) },
    ],
  },
  hanging_knee_raise: {
    props: [FLOOR, HANG_BAR_PROP],
    keyframes: [
      { hold: 1, pose: deadHang() },
      {
        hold: 1,
        steps: 4,
        pose: figure({
          hip: p(HANG_BAR.x + 0.6, HANG_BAR.y + 14.2),
          torso: -96,
          hands: [{ to: HANG_BAR }],
          feet: [[-28, 70]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  l_sit: {
    props: [FLOOR, PARALLETTES],
    still: 1,
    keyframes: [
      { hold: 1, pose: parallettesSupport(TUCK_LEGS) },
      { hold: 4, pose: parallettesSupport(L_LEGS) },
    ],
  },
  toes_to_bar: {
    props: [FLOOR, HANG_BAR_PROP],
    keyframes: [
      { hold: 1, pose: deadHang() },
      {
        hold: 1,
        steps: 4,
        pose: figure({
          hip: p(HANG_BAR.x - 1.4, HANG_BAR.y + 11.9),
          torso: -120,
          head: -150,
          hands: [{ to: HANG_BAR }],
          feet: [{ to: p(HANG_BAR.x + 1.6, HANG_BAR.y + 2) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  straddle_l_sit: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(14.6, 27.6),
          torso: -88,
          hands: [{ to: FLOOR_HAND }],
          feet: [[0, 0]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(14, 25.8),
          torso: -78,
          hands: [{ to: FLOOR_HAND }],
          // Legs spread wide, drawn as a V: the near leg level, the far one raised.
          feet: [
            [5, 5],
            [-22, -22],
          ],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  v_sit: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(14, 25.8),
          torso: -88,
          hands: [{ to: FLOOR_HAND }],
          feet: [[-4, -4]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(15.6, 25.4),
          torso: -112,
          hands: [{ to: FLOOR_HAND }],
          feet: [[-46, -46]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  manna: {
    props: [FLOOR],
    still: 1,
    steps: 4,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(15.6, 25.4),
          torso: -112,
          hands: [{ to: FLOOR_HAND }],
          feet: [[-46, -46]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        // Hips high behind the hands' line, shoulders back, legs folded up to the face.
        hold: 4,
        pose: figure({
          hip: p(18.5, 23.6),
          torso: -170,
          head: -150,
          hands: [{ to: p(15, ON_FLOOR) }],
          feet: [[-98, -98]],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
};
