/**
 * Helpers for floor work (PLAN 6.4b): stretches, rolls and cartwheels, where a pose is easier to
 * describe by joint positions or by turning a whole shape than by hand and foot targets alone.
 * They return plain `Pose`s, like `figure` in pose.ts.
 */
import { BONES, jointsOf, type Joint, type Limb, type Point, type Pose } from '@/lib/figure';
import { FLOOR_Y } from '@/lib/figureRaster';

const DEGREES = 180 / Math.PI;
/** Drawn half-widths (figureRaster.ts): the torso is thicker than a limb, the head is a disc. */
const TORSO_HALF_WIDTH = 1.8;
const LIMB_HALF_WIDTH = 1.15;
/** How far a resting body may overlap the floor's top row, so it reads as touching it. */
const FLOOR_CONTACT = 0.15;

function angle(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x) * DEGREES;
}

/** A point `length` cells from `from` in the direction of `to`. */
function toward(from: Point, to: Point, length: number): Point {
  const a = angle(from, to) / DEGREES;
  return { x: from.x + Math.cos(a) * length, y: from.y + Math.sin(a) * length };
}

/**
 * A two-bone limb aimed through `mid` (knee or elbow) towards `end` (foot or hand); bone lengths
 * stay fixed, so the end lands near, not exactly on, `end`. For front views, where the IK's
 * single bend direction does not say enough.
 */
export function via(start: Point, mid: Point, end: Point, upper: number): Limb {
  const joint = toward(start, mid, upper);
  return [angle(start, mid), angle(joint, end)];
}

/** A leg from `hip` through `knee` towards `foot`. */
export function legVia(hip: Point, knee: Point, foot: Point): Limb {
  return via(hip, knee, foot, BONES.thigh);
}

/** An arm from the shoulders through `elbow` towards `hand`. */
export function armVia(shoulders: Point, elbow: Point, hand: Point): Limb {
  return via(shoulders, elbow, hand, BONES.upperArm);
}

/** Where the shoulders (and arms) are for a hip and torso angle. */
export function shouldersOf(hip: Point, torso: number): Point {
  return {
    x: hip.x + Math.cos(torso / DEGREES) * BONES.torso,
    y: hip.y + Math.sin(torso / DEGREES) * BONES.torso,
  };
}

/** The same shape turned by `delta` degrees (clockwise on screen) around the hip. */
export function turned(pose: Pose, delta: number): Pose {
  const limb = (l: Limb): Limb => [l[0] + delta, l[1] + delta];
  return {
    ...pose,
    anchor: undefined,
    torso: pose.torso + delta,
    head: (pose.head ?? pose.torso) + delta,
    arms: [limb(pose.arms[0]), limb(pose.arms[1])],
    legs: [limb(pose.legs[0]), limb(pose.legs[1])],
  };
}

function halfWidth(joint: Joint): number {
  if (joint === 'head') return BONES.headRadius;
  if (joint === 'hip' || joint === 'neck') return TORSO_HALF_WIDTH;
  return LIMB_HALF_WIDTH;
}

/** `pose` with its hip at column `hipX`, lowered or raised until its lowest part rests on the floor. */
export function resting(pose: Pose, hipX: number): Pose {
  const shape: Pose = { ...pose, anchor: undefined, at: { x: 0, y: 0 } };
  const joints = jointsOf(shape);
  let hipY = Infinity;
  for (const [joint, point] of Object.entries(joints) as [Joint, Point][]) {
    hipY = Math.min(hipY, FLOOR_Y + FLOOR_CONTACT - halfWidth(joint) - point.y);
  }
  return { ...shape, at: { x: hipX, y: hipY } };
}
