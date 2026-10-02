/**
 * Per-node animations for iconic skills outside the fully animated branches (PLAN 6.4a):
 * push-up, squat, handstand, front lever, planche (the pull-up is in v_pull.ts). Poses from the cues in content/progressions.
 */
import type { FigureAnimation } from '@/lib/figureAnimation';

import { figure, ON_FLOOR, p } from './pose';

const FLOOR = { kind: 'floor' } as const;

export const ICONIC_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  push_up: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(14.6, 23.5),
          torso: -20,
          hands: [{ to: p(21, ON_FLOOR) }],
          feet: [{ to: p(5.2, 27.6) }],
          pin: 'hand',
        }),
      },
      {
        pose: figure({
          hip: p(16.2, 26.2),
          torso: -6,
          hands: [{ to: p(21, ON_FLOOR) }],
          feet: [{ to: p(6.2, 27.6) }],
          pin: 'hand',
        }),
      },
    ],
  },
  squat: {
    props: [FLOOR],
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(15, 19.2),
          torso: -90,
          hands: [[60, 80]],
          feet: [{ to: p(15.5, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
      {
        pose: figure({
          hip: p(11.5, 24.5),
          torso: -55,
          hands: [[0, 0]],
          feet: [{ to: p(15.5, ON_FLOOR) }],
          pin: 'ankle',
        }),
      },
    ],
  },
  freestanding_handstand: {
    props: [FLOOR],
    still: 2,
    keyframes: [
      {
        pose: figure({
          hip: p(11, 19.5),
          torso: -75,
          hands: [[-80, -80]],
          feet: [{ to: p(15, ON_FLOOR) }, { to: p(7, ON_FLOOR) }],
        }),
      },
      {
        pose: figure({
          hip: p(14, 16),
          torso: 95,
          hands: [{ to: p(16, ON_FLOOR) }],
          feet: [{ to: p(8, 10) }, { to: p(9, ON_FLOOR) }],
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(16, 14.4),
          torso: 90,
          hands: [{ to: p(16, ON_FLOOR) }],
          feet: [{ to: p(16, 4.5) }],
          toes: 'point',
        }),
      },
      {
        pose: figure({
          hip: p(14, 16),
          torso: 95,
          hands: [{ to: p(16, ON_FLOOR) }],
          feet: [{ to: p(8, 10) }, { to: p(9, ON_FLOOR) }],
        }),
      },
    ],
  },
  front_lever: {
    props: [FLOOR, { kind: 'bar', x: 10, y: 5 }],
    still: 1,
    keyframes: [
      {
        pose: figure({
          hip: p(10, 19.6),
          torso: -90,
          hands: [{ to: p(10, 5) }],
          feet: [{ to: p(10.5, 28.5) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(19, 12.6),
          torso: 180,
          hands: [{ to: p(10, 5) }],
          feet: [{ to: p(29, 12.6) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
  full_planche: {
    props: [FLOOR],
    still: 1,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(14.2, 20.5),
          torso: 6,
          hands: [{ to: p(18, ON_FLOOR) }],
          feet: [[35, 165]],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(14, 22),
          torso: 0,
          head: 15,
          hands: [{ to: p(18, ON_FLOOR) }],
          feet: [{ to: p(4, 22) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
};
