import { useMemo } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import {
  companionColors,
  companionFrames,
  companionStill,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  type CompanionAnimation,
  type CompanionLook,
  type CompanionOutfit,
} from '@/data/companion';

import { PixelSprite } from '../ui/PixelSprite';

type Props = {
  /** A mood's idle loop, the victory pose or the wave. */
  animation: CompanionAnimation;
  outfit: CompanionOutfit;
  look: CompanionLook;
  /** dp per sprite pixel (the sprite is 32 × 40 pixels). */
  scale?: number;
  testID?: string;
};

const GRID = { width: SPRITE_WIDTH, height: SPRITE_HEIGHT };

/**
 * The companion sprite (PLAN 6.10): a JRPG-style chibi hero in the hero's accessories, class
 * weapon and colours, playing one of its frame loops. Reduce motion shows its first frame.
 * Decorative: the card next to it says the mood in words.
 */
export function CompanionSprite({ animation, outfit, look, scale = 4, testID }: Props) {
  const reduceMotion = useReducedMotion();
  const colors = useMemo(() => companionColors(look), [look]);
  const motion = reduceMotion ? 'still' : 'loop';
  return (
    <PixelSprite
      testID={testID}
      cacheKey={`companion:${motion}:${animation}:${JSON.stringify(outfit)}`}
      frames={() =>
        reduceMotion ? [companionStill(animation, outfit)] : companionFrames(animation, outfit)
      }
      colors={colors}
      scale={scale}
      grid={GRID}
    />
  );
}
