import { StyleSheet, View } from 'react-native';

import { formatCountdown } from '@/domain/format';
import { restSecondsLeft, type ActiveSession } from '@/domain/train';

import { Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelText, useNow } from '../ui';

type Props = {
  session: ActiveSession;
  onSkip: () => void;
};

/**
 * The simple rest countdown after a set (PLAN 4.4), from the stored `restEndsAt` (so it survives a
 * restart). Advisory: logging the next set early is always possible, and starting the exercise
 * timer ends it (PLAN 5.4). Mount it with a key per rest so the clock starts fresh.
 */
export function RestPanel({ session, onSkip }: Props) {
  const now = useNow(session.restEndsAt !== undefined);
  const seconds = restSecondsLeft(session, now);
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
