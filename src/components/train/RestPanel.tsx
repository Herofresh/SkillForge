import { useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { formatCountdown } from '@/domain/format';
import { restCue, type SeenReading } from '@/domain/setTimer';
import { restSecondsLeft, type ActiveSession } from '@/domain/train';
import { t } from '@/i18n';

import { Spacing } from '../theme';
import { buzz } from '../timer/vibration';
import { PixelButton, PixelFrame, PixelIcon, PixelText, useNow } from '../ui';

type Props = {
  session: ActiveSession;
  onSkip: () => void;
  /**
   * One row (Battle, PLAN 7.9): pinned under the board, so it never pushes the monsters while it
   * comes and goes.
   */
  compact?: boolean;
  /** Around the compact bar (its footer padding); nothing is drawn while not resting. */
  style?: StyleProp<ViewStyle>;
};

/**
 * The simple rest countdown after a set (PLAN 4.4), from the stored `restEndsAt` (so it survives a
 * restart). Advisory: logging the next set early is always possible, and starting the exercise
 * timer ends it (PLAN 5.4). When the countdown reaches zero on screen, the phone buzzes (PLAN 5.8,
 * ADR-044); a rest that ended while the app was away stays quiet. Mount it with a key per rest so
 * the clock starts fresh.
 */
export function RestPanel({ session, onSkip, compact = false, style }: Props) {
  const resting = session.restEndsAt !== undefined;
  const now = useNow(resting);
  const seconds = restSecondsLeft(session, now);
  const lastSeen = useRef<SeenReading<number> | undefined>(undefined);

  useEffect(() => {
    if (!resting) return;
    buzz(restCue(lastSeen.current, seconds, now));
    lastSeen.current = { value: seconds, at: now };
  }, [resting, seconds, now]);

  if (seconds <= 0) return null;
  const countdown = (
    <PixelText
      variant="display"
      accessibilityLabel={t('Rest: {n} seconds left', { n: seconds })}
      testID="rest-countdown">
      {formatCountdown(seconds)}
    </PixelText>
  );
  if (compact) {
    return (
      <View style={style}>
        <PixelFrame variant="rune" testID="rest-panel">
          <View style={styles.row}>
            <PixelIcon name="potion" />
            {countdown}
            <PixelText variant="label" tone="rune" style={styles.label}>
              {t('Rest')}
            </PixelText>
            <PixelButton
              label={t('Skip')}
              variant="secondary"
              onPress={onSkip}
              testID="skip-rest"
            />
          </View>
        </PixelFrame>
      </View>
    );
  }
  return (
    <PixelFrame variant="rune" contentStyle={styles.content} testID="rest-panel">
      <View style={styles.row}>
        <PixelIcon name="potion" />
        <PixelText variant="label" tone="rune" style={styles.label}>
          {t('Rest')}
        </PixelText>
        {countdown}
      </View>
      <PixelButton label={t('Skip rest')} variant="secondary" onPress={onSkip} testID="skip-rest" />
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    flex: 1,
  },
});
