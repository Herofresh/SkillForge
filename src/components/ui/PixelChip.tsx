import { Pressable, StyleSheet, View } from 'react-native';

import { Border, Frames, Spacing, TOUCH_TARGET } from '../theme';

import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `checkbox` for multi-select (equipment tags), `tab` for picking one (branch filter). */
  role?: 'checkbox' | 'tab';
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * A selectable pixel tag: stone when off, gold-lined with a check when on. At least 48 dp tall; the
 * state is announced (checked / selected), not only shown by color.
 */
export function PixelChip({
  label,
  selected,
  onPress,
  role = 'checkbox',
  accessibilityLabel,
  testID,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={role === 'checkbox' ? { checked: selected } : { selected }}>
      {({ pressed }) => (
        <PixelFrame
          frame={selected ? Frames.selected : Frames.stone}
          pressed={pressed}
          padding={Spacing.xs}>
          <View style={styles.row}>
            {selected && <PixelIcon name="check" />}
            <PixelText variant="small" tone={selected ? 'gold' : 'text'}>
              {label}
            </PixelText>
          </View>
        </PixelFrame>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    // Frame lines (2 × 2 lines of 2 dp) + padding (2 × 4 dp) + this = at least TOUCH_TARGET.
    minHeight: TOUCH_TARGET - 2 * Spacing.xs - 4 * Border.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
});
