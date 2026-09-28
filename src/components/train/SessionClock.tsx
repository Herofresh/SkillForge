import { StyleSheet, View } from 'react-native';

import { formatClock } from '@/domain/format';
import { elapsedSeconds } from '@/domain/setTimer';

import { Spacing } from '../theme';
import { PixelIcon, PixelText, useNow } from '../ui';

type Props = {
  /** When the session started (ms since the Unix epoch). */
  startedAt: number;
};

/** The live session's elapsed time since its start (PLAN 5.4), ticking once a second. */
export function SessionClock({ startedAt }: Props) {
  const now = useNow(true);
  const seconds = elapsedSeconds(startedAt, now);
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Session time ${formatClock(seconds)}`}
      testID="session-clock">
      <PixelIcon name="hourglass" />
      <PixelText variant="label" tone="rune">
        {formatClock(seconds)}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
