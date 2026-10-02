/**
 * The exercise-animation figure (PLAN 6.4, ADR-053): a 2D side-view stick figure defined by one
 * position and joint angles, so a pose is a few numbers and an animation is a list of poses.
 * Plain math, no React; rasterizing lives in `figureRaster.ts`.
 *
 * Coordinates are grid cells (x right, y down) on a {@link FIGURE_GRID} square. Angles are degrees
 * in screen space: 0 points right (the way the figure faces), 90 down, 180 left, -90 up. Every
 * angle is absolute (not relative to the parent bone) and interpolates along the shorter arc, so
 * a full turn (a roll) needs keyframes less than 180° apart.
 */

/** The figure grid is this many cells square. */
export const FIGURE_GRID = 32;

/** Bone lengths in cells. The figure stands ~22 cells tall, so a hang fits under a bar. */
export const BONES = {
  torso: 7,
  /** From the top of the torso (shoulders) to the head's centre. */
  neck: 3.4,
  headRadius: 2.7,
  upperArm: 4,
  forearm: 3.6,
  thigh: 5,
  shin: 5,
  foot: 1.5,
} as const;

export interface Point {
  x: number;
  y: number;
}

/** Upper bone, lower bone: [upper arm, forearm] or [thigh, shin], absolute angles in degrees. */
export type Limb = readonly [number, number];

/** Joints a pose can be pinned by (`anchor`) and the rasterizer draws between. */
export const JOINTS = [
  'hip',
  'neck',
  'head',
  'elbow',
  'hand',
  'knee',
  'ankle',
  'toe',
  'elbowFar',
  'handFar',
  'kneeFar',
  'ankleFar',
  'toeFar',
] as const;
export type Joint = (typeof JOINTS)[number];

export type Joints = Readonly<Record<Joint, Point>>;

export interface Pose {
  /** Where the `anchor` joint is (default: the hip). */
  at: Point;
  /** The joint `at` positions: pin the hands to a bar or the feet to the floor. */
  anchor?: Joint;
  /** Hip → shoulders. Standing is -90. */
  torso: number;
  /** Shoulders → head; defaults to the torso's angle. */
  head?: number;
  /** Near arm, far arm (the far one is drawn behind in a darker shade). */
  arms: readonly [Limb, Limb];
  /** Near leg, far leg. */
  legs: readonly [Limb, Limb];
  /** Foot angles relative to the shin: `flex` (90°, standing) or `point` (in line, holds). */
  feet?: 'flex' | 'point';
}

const RADIANS = Math.PI / 180;
/** A flexed foot points 90° counterclockwise from its shin (forward when standing). */
const FLEXED_FOOT = -90;

function step(from: Point, angle: number, length: number): Point {
  return {
    x: from.x + Math.cos(angle * RADIANS) * length,
    y: from.y + Math.sin(angle * RADIANS) * length,
  };
}

function footAngle(pose: Pose, shin: number): number {
  return pose.feet === 'point' ? shin : shin + FLEXED_FOOT;
}

/** Every joint of `pose` with its hip at `hip` (forward kinematics). */
function jointsFromHip(pose: Pose, hip: Point): Joints {
  const neck = step(hip, pose.torso, BONES.torso);
  const head = step(neck, pose.head ?? pose.torso, BONES.neck);
  const [arm, armFar] = pose.arms;
  const [leg, legFar] = pose.legs;
  const elbow = step(neck, arm[0], BONES.upperArm);
  const elbowFar = step(neck, armFar[0], BONES.upperArm);
  const knee = step(hip, leg[0], BONES.thigh);
  const kneeFar = step(hip, legFar[0], BONES.thigh);
  const ankle = step(knee, leg[1], BONES.shin);
  const ankleFar = step(kneeFar, legFar[1], BONES.shin);
  return {
    hip,
    neck,
    head,
    elbow,
    hand: step(elbow, arm[1], BONES.forearm),
    elbowFar,
    handFar: step(elbowFar, armFar[1], BONES.forearm),
    knee,
    ankle,
    toe: step(ankle, footAngle(pose, leg[1]), BONES.foot),
    kneeFar,
    ankleFar,
    toeFar: step(ankleFar, footAngle(pose, legFar[1]), BONES.foot),
  };
}

/** Where the hip of `pose` is once its anchor joint sits at `pose.at`. */
export function hipOf(pose: Pose): Point {
  const anchor = pose.anchor ?? 'hip';
  if (anchor === 'hip') return pose.at;
  const offset = jointsFromHip(pose, { x: 0, y: 0 })[anchor];
  return { x: pose.at.x - offset.x, y: pose.at.y - offset.y };
}

/** Every joint of `pose` in grid cells. */
export function jointsOf(pose: Pose): Joints {
  return jointsFromHip(pose, hipOf(pose));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const HALF_TURN = 180;
const FULL_TURN = 360;

/** Interpolates an angle along the shorter way round (170° → -170° passes 180°, not 0°). */
export function lerpAngle(a: number, b: number, t: number): number {
  const delta = ((((b - a) % FULL_TURN) + FULL_TURN + HALF_TURN) % FULL_TURN) - HALF_TURN;
  return a + delta * t;
}

function lerpLimb(a: Limb, b: Limb, t: number): Limb {
  return [lerpAngle(a[0], b[0], t), lerpAngle(a[1], b[1], t)];
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/**
 * The pose `t` (0–1) of the way from `a` to `b`. Angles take the shorter arc. When both poses pin
 * the same joint, that joint moves in a straight line (hands stay on the bar); otherwise the hip
 * does. The feet switch halfway.
 */
export function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const sameAnchor = (a.anchor ?? 'hip') === (b.anchor ?? 'hip');
  const shape = {
    torso: lerpAngle(a.torso, b.torso, t),
    head: lerpAngle(a.head ?? a.torso, b.head ?? b.torso, t),
    arms: [lerpLimb(a.arms[0], b.arms[0], t), lerpLimb(a.arms[1], b.arms[1], t)] as const,
    legs: [lerpLimb(a.legs[0], b.legs[0], t), lerpLimb(a.legs[1], b.legs[1], t)] as const,
    feet: t < 0.5 ? a.feet : b.feet,
  };
  if (sameAnchor) return { ...shape, anchor: a.anchor, at: lerpPoint(a.at, b.at, t) };
  return { ...shape, at: lerpPoint(hipOf(a), hipOf(b), t) };
}

/** Smoothstep: the figure eases into and out of each keyframe instead of moving like a robot. */
export function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Two-bone inverse kinematics for authoring: the [upper, lower] angles of a limb from `start`
 * (shoulder or hip) towards `end` (hand or foot). `bend` picks the side of the middle joint: +1
 * turns the upper bone clockwise from the start→end line (elbows behind in a push-up), -1
 * counterclockwise (knees forward when standing). An end out of reach straightens the limb
 * towards it.
 */
export function solveLimb(
  start: Point,
  end: Point,
  upper: number,
  lower: number,
  bend: 1 | -1,
): Limb {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const reach = Math.min(Math.hypot(dx, dy), upper + lower);
  const direction = Math.atan2(dy, dx) / RADIANS;
  if (reach === 0) return [direction, direction + 180];
  const cosA = (upper * upper + reach * reach - lower * lower) / (2 * upper * reach);
  const a = Math.acos(Math.min(1, Math.max(-1, cosA))) / RADIANS;
  const upperAngle = direction + bend * a;
  const elbow = step(start, upperAngle, upper);
  const target = step(start, direction, reach);
  const lowerAngle = Math.atan2(target.y - elbow.y, target.x - elbow.x) / RADIANS;
  return [upperAngle, lowerAngle];
}
