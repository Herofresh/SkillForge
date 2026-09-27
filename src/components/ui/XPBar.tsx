import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '../theme';

import { PixelText } from './PixelText';
import { SegmentedBar } from './SegmentedBar';

type Props = {
  /** Progress to the next level, 0–1 (computed by the caller from the domain). */
  fraction: number;
  /** e.g. "120 / 200 XP". */
  valueText?: string;
  label?: string;
  segments?: number;
  color?: string;
  testID?: string;
};

const DEFAULT_SEGMENTS = 10;

/** Segmented XP bar with a caps label and an optional value, announced as a progress bar. */
export function XPBar({
  fraction,
  valueText,
  label = 'XP',
  segments = DEFAULT_SEGMENTS,
  color = Colors.gold,
  testID,
}: Props) {
  const percent = Math.round(Math.min(Math.max(fraction, 0), 1) * 100);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: valueText }}
      style={styles.container}>
      <View style={styles.header}>
        <PixelText variant="label" tone="gold">
          {label}
        </PixelText>
        {valueText !== undefined && (
          <PixelText variant="label" tone="textMuted">
            {valueText}
          </PixelText>
        )}
      </View>
      <SegmentedBar fraction={fraction} segments={segments} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
