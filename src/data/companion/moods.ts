/**
 * The companion's animations (PLAN 6.10, ADR-059): short JRPG-style frame loops built from the
 * body's frame anchors. Happy cheers and hops with the weapon raised, content breathes, waiting
 * looks left and right and taps a foot, sad sits with its head down and its weapon on the ground
 * (slower). Plus the victory pose (Train summary) and a wave (a tap on the companion). No mood ever
 * takes anything away; it only changes the pose.
 */
import type { CompanionMood } from '@/domain/companion';

import { shifted, STAND, type BodyFrame } from './body';

/** How the class weapon is shown in a frame. */
export type WeaponPose = 'held' | 'raised' | 'ground' | 'none';

export interface SpriteFrame {
  body: BodyFrame;
  weapon: WeaponPose;
  /** How many frame steps this frame stays (sprite timing). */
  hold: number;
}

export type CompanionAnimation = 'victory' | 'wave' | CompanionMood;

const CHEER: BodyFrame = { ...STAND, arms: ['up', 'up'], face: 'smile' };

const SIT: BodyFrame = {
  head: { x: 9, y: 16 },
  torso: { x: 11, y: 27 },
  arms: ['hug', 'hug'],
  legs: 'sit',
  legsAt: { x: 10, y: 33 },
  face: 'down',
};

const VICTORY: BodyFrame = { ...STAND, arms: ['down', 'up'], face: 'smile' };

export const COMPANION_ANIMATIONS: Readonly<Record<CompanionAnimation, readonly SpriteFrame[]>> = {
  happy: [
    { body: CHEER, weapon: 'raised', hold: 2 },
    { body: { ...shifted(CHEER, -2, -2), legs: 'hop' }, weapon: 'raised', hold: 2 },
    { body: CHEER, weapon: 'raised', hold: 1 },
    { body: shifted(CHEER, 1), weapon: 'raised', hold: 1 },
  ],
  content: [
    { body: STAND, weapon: 'held', hold: 4 },
    { body: shifted(STAND, 1), weapon: 'held', hold: 3 },
  ],
  waiting: [
    { body: { ...STAND, face: 'left' }, weapon: 'held', hold: 4 },
    { body: { ...STAND, face: 'right' }, weapon: 'held', hold: 4 },
    { body: { ...STAND, legs: 'tap' }, weapon: 'held', hold: 2 },
    { body: STAND, weapon: 'held', hold: 2 },
  ],
  sad: [
    { body: SIT, weapon: 'ground', hold: 6 },
    { body: { ...SIT, head: { x: SIT.head.x, y: SIT.head.y + 1 } }, weapon: 'ground', hold: 6 },
  ],
  victory: [
    { body: VICTORY, weapon: 'raised', hold: 3 },
    { body: shifted(VICTORY, -1), weapon: 'raised', hold: 3 },
  ],
  wave: [
    { body: { ...STAND, arms: ['up', 'down'], face: 'smile' }, weapon: 'held', hold: 2 },
    { body: { ...STAND, arms: ['out', 'down'], face: 'smile' }, weapon: 'held', hold: 2 },
    { body: { ...STAND, arms: ['up', 'down'], face: 'smile' }, weapon: 'held', hold: 2 },
    { body: { ...STAND, arms: ['out', 'down'], face: 'smile' }, weapon: 'held', hold: 2 },
  ],
};
