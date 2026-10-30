import { Pressable, StyleSheet } from 'react-native';

import { t } from '@/i18n';

import { Spacing, TOUCH_TARGET } from '../theme';
import { PixelFrame, PixelIcon } from '../ui';

type Props = {
  /** The exercise it swaps: the screen reader says "Swap <name>". */
  name: string;
  onPress: () => void;
  testID?: string;
};

/**
 * The quick "swap" on an exercise card (PLAN 7.8 FB-16, ADR-081): the swap icon on a small raised
 * pixel face like `InfoButton`, in a full 48 dp touch target. Opens the swap sheet in the plan
 * preview and in the live session (Classic and Battle).
 */
export function SwapButton({ name, onPress, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('Swap {name}', { name })}
      accessibilityHint={t('Shows other exercises to do instead')}
      style={styles.target}
      testID={testID}>
      {({ pressed }) => (
        <PixelFrame variant="raised" pressed={pressed} padding={Spacing.xs}>
          <PixelIcon name="swap" />
        </PixelFrame>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
