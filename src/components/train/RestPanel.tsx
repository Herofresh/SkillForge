import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatCountdown } from '@/domain/format';
import { restCue, type SeenReading } from '@/domain/setTimer';
import { restSecondsLeft, type ActiveSession } from '@/domain/train';

import { Spacing } from '../theme';
import { buzz } from '../timer/vibration';
import { PixelButton, PixelFrame, PixelIcon, PixelText, useNow } from '../ui';

type Props = {
  session: ActiveSession;
  onSkip: () => void;
};

/**
 * The simple rest countdown after a set (PLAN 4.4), from the stored `restEndsAt` (so it survives a
 * restart). Advisory: logging the next set early is always possible, and starting the exercise
 * timer ends it (PLAN 5.4). When the countdown reaches zero on screen, the phone buzzes (PLAN 5.8,
 * ADR-044); a rest that ended while the app was away stays quiet. Mount it with a key per rest so
 * the clock starts fresh.
 */
export function RestPanel({ session, onSkip }: Props) {
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
  return (
    <PixelFrame variant="rune" contentStyle={styles.content} testID="rest-panel">
      <View style={styles.row}>
        <PixelIcon name="potion" />
        <PixelText variant="label" tone="rune" style={styles.label}>
          Rest
        </PixelText>
        <PixelText
          variant="display"
          accessibilityLabel={`Rest: ${seconds} seconds left`}
          testID="rest-countdown">
          {formatCountdown(seconds)}
        </PixelText>
      </View>
      <PixelButton label="Skip rest" variant="secondary" onPress={onSkip} testID="skip-rest" />
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
