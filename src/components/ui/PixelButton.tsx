import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ButtonStyles, Colors, Frames, Spacing, TOUCH_TARGET, type ButtonVariant } from '../theme';

import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';
import type { IconName } from './icons';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  /** Screen-reader label when it should say more than `label`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A pixel button. Pressing it drops the face into its shadow (hard 4 dp travel), like a 16-bit menu
 * button. At least 48 dp tall; disabled buttons lose the accent and the shadow.
 */
export function PixelButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: Props) {
  const look = ButtonStyles[variant];
  // Icons keep their colors on stone; on a colored fill (gold, blood) they take the text color.
  const iconTint = disabled ? Colors.textMuted : variant === 'secondary' ? undefined : look.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={style}>
      {({ pressed }) => (
        <PixelFrame
          frame={disabled ? Frames.stone : look.frame}
          pressed={pressed && !disabled}
          shadow={!disabled}
          padding={Spacing.sm}>
          <View style={styles.row}>
            {icon && <PixelIcon name={icon} tint={iconTint} />}
            <PixelText
              variant="heading"
              color={disabled ? Colors.textMuted : look.text}
              align="center">
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
    // Frame lines (2 × 2 dp) + padding (2 × 8 dp) + this = at least TOUCH_TARGET.
    minHeight: TOUCH_TARGET - 2 * Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
});
