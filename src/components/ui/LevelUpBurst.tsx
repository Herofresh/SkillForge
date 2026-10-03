import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Colors, Motion, PIXEL, Spacing } from '../theme';

import { PixelText } from './PixelText';

type Props = {
  title?: string;
  subtitle?: string;
  /** Change it to replay the burst (e.g. the id of the level-up being shown). */
  playKey?: string | number;
  onDone?: () => void;
  testID?: string;
};

/** One vocabulary for every reveal moment (PLAN 5.2, ADR-038). */
export const BURST_TITLES = {
  levelUp: 'LEVEL UP!',
  unlocked: 'UNLOCKED!',
  testedOut: 'TESTED OUT!',
  questComplete: 'QUEST COMPLETE',
  /** A hero class reached its tier I (PLAN 6.9). */
  classUnlocked: 'CLASS UNLOCKED!',
  /** A hero class reached a higher tier (PLAN 6.9). */
  classTierUp: 'TIER UP!',
} as const;

const PARTICLE_COUNT = 12;
const PARTICLE_SIZE = 4 * PIXEL;
const PARTICLE_COLORS = [Colors.gold, Colors.rune, Colors.goldLight, Colors.ember];
const TITLE_START_SCALE = 0.6;

function Particle({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const angle = (2 * Math.PI * index) / PARTICLE_COUNT;
  // Alternate near and far particles so the burst reads as a ring of pixels, not a circle.
  const reach = Motion.burstDistance * (index % 2 === 0 ? 1 : 0.65);
  const dx = Math.cos(angle) * reach;
  const dy = Math.sin(angle) * reach;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateX: dx * progress.value }, { translateY: dy * progress.value }],
  }));
  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length] },
        style,
      ]}
    />
  );
}

/**
 * The level-up / unlock moment: a ring of pixels bursts outward in stepped frames while the title
 * pops in. With reduced motion only the title is shown (no movement), and `onDone` fires at once.
 */
export function LevelUpBurst({
  title = BURST_TITLES.levelUp,
  subtitle,
  playKey = 0,
  onDone,
  testID,
}: Props) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      onDone?.();
      return;
    }
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: Motion.burstMs, easing: Easing.steps(Motion.burstSteps) },
      (finished) => {
        if (finished && onDone) scheduleOnRN(onDone);
      },
    );
    // playKey restarts the animation; onDone is a callback, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey, reduceMotion]);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: TITLE_START_SCALE + (1 - TITLE_START_SCALE) * Math.min(progress.value * 2, 1) },
    ],
  }));

  return (
    <View
      testID={testID}
      style={styles.container}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={subtitle ? `${title} ${subtitle}` : title}>
      {/* The ring bursts from the title's centre (PLAN 5.2), not the centre of title + subtitle. */}
      <View>
        {!reduceMotion && (
          <View style={styles.origin} pointerEvents="none">
            {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
              <Particle key={index} index={index} progress={progress} />
            ))}
          </View>
        )}
        <Animated.View style={titleStyle}>
          <PixelText variant="display" align="center">
            {title}
          </PixelText>
        </Animated.View>
      </View>
      {subtitle !== undefined && (
        <PixelText variant="label" tone="rune" align="center">
          {subtitle}
        </PixelText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
  },
  origin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  particle: {
    position: 'absolute',
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    marginLeft: -PARTICLE_SIZE / 2,
    marginTop: -PARTICLE_SIZE / 2,
  },
});
