/**
 * Back lever branch, every node animated (PLAN 6.4b). Side view on rings: the back lever is face
 * down with the head to the right and the arms reaching back up to the rings; the lever shapes
 * come from lever.ts. The rotation through the arms (skin the cat) goes hang → inverted →
 * German hang; the iron cross is the one front view. Poses follow content/progressions/back_lever.yaml.
 */
import type { Point, Pose } from '@/lib/figure';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { leverLegs, type LeverShape } from './lever';
import { figure, p } from './pose';

const FLOOR = { kind: 'floor' } as const;
/** Rings low enough that an inverted hang keeps the feet in the frame. */
const RING = p(16.5, 10);
const RINGS = { kind: 'rings', x: RING.x, y: RING.y } as const;
/** Skin the cat starts from a dead hang, so its rings hang higher. */
const HIGH_RING = p(16, 6);
const HIGH_RINGS = { kind: 'rings', x: HIGH_RING.x, y: HIGH_RING.y } as const;
const TORSO = 7;

/** Back lever: face down, shoulders a little ahead of and below the rings, arms straight back up. */
function backLever(shape: LeverShape, ring: Point = RING): Pose {
  const shoulder = p(ring.x + 3, ring.y + 6.9);
  return figure({
    hip: p(shoulder.x - TORSO, shoulder.y),
    torso: 0,
    hands: [{ to: ring }],
    feet: leverLegs(shape, true),
    toes: 'point',
    pin: 'hand',
  });
}

/** Upside down on straight arms, hips by the rings: tucked (the way in) or straight. */
function inverted(ring: Point, tucked: boolean): Pose {
  return figure({
    hip: p(ring.x + 1.2, ring.y + 0.4),
    torso: 92,
    hands: [{ to: ring }],
    feet: tucked ? [[150, -60]] : [[-88, -88]],
    toes: tucked ? 'point' : 'flex',
    pin: 'hand',
  });
}

/** German hang: past the back lever, head up again, body leaning forward, arms stretched back. */
function germanHang(ring: Point, options: { tucked?: boolean; torso?: number } = {}): Pose {
  const torso = options.torso ?? -55;
  const radians = (torso * Math.PI) / 180;
  const shoulder = p(ring.x + 2.6, ring.y + 7.05);
  const legs = torso + 180;
  return figure({
    hip: p(shoulder.x - Math.cos(radians) * TORSO, shoulder.y - Math.sin(radians) * TORSO),
    torso,
    hands: [{ to: ring }],
    feet: options.tucked ? [[legs - 85, legs + 30]] : [[legs, legs]],
    toes: 'point',
    pin: 'hand',
  });
}

function hold(shape: LeverShape): FigureAnimation {
  const tucked = shape === 'tuck' || shape === 'advancedTuck';
  return {
    props: [FLOOR, RINGS],
    still: 1,
    keyframes: [
      { steps: 4, pose: inverted(RING, tucked) },
      { hold: 4, steps: 4, pose: backLever(shape) },
    ],
  };
}

export const BACK_LEVER_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  german_hang: {
    props: [FLOOR, HIGH_RINGS],
    still: 1,
    steps: 4,
    keyframes: [
      { hold: 1, pose: inverted(HIGH_RING, true) },
      { hold: 4, pose: germanHang(HIGH_RING) },
    ],
  },
  skin_the_cat: {
    props: [FLOOR, HIGH_RINGS],
    still: 2,
    steps: 4,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(HIGH_RING.x, HIGH_RING.y + 14.6),
          torso: -90,
          hands: [{ to: HIGH_RING }],
          feet: [{ to: p(HIGH_RING.x - 2.2, 28) }],
          toes: 'point',
          pin: 'hand',
        }),
      },
      { pose: inverted(HIGH_RING, true) },
      { hold: 2, pose: germanHang(HIGH_RING, { tucked: true }) },
      { pose: inverted(HIGH_RING, true) },
    ],
  },
  tuck_back_lever: hold('tuck'),
  advanced_tuck_back_lever: hold('advancedTuck'),
  straddle_back_lever: hold('straddle'),
  one_leg_back_lever: hold('oneLeg'),
  back_lever: hold('full'),
  back_lever_pullout: {
    props: [FLOOR, RINGS],
    keyframes: [
      { hold: 2, steps: 5, pose: backLever('full') },
      { hold: 1, steps: 4, pose: inverted(RING, false) },
    ],
  },
  german_hang_pullout: {
    props: [FLOOR, RINGS],
    keyframes: [
      { hold: 1, steps: 4, pose: germanHang(RING, { torso: -40 }) },
      { steps: 4, pose: backLever('full') },
      { hold: 1, steps: 5, pose: inverted(RING, false) },
    ],
  },
  iron_cross: {
    props: [FLOOR, { kind: 'rings', x: 9, y: 10 }, { kind: 'rings', x: 23, y: 10 }],
    still: 1,
    steps: 4,
    keyframes: [
      {
        hold: 1,
        pose: figure({
          hip: p(16, 14),
          torso: -90,
          hands: [{ to: p(9, 10) }, { to: p(23, 10) }],
          feet: [
            [92, 92],
            [88, 88],
          ],
          toes: 'point',
          pin: 'hand',
        }),
      },
      {
        hold: 4,
        pose: figure({
          hip: p(16, 17),
          torso: -90,
          hands: [
            [180, 180],
            [0, 0],
          ],
          feet: [
            [92, 92],
            [88, 88],
          ],
          toes: 'point',
          pin: 'hand',
        }),
      },
    ],
  },
};
