/**
 * Front lever branch (PLAN 6.4b): every node but the front lever itself (iconic.ts). Side view,
 * bar end-on; the lever shapes come from lever.ts so tuck, advanced tuck, one leg, straddle and
 * half lay differ only in the legs. Poses follow the cues in content/progressions/front_lever.yaml.
 */
import type { Point, Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { leverLegs, type LeverShape } from './lever';
import { figure, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
/** The bar of the holds, as in the iconic front lever. */
export const LEVER_BAR = p(10, 5);
const LEVER_BAR_PROP = { kind: 'bar', x: LEVER_BAR.x, y: LEVER_BAR.y } as const;
/** Shoulders sit this far from the bar in a straight-arm lever (hands a little towards the head). */
const LEVER_REACH = p(2, 7.3);
const TORSO = 7;

interface LeverOptions {
  bar?: Point;
  /** Where the shoulders are, when not hanging straight-armed from the bar (a lever row). */
  shoulder?: Point;
}

/** A front lever hold: body horizontal and face up, hands on the bar. */
export function frontLever(shape: LeverShape, options: LeverOptions = {}): Pose {
  const bar = options.bar ?? LEVER_BAR;
  const shoulder = options.shoulder ?? p(bar.x + LEVER_REACH.x, bar.y + LEVER_REACH.y);
  return figure({
    hip: p(shoulder.x + TORSO, shoulder.y),
    torso: 180,
    hands: [{ to: bar }],
    feet: leverLegs(shape),
    toes: 'point',
    pin: 'hand',
  });
}

/** Dead hang under the lever bar, optionally with the knees already tucked. */
export function leverHang(options: { tucked?: boolean; bar?: Point } = {}): Pose {
  const bar = options.bar ?? LEVER_BAR;
  return figure({
    hip: p(bar.x, bar.y + 14.6),
    torso: -90,
    hands: [{ to: bar }],
    feet: options.tucked ? [[-5, 85]] : [{ to: p(bar.x + 0.5, bar.y + 23.5) }],
    toes: 'point',
    pin: 'hand',
  });
}

function hold(shape: LeverShape): FigureAnimation {
  return {
    props: [FLOOR, LEVER_BAR_PROP],
    still: 1,
    keyframes: [
      { pose: leverHang({ tucked: shape !== 'full' && shape !== 'straddle' }) },
      { hold: 4, pose: frontLever(shape) },
    ],
  };
}

/** The inverted-hang skills hang from a lower bar so the feet stay in the frame upside down. */
const HIGH_BAR = p(11, 10);
const HIGH_BAR_PROP = { kind: 'bar', x: HIGH_BAR.x, y: HIGH_BAR.y } as const;

/** Upside down on straight arms, hips at the bar, legs reaching up (a little short of vertical). */
function invertedHang(bar: Point): Pose {
  return figure({
    hip: p(bar.x + 2.2, bar.y + 0.4),
    torso: 92,
    hands: [{ to: bar }],
    feet: [[-80, -80]],
    toes: 'flex',
    pin: 'hand',
  });
}

export const FRONT_LEVER_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  tuck_front_lever: hold('tuck'),
  tuck_front_lever_raise: {
    props: [FLOOR, LEVER_BAR_PROP],
    keyframes: [
      { hold: 1, steps: 4, pose: leverHang({ tucked: true }) },
      { hold: 2, steps: 5, pose: frontLever('tuck') },
    ],
  },
  advanced_tuck_front_lever: hold('advancedTuck'),
  tuck_ice_cream_maker: {
    props: [FLOOR, LEVER_BAR_PROP],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(LEVER_BAR.x - 1.9, LEVER_BAR.y + 8.6),
          torso: -95,
          hands: [{ to: LEVER_BAR }],
          feet: [[-25, 75]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      { hold: 2, steps: 4, pose: frontLever('tuck') },
    ],
  },
  one_leg_front_lever: hold('oneLeg'),
  straddle_front_lever: hold('straddle'),
  half_lay_front_lever: hold('halfLay'),
  front_lever_to_inverted: {
    props: [FLOOR, HIGH_BAR_PROP],
    keyframes: [
      { hold: 2, steps: 4, pose: frontLever('full', { bar: HIGH_BAR }) },
      { hold: 1, steps: 4, pose: invertedHang(HIGH_BAR) },
    ],
  },
  hanging_pull_to_inverted: {
    props: [FLOOR, HIGH_BAR_PROP],
    keyframes: [
      {
        // The lowest the pull can start under this bar with the feet off the floor: well below the
        // lever, arms straight (a full dead hang does not fit with the inverted end in the frame).
        hold: 1,
        pose: figure({
          hip: p(HIGH_BAR.x + 6.4, HIGH_BAR.y + 11.4),
          torso: -152,
          hands: [{ to: HIGH_BAR }],
          feet: [[28, 28]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      { pose: frontLever('full', { bar: HIGH_BAR }) },
      { hold: 1, steps: 4, pose: invertedHang(HIGH_BAR) },
      { steps: 4, pose: frontLever('full', { bar: HIGH_BAR }) },
    ],
  },
};
