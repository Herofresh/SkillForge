import { useReducedMotion } from 'react-native-reanimated';

import type { ResolvedAnimation } from '@/data/animations';
import { FIGURE_GRID } from '@/lib/figure';
import { animationFrames, stillFrame } from '@/lib/figureAnimation';

import { Palette } from '../palette';

import { FIGURE_COLORS } from './figurePalette';
import { PixelSprite } from './PixelSprite';

const COLORS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FIGURE_COLORS).map(([role, color]) => [role, Palette[color]]),
);

type Props = {
  /** What to play: `animationFor(node)` from `@/data/animations`. */
  animation: ResolvedAnimation;
  /** Size in dp; a multiple of 32 keeps every cell a whole number of dp (64, 96, 128). */
  size?: number;
  testID?: string;
};

/**
 * A looping pixel-art figure doing the exercise (PLAN 6.4, ADR-053): the frames of its animation
 * played by `PixelSprite` (stepped, on the UI thread). With reduce motion it shows the still
 * keyframe. Decorative: the description next to it says the same in words.
 */
export function PixelAnimation({ animation, size = 128, testID }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <PixelSprite
      testID={testID}
      cacheKey={`${reduceMotion ? 'still' : 'loop'}:${animation.key}`}
      frames={() =>
        reduceMotion ? [stillFrame(animation.animation)] : animationFrames(animation.animation)
      }
      colors={COLORS}
      scale={size / FIGURE_GRID}
      grid={{ width: FIGURE_GRID, height: FIGURE_GRID }}
    />
  );
}
