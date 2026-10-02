/**
 * Authoring helpers for the exercise animations (PLAN 6.4, ADR-053): describe a pose by where the
 * hip is, how the torso leans and where hands and feet go; `figure` solves the limb angles
 * (two-bone IK) so the data stays readable. The result is a plain `Pose`.
 */
import {
  BONES,
  jointsOf,
  solveLimb,
  type Joint,
  type Limb,
  type Point,
  type Pose,
} from '@/lib/figure';
import { FLOOR_Y } from '@/lib/figureRaster';

/** A limb as explicit angles, or a target point for the hand/foot (with the elbow/knee side). */
export type LimbSpec = Limb | { to: Point; bend?: 1 | -1 };

export interface FigureSpec {
  hip: Point;
  torso: number;
  head?: number;
  /** Near hand, far hand (defaults to the near one). Elbows default to bend +1 (behind). */
  hands: readonly [LimbSpec, LimbSpec?];
  /** Near foot, far foot (defaults to the near one). Knees default to bend -1 (forward). */
  feet: readonly [LimbSpec, LimbSpec?];
  toes?: 'flex' | 'point';
  /** Pin this joint where it ends up, so moving to the next keyframe keeps it in place. */
  pin?: Joint;
}

/** Row for a hand or foot resting on the floor (the drawn limb ends on the floor's top row). */
export const ON_FLOOR = FLOOR_Y - 1;

/** Shortcut for a point. */
export function p(x: number, y: number): Point {
  return { x, y };
}

const RADIANS = Math.PI / 180;

function solve(spec: LimbSpec, start: Point, upper: number, lower: number, bend: 1 | -1): Limb {
  if (!('to' in spec)) return spec as Limb;
  return solveLimb(start, spec.to, upper, lower, spec.bend ?? bend);
}

/** A pose from hip position, torso angle and hand/foot targets. */
export function figure(spec: FigureSpec): Pose {
  const { hip, torso } = spec;
  const shoulders = {
    x: hip.x + Math.cos(torso * RADIANS) * BONES.torso,
    y: hip.y + Math.sin(torso * RADIANS) * BONES.torso,
  };
  const arm = (limb: LimbSpec) => solve(limb, shoulders, BONES.upperArm, BONES.forearm, 1);
  const leg = (limb: LimbSpec) => solve(limb, hip, BONES.thigh, BONES.shin, -1);
  const [hand, handFar = hand] = spec.hands;
  const [foot, footFar = foot] = spec.feet;
  const pose: Pose = {
    at: hip,
    torso,
    head: spec.head,
    arms: [arm(hand), arm(handFar)],
    legs: [leg(foot), leg(footFar)],
    feet: spec.toes,
  };
  if (spec.pin === undefined) return pose;
  return { ...pose, anchor: spec.pin, at: jointsOf(pose)[spec.pin] };
}
