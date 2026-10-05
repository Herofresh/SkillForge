import { StyleSheet, View } from 'react-native';

import { Spacing } from '../theme';

import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';
import { SegmentedBar } from './SegmentedBar';
import type { IconName } from './icons';

type Props = {
  label: string;
  value: number;
  /** The value that fills the bar (e.g. the highest attribute, for normalising). */
  max: number;
  color: string;
  icon?: IconName;
  segments?: number;
  testID?: string;
};

const DEFAULT_SEGMENTS = 8;
/** Lines the bars up under each other at the normal font scale. */
const LABEL_MIN_WIDTH = 76;

/** A labelled attribute bar: icon, name, a short segmented bar and the value. */
export function StatBar({
  label,
  value,
  max,
  color,
  icon,
  segments = DEFAULT_SEGMENTS,
  testID,
}: Props) {
  const fraction = max > 0 ? value / max : 0;
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
      style={styles.row}>
      {icon && <PixelIcon name={icon} />}
      <PixelText variant="label" style={styles.label}>
        {label}
      </PixelText>
      <View style={styles.bar}>
        <SegmentedBar fraction={fraction} segments={segments} color={color} height={8} />
      </View>
      <PixelText variant="label" color={color} style={styles.value} align="right">
        {value}
      </PixelText>
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
    // A minimum, not a fixed width: at a large font scale the name grows instead of clipping.
    minWidth: LABEL_MIN_WIDTH,
  },
  bar: {
    flex: 1,
  },
  value: {
    minWidth: 32,
  },
});
