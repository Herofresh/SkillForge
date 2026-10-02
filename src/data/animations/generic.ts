/**
 * One generic animation per movement pattern (PLAN 6.4a, ADR-053): what a node without its own
 * animation shows (its first pattern's), including the user's own nodes. Where an iconic node
 * already shows the pattern (push-up, pull-up, squat, handstand), the generic one is that node's.
 */
import type { Pattern } from '@/domain/types';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { legVia } from './floorPoses';
import { ICONIC_ANIMATIONS } from './iconic';
import { figure, ON_FLOOR, p } from './pose';
import { PULL_UP } from './v_pull';

const FLOOR = { kind: 'floor' } as const;
const BAR = p(10, 5);

const STAND = figure({
  hip: p(15, 19.2),
  torso: -90,
  hands: [[95, 85]],
  feet: [{ to: p(15.5, ON_FLOOR) }],
  pin: 'ankle',
});

const pikePushUp: FigureAnimation = {
  props: [FLOOR],
  keyframes: [
    {
      hold: 1,
      pose: figure({
        hip: p(15, 18.6),
        torso: 35,
        hands: [{ to: p(21, ON_FLOOR) }],
        feet: [{ to: p(12.6, 28) }],
        pin: 'hand',
      }),
    },
    {
      pose: figure({
        hip: p(15.5, 19),
        torso: 56,
        hands: [{ to: p(21, ON_FLOOR) }],
        feet: [{ to: p(12.6, 28) }],
        pin: 'hand',
      }),
    },
  ],
};

const RING = p(20.5, 17);
const invertedRow: FigureAnimation = {
  props: [FLOOR, { kind: 'rings', x: RING.x, y: RING.y }],
  keyframes: [
    {
      pose: figure({
        hip: p(13.2, 25.8),
        torso: -15,
        hands: [{ to: RING }],
        feet: [{ to: p(3.5, 28.3) }],
        pin: 'hand',
      }),
    },
    {
      hold: 1,
      pose: figure({
        hip: p(12, 23.2),
        torso: -32,
        hands: [{ to: RING }],
        feet: [{ to: p(3.5, 28.3) }],
        pin: 'hand',
      }),
    },
  ],
};

const planchelean: FigureAnimation = {
  props: [FLOOR],
  still: 1,
  keyframes: [
    {
      hold: 1,
      pose: figure({
        hip: p(14.6, 23.5),
        torso: -20,
        hands: [{ to: p(21, ON_FLOOR) }],
        feet: [{ to: p(5.2, 27.6) }],
        toes: 'point',
        pin: 'hand',
      }),
    },
    {
      hold: 3,
      pose: figure({
        hip: p(17.4, 23.2),
        torso: -14,
        hands: [{ to: p(21, ON_FLOOR) }],
        feet: [{ to: p(7.6, 27.6) }],
        toes: 'point',
        pin: 'hand',
      }),
    },
  ],
};

const tuckFrontLever: FigureAnimation = {
  props: [FLOOR, { kind: 'bar', x: BAR.x, y: BAR.y }],
  still: 1,
  keyframes: [
    {
      pose: figure({
        hip: p(10, 19.6),
        torso: -90,
        hands: [{ to: BAR }],
        feet: [{ to: p(10.5, 28.5) }],
        toes: 'point',
        pin: 'hand',
      }),
    },
    {
      hold: 4,
      pose: figure({
        hip: p(18, 12.6),
        torso: 185,
        hands: [{ to: BAR }],
        feet: [[-125, 20]],
        toes: 'point',
        pin: 'hand',
      }),
    },
  ],
};

const hipHinge: FigureAnimation = {
  props: [FLOOR],
  keyframes: [
    { hold: 1, pose: STAND },
    {
      hold: 1,
      pose: figure({
        hip: p(12.5, 19.6),
        torso: -10,
        head: -20,
        hands: [[85, 90]],
        feet: [{ to: p(15.5, ON_FLOOR) }],
        pin: 'ankle',
      }),
    },
  ],
};

const HOLLOW_HIP = p(15, 27.6);
const hollowHold: FigureAnimation = {
  props: [FLOOR],
  still: 1,
  keyframes: [
    {
      pose: figure({
        hip: HOLLOW_HIP,
        torso: 180,
        hands: [[180, 180]],
        feet: [[0, 0]],
        toes: 'point',
      }),
    },
    {
      hold: 3,
      pose: figure({
        hip: HOLLOW_HIP,
        torso: 197,
        hands: [[200, 200]],
        feet: [[-18, -18]],
        toes: 'point',
      }),
    },
  ],
};

/**
 * Low lunge reach: the generic stretch. Kneeling on the back knee, the hips sink forward while
 * both arms sweep up overhead, opening the front of the back hip. (The seated forward fold it
 * replaced is now the pike fold's own animation.)
 */
const LUNGE_KNEE = p(9.5, ON_FLOOR);
function lowLunge(hip: { x: number; y: number }, torso: number, arms: number) {
  return figure({
    hip,
    torso,
    head: torso + 4,
    hands: [[arms, arms - 4]],
    feet: [{ to: p(18.4, ON_FLOOR) }, legVia(hip, LUNGE_KNEE, p(LUNGE_KNEE.x - 6, ON_FLOOR))],
    toes: 'point',
  });
}
const lowLungeReach: FigureAnimation = {
  props: [FLOOR],
  still: 1,
  steps: 5,
  keyframes: [
    { hold: 1, pose: lowLunge(p(10.6, 24.2), -84, 62) },
    { hold: 3, pose: lowLunge(p(12.6, 25.4), -98, -104) },
  ],
};

const jumpSquat: FigureAnimation = {
  props: [FLOOR],
  keyframes: [
    {
      pose: figure({
        hip: p(11.5, 24.5),
        torso: -55,
        hands: [[110, 100]],
        feet: [{ to: p(15.5, ON_FLOOR) }],
        pin: 'ankle',
      }),
    },
    {
      steps: 2,
      pose: figure({
        hip: p(15, 15.5),
        torso: -90,
        hands: [[-100, -100]],
        feet: [{ to: p(15.5, 25.5) }],
        toes: 'point',
      }),
    },
    {
      steps: 3,
      pose: figure({
        hip: p(14, 20.5),
        torso: -80,
        hands: [[60, 40]],
        feet: [{ to: p(15.5, ON_FLOOR) }],
        pin: 'ankle',
      }),
    },
  ],
};

export const PATTERN_ANIMATIONS: Readonly<Record<Pattern, FigureAnimation>> = {
  horizontal_push: ICONIC_ANIMATIONS.push_up,
  vertical_push: pikePushUp,
  vertical_pull: PULL_UP,
  horizontal_pull: invertedRow,
  straight_arm_push: planchelean,
  straight_arm_pull: tuckFrontLever,
  squat: ICONIC_ANIMATIONS.squat,
  hinge: hipHinge,
  core: hollowHold,
  balance: ICONIC_ANIMATIONS.freestanding_handstand,
  mobility: lowLungeReach,
  explosive: jumpSquat,
};
