import { useEffect, useMemo } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { FRAME_MS } from '@/lib/figureAnimation';
import { gridPaths, parsePixelGrid } from '@/lib/pixelGrid';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** react-native-svg wants a non-empty path; a move draws nothing. */
const EMPTY_PATH = 'M0 0';

/** Per role, the path of every frame of the loop. */
type FramePaths = Readonly<Record<string, readonly string[]>>;

const cache = new Map<string, FramePaths>();
/** Enough for every exercise and companion loop a session shows; old ones are dropped first. */
const CACHE_LIMIT = 200;

function toPaths(frames: readonly (readonly string[])[], roles: readonly string[]): FramePaths {
  const perFrame = frames.map((rows) => gridPaths(parsePixelGrid(rows)));
  const out: Record<string, string[]> = {};
  for (const role of roles) out[role] = perFrame.map((paths) => paths[role] ?? EMPTY_PATH);
  return out;
}

function pathsFor(
  key: string,
  frames: () => readonly (readonly string[])[],
  roles: readonly string[],
): FramePaths {
  let paths = cache.get(key);
  if (paths === undefined) {
    paths = toPaths(frames(), roles);
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
    cache.set(key, paths);
  }
  return paths;
}

function RolePath({
  fill,
  frames,
  frame,
}: {
  fill: string;
  frames: readonly string[];
  frame: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    d: frames[Math.floor(frame.value) % frames.length],
  }));
  return <AnimatedPath fill={fill} animatedProps={animatedProps} />;
}

type Props = {
  /** Identifies the frames for the cache: the same key must always mean the same frames. */
  cacheKey: string;
  /** Builds the frames (grid rows each); only called when `cacheKey` is not cached yet. */
  frames: () => readonly (readonly string[])[];
  /** Fill color per role; a role without one is not drawn. */
  colors: Readonly<Record<string, string>>;
  /** dp per grid cell; a whole number keeps every cell crisp. */
  scale: number;
  /** Grid size in cells (32 × 32 for the exercise figures, 32 × 40 for the companion). */
  grid: { width: number; height: number };
  testID?: string;
};

/**
 * Pixel-art frames as one small SVG whose paths switch frame on the UI thread (stepped sprite
 * frames, `FRAME_MS` each, no React re-render). Shared by the exercise animations (PLAN 6.4) and
 * the companion (PLAN 6.10). One frame stays still. Decorative for screen readers.
 */
export function PixelSprite({ cacheKey, frames, colors, scale, grid, testID }: Props) {
  const roles = useMemo(() => Object.keys(colors), [colors]);
  // `frames` is a builder; the key says when its output changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const paths = useMemo(() => pathsFor(cacheKey, frames, roles), [cacheKey, roles]);
  const count = paths[roles[0]]?.length ?? 1;
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
  }, [frame, count, cacheKey]);

  return (
    <Svg
      testID={testID}
      width={grid.width * scale}
      height={grid.height * scale}
      viewBox={`0 0 ${grid.width} ${grid.height}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {roles.map((role) => (
        <RolePath
          key={role}
          fill={colors[role]}
          frames={paths[role] ?? [EMPTY_PATH]}
          frame={frame}
        />
      ))}
    </Svg>
  );
}
