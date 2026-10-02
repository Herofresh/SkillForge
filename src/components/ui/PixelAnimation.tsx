import { useEffect, useMemo } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { ResolvedAnimation } from '@/data/animations';
import { FIGURE_GRID } from '@/lib/figure';
import { animationFrames, FRAME_MS, stillFrame } from '@/lib/figureAnimation';
import { gridPaths, parsePixelGrid } from '@/lib/pixelGrid';

import { Palette } from '../palette';

import { FIGURE_COLORS } from './figurePalette';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Role = keyof typeof FIGURE_COLORS;
/** Paint order of the roles inside one frame (each role is one path; cells never overlap). */
const ROLES = Object.keys(FIGURE_COLORS) as Role[];
/** react-native-svg wants a non-empty path; a move draws nothing. */
const EMPTY_PATH = 'M0 0';

/** Per role, the path of every frame of the loop. */
type FramePaths = Readonly<Record<Role, readonly string[]>>;

const loopCache = new Map<string, FramePaths>();
const stillCache = new Map<string, FramePaths>();

function toPaths(frames: readonly string[][]): FramePaths {
  const perFrame = frames.map((rows) => gridPaths(parsePixelGrid(rows)));
  const out = {} as Record<Role, string[]>;
  for (const role of ROLES) out[role] = perFrame.map((paths) => paths[role] ?? EMPTY_PATH);
  return out;
}

/** Frames are pure functions of the data, so each animation is rasterized once per app run. */
function pathsFor(animation: ResolvedAnimation, still: boolean): FramePaths {
  const cache = still ? stillCache : loopCache;
  let paths = cache.get(animation.key);
  if (paths === undefined) {
    paths = toPaths(
      still ? [stillFrame(animation.animation)] : animationFrames(animation.animation),
    );
    cache.set(animation.key, paths);
  }
  return paths;
}

function RolePath({
  role,
  frames,
  frame,
}: {
  role: Role;
  frames: readonly string[];
  frame: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    d: frames[Math.floor(frame.value) % frames.length],
  }));
  return <AnimatedPath fill={Palette[FIGURE_COLORS[role]]} animatedProps={animatedProps} />;
}

type Props = {
  /** What to play: `animationFor(node)` from `@/data/animations`. */
  animation: ResolvedAnimation;
  /** Size in dp; a multiple of 32 keeps every cell a whole number of dp (64, 96, 128). */
  size?: number;
  testID?: string;
};

/**
 * A looping pixel-art figure doing the exercise (PLAN 6.4, ADR-053): the frames of its animation
 * as one small SVG whose paths switch frame on the UI thread (stepped, like sprite frames, no
 * React re-render). With reduce motion it shows the still keyframe. Decorative: the description
 * next to it says the same in words.
 */
export function PixelAnimation({ animation, size = 128, testID }: Props) {
  const reduceMotion = useReducedMotion();
  const paths = useMemo(() => pathsFor(animation, reduceMotion), [animation, reduceMotion]);
  const count = paths[ROLES[0]].length;
  const frame = useSharedValue(0);

  useEffect(() => {
    frame.value = 0;
    if (count < 2) return;
    // A linear 0 → count ramp floored to whole frames: each frame holds FRAME_MS, then jumps.
    frame.value = withRepeat(
      withTiming(count, { duration: count * FRAME_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(frame);
  }, [frame, count, animation.key]);

  return (
    <Svg
      testID={testID}
      width={size}
      height={size}
      viewBox={`0 0 ${FIGURE_GRID} ${FIGURE_GRID}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {ROLES.map((role) => (
        <RolePath key={role} role={role} frames={paths[role]} frame={frame} />
      ))}
    </Svg>
  );
}
