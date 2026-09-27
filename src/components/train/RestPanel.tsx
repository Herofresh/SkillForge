import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatCountdown } from '@/domain/format';
import { restSecondsLeft, type ActiveSession } from '@/domain/train';
import { MS_PER_SECOND } from '@/lib/time';

import { Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelText } from '../ui';

/**
 * The screen clock while `active`: re-renders once a second (the countdown's only timer). Mount the
 * panel with a key per rest so the clock starts fresh.
 */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

type Props = {
  session: ActiveSession;
  onSkip: () => void;
};

/**
 * The simple rest countdown after a set (PLAN 4.4), from the stored `restEndsAt` (so it survives a
 * restart). Advisory: logging the next set early is always possible. Full timers come later.
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
