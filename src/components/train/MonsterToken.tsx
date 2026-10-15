import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  BEATEN_COLORS,
  HIT_COLORS,
  MONSTER_ART,
  MONSTER_COLORS,
  MONSTER_SIZE,
  monsterFrames,
  type MonsterColors,
} from '@/data/monsters';
import type { FoeView } from '@/domain/battleView';
import type { FoeState, MonsterKind } from '@/domain/monsters';

import { Border, Colors, Motion, Spacing, TypeScale } from '../theme';
import { PixelText } from '../ui';
import { PixelSprite } from '../ui/PixelSprite';

/** dp per monster pixel: a row of foes (Battle, Classic) or the one being fought. */
const SCALES = { small: 3, large: 5 } as const;
export type TokenSize = keyof typeof SCALES;

const BEATEN: readonly FoeState[] = ['defeated', 'overkill', 'escaped'];
const GRID = { width: MONSTER_SIZE, height: MONSTER_SIZE };
/** An escaped foe is dimmer than a beaten one. */
const ESCAPED_OPACITY = 0.5;
/** Below this share of hit points the bar turns ember. */
const LOW_HP = 0.5;
const HP_BAR_HEIGHT = 4;

const EDGE: Readonly<Record<FoeState, string>> = {
  fresh: Colors.border,
  fighting: Colors.rune,
  overkill: Colors.gold,
  defeated: Colors.success,
  wounded: Colors.ember,
  escaped: Colors.border,
};
const COUNT_TONE = {
  fresh: 'textMuted',
  fighting: 'rune',
  overkill: 'gold',
  defeated: 'success',
  wounded: 'ember',
  escaped: 'textMuted',
} as const satisfies Record<FoeState, string>;

type Props = {
  kind: MonsterKind;
  foe: FoeView;
  size?: TokenSize;
  /** Without it the token only shows (Classic's row). */
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityHint?: string;
  disabled?: boolean;
  testID?: string;
};

function Sprite({
  kind,
  colors,
  palette,
  still,
  scale,
}: {
  kind: MonsterKind;
  colors: MonsterColors;
  palette: string;
  still: boolean;
  scale: number;
}) {
  return (
    <PixelSprite
      cacheKey={`monster:${kind}:${palette}:${still ? 'still' : 'loop'}`}
      frames={() => (still ? [MONSTER_ART[kind]] : monsterFrames(kind))}
      colors={colors}
      scale={scale}
      grid={GRID}
    />
  );
}

/**
 * One set as a monster (PLAN 7.9, ADR-071): the foe of the exercise's branch over its hit points
 * and count. Fresh and wounded foes bob, beaten ones turn grey, the one whose hold runs is
 * rune-lined. When its set is logged it flashes white, shakes and the damage floats up; reduce
 * motion shows the new state at once.
 */
export function MonsterToken({
  kind,
  foe,
  size = 'small',
  onPress,
  onLongPress,
  accessibilityHint,
  disabled = false,
  testID,
}: Props) {
  const reduceMotion = useReducedMotion();
  const scale = SCALES[size];
  const beaten = BEATEN.includes(foe.state);
  const logged = foe.actual !== undefined;
  const wasLogged = useRef(logged);
  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  const rise = useSharedValue(1);

  useEffect(() => {
    const hit = logged && !wasLogged.current;
    wasLogged.current = logged;
    if (!hit || reduceMotion) return;
    const step = Motion.foeHitMs / 4;
    const distance = Motion.foeShakeDistance;
    shake.value = withSequence(
      withTiming(distance, { duration: step }),
      withTiming(-distance, { duration: step }),
      withTiming(distance, { duration: step }),
      withTiming(0, { duration: step }),
    );
    flash.value = 1;
    flash.value = withTiming(0, { duration: Motion.foeHitMs });
    rise.value = 0;
    rise.value = withTiming(1, { duration: Motion.foeDamageMs });
  }, [logged, reduceMotion, shake, flash, rise]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const damageStyle = useAnimatedStyle(() => ({
    opacity: 1 - rise.value,
    transform: [{ translateY: -Motion.foeDamageRise * rise.value }],
  }));

  const spriteSize = MONSTER_SIZE * scale;
  const colors = beaten ? BEATEN_COLORS : MONSTER_COLORS[kind];
  const body = (
    <View style={styles.token}>
      <View
        style={[
          styles.frame,
          { borderColor: EDGE[foe.state], width: spriteSize + 2 * Spacing.xs },
          foe.state === 'escaped' && styles.escaped,
        ]}>
        <Animated.View style={shakeStyle}>
          <Sprite
            kind={kind}
            colors={colors}
            palette={beaten ? 'beaten' : 'own'}
            still={beaten || reduceMotion}
            scale={scale}
          />
          <Animated.View style={[styles.overlay, flashStyle]} pointerEvents="none">
            <Sprite kind={kind} colors={HIT_COLORS} palette="hit" still scale={scale} />
          </Animated.View>
        </Animated.View>
        {foe.damage !== undefined && (
          <Animated.View style={[styles.damage, damageStyle]} pointerEvents="none">
            <PixelText variant="label" tone="danger">
              {foe.damage}
            </PixelText>
          </Animated.View>
        )}
      </View>
      <View style={[styles.hpRow, { width: spriteSize + 2 * Spacing.xs }]}>
        <View style={styles.hpTrack}>
          <View
            style={[
              styles.hpFill,
              {
                width: `${Math.round(foe.hp * 100)}%`,
                backgroundColor: foe.hp > LOW_HP ? Colors.success : Colors.ember,
              },
            ]}
          />
        </View>
        <PixelText
          variant="small"
          tone={COUNT_TONE[foe.state]}
          testID={testID && `${testID}-count`}>
          {foe.count}
        </PixelText>
      </View>
    </View>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={foe.spoken} accessibilityRole="image">
        {body}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={foe.spoken}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}>
      {body}
    </Pressable>
  );
}

/** The ghost after a row of foes: tap for one more (an extra set). */
export function AddFoeToken({
  size = 'small',
  onPress,
  disabled = false,
  accessibilityLabel,
  testID,
}: {
  size?: TokenSize;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
}) {
  const spriteSize = MONSTER_SIZE * SCALES[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}>
      <View style={styles.token}>
        <View
          style={[
            styles.frame,
            styles.ghost,
            { width: spriteSize + 2 * Spacing.xs, height: spriteSize + 2 * Spacing.xs },
          ]}>
          <PixelText variant="display" tone="textMuted">
            +
          </PixelText>
        </View>
        <View style={styles.countSpace} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  token: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    borderWidth: Border.line,
    backgroundColor: Colors.surface,
  },
  ghost: {
    borderStyle: 'dashed',
    backgroundColor: Colors.background,
  },
  escaped: {
    opacity: ESCAPED_OPACITY,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  damage: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  hpTrack: {
    flex: 1,
    height: HP_BAR_HEIGHT,
    backgroundColor: Colors.border,
  },
  hpFill: {
    height: HP_BAR_HEIGHT,
  },
  /** As tall as a foe's count line, so the ghost lines up with the foes. */
  countSpace: {
    height: TypeScale.small.lineHeight,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
