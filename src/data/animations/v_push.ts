/**
 * Vertical push branch, every node animated (PLAN 6.4b). Side view, facing right. Dips on dip
 * bars, a single bar or rings; pike push-ups from an upside-down V (feet on a box for the elevated
 * one); handstand push-ups against a wall (head to the floor, or below the hands on parallettes)
 * and free. Poses follow the cues in content/progressions/v_push.yaml.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';
import type { Point, Pose } from '@/lib/figure';

import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
const DIP_Y = 14;
const DIP_HAND = p(16, DIP_Y);
const DIP_BARS = { kind: 'dipBars', x: 10, y: DIP_Y, width: 12 } as const;
const RING = p(16, 14);
const RINGS = { kind: 'rings', x: RING.x, y: RING.y } as const;
const BAR = p(16, 17);
const BAR_PROP = { kind: 'bar', x: BAR.x, y: BAR.y } as const;
const WALL_X = 21;
const PARALLETTE_HEIGHT = 4;
const PARALLETTE_HAND = p(16.5, 30 - PARALLETTE_HEIGHT - 0.6);
const PIKE_BOX = { kind: 'box', x: 1, width: 8, height: 7 } as const;

/** Straight-arm support over the hands: body upright, knees bent so the feet clear the floor. */
function support(hand: Point, options: { sink?: number } = {}): Pose {
  const hip = p(hand.x - 1.2, hand.y - 0.4 + (options.sink ?? 0));
  return figure({
    hip,
    torso: -84,
    hands: [{ to: hand }],
    feet: [{ to: p(hip.x - 3.5, hip.y + 7.5) }],
    toes: 'point',
    pin: 'hand',
  });
}

/** The bottom of a dip: shoulders below the elbows, chest leaning forward a little. */
function dipBottom(hand: Point): Pose {
  const hip = p(hand.x - 2.6, hand.y + 4.8);
  return figure({
    hip,
    torso: -72,
    hands: [{ to: hand }],
    feet: [{ to: p(hip.x - 4.5, hip.y + 6.5) }],
    toes: 'point',
    pin: 'hand',
  });
}

interface InvertedOptions {
  hand: Point;
  hip: Point;
  /** Feet target (on a wall, the floor, a box or in the air). */
  feet: Point;
  torso?: number;
  head?: number;
  toes?: 'flex' | 'point';
}

/** Upside down on the hands; the elbows bend behind (towards the back). */
function inverted(options: InvertedOptions): Pose {
  return figure({
    hip: options.hip,
    torso: options.torso ?? 90,
    head: options.head,
    hands: [{ to: options.hand, bend: -1 }],
    feet: [{ to: options.feet, bend: 1 }],
    toes: options.toes ?? 'point',
    pin: 'hand',
  });
}

const SUPPORT_TOP = support(DIP_HAND);
const RING_TOP = support(RING);

export const V_PUSH_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  support_hold: {
    props: [FLOOR, DIP_BARS],
    steps: 4,
    keyframes: [
      { hold: 3, pose: SUPPORT_TOP },
      { hold: 3, pose: support(DIP_HAND, { sink: 0.8 }) },
    ],
  },
  pike_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: inverted({
          hand: p(20.5, ON_FLOOR),
          hip: p(12.5, 17.5),
          torso: 45,
          feet: p(8.5, 27.8),
          toes: 'flex',
        }),
      },
      {
        pose: inverted({
          hand: p(20.5, ON_FLOOR),
          hip: p(15, 20),
          torso: 37,
          head: 60,
          feet: p(8.5, 27.8),
          toes: 'flex',
        }),
      },
    ],
  },
  dip_negative: {
    props: [FLOOR, DIP_BARS],
    keyframes: [
      { hold: 2, steps: 7, pose: SUPPORT_TOP },
      { steps: 2, pose: dipBottom(DIP_HAND) },
    ],
  },
  elevated_pike_push_up: {
    props: [FLOOR, PIKE_BOX],
    keyframes: [
      {
        hold: 1,
        pose: inverted({
          hand: p(19, ON_FLOOR),
          hip: p(14, 15.5),
          torso: 70,
          feet: p(6, 22.6),
        }),
      },
      {
        pose: inverted({
          hand: p(19, ON_FLOOR),
          hip: p(15, 17.5),
          torso: 78,
          head: 85,
          feet: p(6, 22.6),
        }),
      },
    ],
  },
  parallel_bar_dip: {
    props: [FLOOR, DIP_BARS],
    keyframes: [{ hold: 1, pose: SUPPORT_TOP }, { pose: dipBottom(DIP_HAND) }],
  },
  straight_bar_dip: {
    props: [FLOOR, BAR_PROP],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(14.2, 16.6),
          torso: -80,
          hands: [{ to: BAR }],
          feet: [{ to: p(15.5, 26) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        pose: figure({
          hip: p(12, 20),
          torso: -38,
          head: -30,
          hands: [{ to: BAR }],
          feet: [{ to: p(16, 28) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  wall_headstand_push_up: {
    props: [FLOOR, { kind: 'wall', x: WALL_X }],
    keyframes: [
      {
        hold: 1,
        pose: inverted({ hand: p(16.5, ON_FLOOR), hip: p(17.6, 14.5), feet: p(20.2, 4.5) }),
      },
      {
        pose: inverted({ hand: p(16.5, ON_FLOOR), hip: p(17.8, 17.8), feet: p(20.2, 7.8) }),
      },
    ],
  },
  ring_dip: {
    props: [FLOOR, RINGS],
    keyframes: [{ hold: 1, pose: RING_TOP }, { pose: dipBottom(RING) }],
  },
  wall_handstand_push_up: {
    props: [
      FLOOR,
      { kind: 'wall', x: WALL_X },
      { kind: 'parallettes', x: 13, width: 7, height: PARALLETTE_HEIGHT },
    ],
    keyframes: [
      {
        hold: 1,
        pose: inverted({ hand: PARALLETTE_HAND, hip: p(17.8, 11.2), feet: p(20.2, 1.5) }),
      },
      {
        pose: inverted({ hand: PARALLETTE_HAND, hip: p(18, 15.6), feet: p(20.2, 5.8) }),
      },
    ],
  },
  freestanding_handstand_push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: inverted({ hand: p(16, ON_FLOOR), hip: p(16, 14.4), feet: p(16, 4.4) }),
      },
      {
        pose: inverted({
          hand: p(16, ON_FLOOR),
          hip: p(15, 17.6),
          torso: 80,
          feet: p(17, 7.8),
        }),
      },
    ],
  },
};
