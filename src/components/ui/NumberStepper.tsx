import { StyleSheet, View } from 'react-native';

import { Spacing, TOUCH_TARGET } from '../theme';

import { PixelButton } from './PixelButton';
import { PixelText } from './PixelText';

/** Lines the steppers up under each other at the normal font scale. */
const LABEL_MIN_WIDTH = 56;

type Props = {
  /** What the value is, e.g. "Set 1". Also used in the button labels for screen readers. */
  label: string;
  /** The value as shown, e.g. "30 s" (formatted by the caller from the domain). */
  valueText: string;
  onDecrement: () => void;
  onIncrement: () => void;
  /** e.g. at 0. */
  decrementDisabled?: boolean;
  testID?: string;
};

/** A labelled value with − / + pixel buttons (48 dp each), e.g. one set of a Trial result. */
export function NumberStepper({
  label,
  valueText,
  onDecrement,
  onIncrement,
  decrementDisabled = false,
  testID,
}: Props) {
  return (
    <View style={styles.row} testID={testID}>
      <PixelText variant="label" tone="textMuted" style={styles.label}>
        {label}
      </PixelText>
      <PixelButton
        label="−"
        variant="secondary"
        onPress={onDecrement}
        disabled={decrementDisabled}
        accessibilityLabel={`Less for ${label}`}
        testID={testID && `${testID}-minus`}
        style={styles.button}
      />
      <View
        style={styles.value}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${label}: ${valueText}`}>
        <PixelText variant="heading" align="center" testID={testID && `${testID}-value`}>
          {valueText}
        </PixelText>
      </View>
      <PixelButton
        label="+"
        variant="secondary"
        onPress={onIncrement}
        accessibilityLabel={`More for ${label}`}
        testID={testID && `${testID}-plus`}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    // A minimum, not a fixed width: at a large font scale the label grows instead of clipping.
    minWidth: LABEL_MIN_WIDTH,
  },
  button: {
    minWidth: TOUCH_TARGET + Spacing.md,
  },
  value: {
    flex: 1,
  },
});
