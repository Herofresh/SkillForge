/**
 * Vertical pull branch, every node animated (PLAN 6.4a). Side view with the bar end-on at
 * {@link BAR}; the archer pull-up is the one front view (a rail), since its movement is sideways.
 * Poses follow the cues in content/progressions/v_pull.yaml.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';
import type { Pose } from '@/lib/figure';

import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
const BAR = p(16, 6);
const BAR_PROP = { kind: 'bar', x: BAR.x, y: BAR.y } as const;
/** The free arm of a one-arm hang, bent in front of the body so it shows. */
const ARM_AT_SIDE = [55, 110] as const;
/** Hip below the bar in a dead hang; the hands sit a little in front of the head. */
const HANG_DROP = 14.6;
const HANG_LEAN = 1.4;

interface HangOptions {
  oneArm?: boolean;
  /** How far the hip rises above the dead hang (scapular pull, active hang). */
  hipDy?: number;
  torso?: number;
  bar?: typeof BAR;
}

/** Dead hang: straight arms under the bar, legs crossed back a little. */
function hang(options: HangOptions = {}): Pose {
  const bar = options.bar ?? BAR;
  const hip = p(bar.x - HANG_LEAN, bar.y + HANG_DROP - (options.hipDy ?? 0));
  const hand = { to: bar };
  return figure({
    hip,
    torso: options.torso ?? -90,
    hands: [hand, options.oneArm ? ARM_AT_SIDE : hand],
    feet: [{ to: p(hip.x - 2.2, Math.min(hip.y + 9, ON_FLOOR - 1)) }],
    toes: 'point',
    pin: 'hand',
  });
}

/** Chin over the bar, elbows down in front, body a little arched. */
function top(options: { oneArm?: boolean } = {}): Pose {
  const hand = { to: BAR };
  return figure({
    hip: p(14.1, 14.6),
    torso: -95,
    hands: [hand, options.oneArm ? ARM_AT_SIDE : hand],
    feet: [{ to: p(12, 23.5) }],
    toes: 'point',
    pin: 'hand',
  });
}

const PULL_UP: FigureAnimation = {
  props: [FLOOR, BAR_PROP],
  keyframes: [
    { hold: 1, pose: hang() },
    { hold: 1, pose: top() },
  ],
};

/** The jumping pull-up's lower bar: reachable standing with bent knees. */
const LOW_BAR = p(16, 8);
/** The chest-to-bar pull-up's bar hangs lower so the head stays in the frame at the top. */
const CHEST_BAR = p(16, 7);
const RAIL_Y = 4;
const ARCHER_HANDS = [p(11, RAIL_Y + 0.5), p(20, RAIL_Y + 0.5)] as const;

export const V_PULL_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  dead_hang: {
    props: [FLOOR, BAR_PROP],
    steps: 4,
    keyframes: [
      { hold: 3, pose: hang() },
      { hold: 3, pose: hang({ hipDy: 0.8, torso: -94 }) },
    ],
  },
  scapular_pull: {
    props: [FLOOR, BAR_PROP],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(16, 18.6),
          torso: -90,
          head: -60,
          hands: [{ to: BAR }],
          feet: [{ to: p(14, 27.6) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      { hold: 2, pose: hang({ hipDy: 1.6, torso: -100 }) },
    ],
  },
  jump_pull_up: {
    props: [FLOOR, { kind: 'bar', x: LOW_BAR.x, y: LOW_BAR.y }],
    still: 1,
    keyframes: [
      {
        hold: 1,
        steps: 3,
        pose: figure({
          hip: p(14.8, 22.6),
          torso: -86,
          hands: [{ to: LOW_BAR }],
          feet: [{ to: p(15.5, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
      {
        hold: 2,
        steps: 5,
        pose: figure({
          hip: p(14.1, 16.6),
          torso: -95,
          hands: [{ to: LOW_BAR }],
          feet: [{ to: p(12.5, 25.5) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  pull_up_negative: {
    props: [FLOOR, BAR_PROP],
    keyframes: [
      { hold: 2, steps: 7, pose: top() },
      { steps: 2, pose: hang() },
    ],
  },
  pull_up: PULL_UP,
  l_pull_up: {
    props: [FLOOR, BAR_PROP],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(16, 18.6),
          torso: -90,
          hands: [{ to: BAR }],
          feet: [{ to: p(26, 18.6) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 1,
        pose: figure({
          hip: p(14.1, 14.6),
          torso: -95,
          hands: [{ to: BAR }],
          feet: [{ to: p(24, 14) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  chest_to_bar_pull_up: {
    props: [FLOOR, { kind: 'bar', x: CHEST_BAR.x, y: CHEST_BAR.y }],
    keyframes: [
      { hold: 1, pose: hang({ bar: CHEST_BAR }) },
      {
        hold: 1,
        pose: figure({
          hip: p(16.6, 12.5),
          torso: -112,
          hands: [{ to: CHEST_BAR }],
          feet: [{ to: p(16.5, 21.5) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  archer_pull_up: {
    props: [FLOOR, { kind: 'rail', x: 6, y: RAIL_Y, width: 20 }],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(15.5, 17.4),
          torso: -90,
          hands: [
            { to: ARCHER_HANDS[0], bend: -1 },
            { to: ARCHER_HANDS[1], bend: 1 },
          ],
          feet: [{ to: p(14.6, 27.3) }, { to: p(16.4, 27.3) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 1,
        pose: figure({
          hip: p(12.6, 13.8),
          torso: -90,
          hands: [
            { to: ARCHER_HANDS[0], bend: -1 },
            { to: ARCHER_HANDS[1], bend: 1 },
          ],
          feet: [{ to: p(11.7, 23.7) }, { to: p(13.5, 23.7) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  one_arm_chin_up_negative: {
    props: [FLOOR, BAR_PROP],
    keyframes: [
      { hold: 2, steps: 7, pose: top({ oneArm: true }) },
      { steps: 2, pose: hang({ oneArm: true }) },
    ],
  },
  one_arm_chin_up: {
    props: [FLOOR, BAR_PROP],
    keyframes: [
      { hold: 1, steps: 4, pose: hang({ oneArm: true }) },
      { hold: 1, pose: top({ oneArm: true }) },
    ],
  },
};

export { PULL_UP };
