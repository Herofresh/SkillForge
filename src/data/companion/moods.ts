/**
 * The companion's animations (PLAN 6.10 / 6.13, ADR-059 / ADR-061): short JRPG-style frame loops
 * built from the body's frame anchors, heroic rather than bouncy. Happy raises the weapon with a
 * confident flourish, content stands calm with the weapon at the shoulder and shifts its weight
 * (the cloak sways), waiting crosses its arms with the weapon planted beside it and glances
 * around, sad rests on one knee with the head lowered, leaning on the planted weapon (slower;
 * resting, never hurt). Plus the victory pose (Train summary) and a salute with a nod (a tap on
 * the companion). No mood ever takes anything away; it only changes the pose.
 */
import type { CompanionMood } from '@/domain/companion';

import { shifted, STAND, type BodyFrame } from './body';

/**
 * How the class weapon is shown in a frame: `held` upright in the screen-right hand (at the
 * shoulder, or brandished when the arm is up), `lowered` in the hanging hand, point down,
 * `planted` standing on the ground beside the hero, `none` not drawn.
 */
export type WeaponPose = 'held' | 'lowered' | 'planted' | 'none';

export interface SpriteFrame {
  body: BodyFrame;
  weapon: WeaponPose;
  /** How many frame steps this frame stays (sprite timing). */
  hold: number;
}

export type CompanionAnimation = 'victory' | 'wave' | CompanionMood;

/** Calm and ready: the weapon rests at the shoulder. */
const READY: BodyFrame = { ...STAND, arms: ['down', 'shoulder'] };

/** The weapon brandished up and out. */
const RAISE: BodyFrame = { ...STAND, arms: ['down', 'up'], face: 'smirk' };

const CROSSED: BodyFrame = { ...STAND, arms: ['cross', 'cross'], legs: 'shift' };

/** On one knee: the body lowered, the head bowed, the hands resting. */
const KNEEL: BodyFrame = {
  head: { x: 10, y: 11 },
  torso: { x: 10, y: 20 },
  arms: ['down', 'down'],
  legs: 'kneel',
  legsAt: { x: 9, y: 31 },
  face: 'down',
};

const VICTORY: BodyFrame = { ...STAND, arms: ['hip', 'up'], legs: 'wide', face: 'fierce' };

const SALUTE: BodyFrame = { ...STAND, arms: ['salute', 'down'], face: 'smirk' };

const nod = (frame: BodyFrame): BodyFrame => ({
  ...frame,
  head: { x: frame.head.x, y: frame.head.y + 1 },
});

export const COMPANION_ANIMATIONS: Readonly<Record<CompanionAnimation, readonly SpriteFrame[]>> = {
  happy: [
    { body: RAISE, weapon: 'held', hold: 3 },
    { body: { ...shifted(RAISE, -1), sway: 1 }, weapon: 'held', hold: 2 },
    { body: RAISE, weapon: 'held', hold: 2 },
    { body: { ...READY, face: 'smirk' }, weapon: 'held', hold: 2 },
  ],
  content: [
    { body: READY, weapon: 'held', hold: 4 },
    { body: { ...READY, legs: 'shift', sway: 1 }, weapon: 'held', hold: 4 },
    { body: { ...shifted(READY, 1), legs: 'shift', sway: 1 }, weapon: 'held', hold: 3 },
    { body: { ...READY, sway: -1 }, weapon: 'held', hold: 3 },
  ],
  waiting: [
    { body: { ...CROSSED, face: 'left' }, weapon: 'planted', hold: 4 },
    { body: CROSSED, weapon: 'planted', hold: 2 },
    { body: { ...CROSSED, face: 'right', sway: 1 }, weapon: 'planted', hold: 4 },
    { body: { ...CROSSED, sway: -1 }, weapon: 'planted', hold: 2 },
  ],
  sad: [
    { body: KNEEL, weapon: 'planted', hold: 6 },
    { body: { ...shifted(KNEEL, 1), sway: 1 }, weapon: 'planted', hold: 6 },
  ],
  victory: [
    { body: VICTORY, weapon: 'held', hold: 3 },
    { body: { ...shifted(VICTORY, -1), sway: 1 }, weapon: 'held', hold: 3 },
  ],
  wave: [
    { body: SALUTE, weapon: 'lowered', hold: 3 },
    { body: nod(SALUTE), weapon: 'lowered', hold: 2 },
    { body: SALUTE, weapon: 'lowered', hold: 2 },
    { body: nod({ ...STAND, face: 'smirk' }), weapon: 'lowered', hold: 2 },
  ],
};
