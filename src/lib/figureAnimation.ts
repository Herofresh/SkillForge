/**
 * Exercise animations as data (PLAN 6.4, ADR-053): 1–4 keyframe poses and the props they use,
 * turned into a fixed list of stepped pixel frames. Plain functions, no React.
 */
import { ease, interpolatePose, type Pose } from './figure';
import { rasterizePose, type Prop } from './figureRaster';

export interface Keyframe {
  pose: Pose;
  /** Extra frames to stay in this pose (holds, the top of a rep). */
  hold?: number;
  /** Frames for the move to the next keyframe (a slow negative); default the animation's. */
  steps?: number;
}

export interface FigureAnimation {
  props: readonly Prop[];
  /** 1–4 poses; the animation moves through them and loops back to the first. */
  keyframes: readonly Keyframe[];
  /** Frames per move from one keyframe to the next, the keyframe itself included. */
  steps?: number;
  /** Which keyframe is the still image (reduce motion); default the first. */
  still?: number;
}

export const MAX_KEYFRAMES = 4;
export const DEFAULT_STEPS = 3;
/** Each frame shows this long: slow enough to read as sprite frames, fast enough to move. */
export const FRAME_MS = 160;

/** The poses of every frame of one loop, in order. */
export function framePoses(animation: FigureAnimation): Pose[] {
  const { keyframes } = animation;
  const poses: Pose[] = [];
  keyframes.forEach((keyframe, index) => {
    for (let h = 0; h <= (keyframe.hold ?? 0); h += 1) poses.push(keyframe.pose);
    if (keyframes.length < 2) return;
    const steps = keyframe.steps ?? animation.steps ?? DEFAULT_STEPS;
    const next = keyframes[(index + 1) % keyframes.length].pose;
    for (let s = 1; s < steps; s += 1) {
      poses.push(interpolatePose(keyframe.pose, next, ease(s / steps)));
    }
  });
  return poses;
}

/** Every frame of one loop as pixel-grid rows (src/lib/pixelGrid.ts format). */
export function animationFrames(animation: FigureAnimation): string[][] {
  return framePoses(animation).map((pose) => rasterizePose(pose, animation.props));
}

/** The still image shown instead of the loop when motion is reduced. */
export function stillFrame(animation: FigureAnimation): string[] {
  const keyframe = animation.keyframes[animation.still ?? 0] ?? animation.keyframes[0];
  return rasterizePose(keyframe.pose, animation.props);
}
