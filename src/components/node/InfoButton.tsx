import { Pressable, StyleSheet } from 'react-native';

import { Spacing, TOUCH_TARGET } from '../theme';
import { PixelFrame, PixelIcon } from '../ui';

type Props = {
  /** The exercise it explains: the screen reader says "About <name>". */
  name: string;
  onPress: () => void;
  testID?: string;
};

/**
 * The "i" that opens the exercise info sheet (PLAN 6.2): the rune "i" icon on a small raised
 * pixel face that drops into its shadow when pressed (like `PixelButton`), centred in a full
 * 48 dp touch target so it fits on a tile or card header.
 */
export function InfoButton({ name, onPress, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`About ${name}`}
      accessibilityHint="Shows what the exercise is and its cues"
      style={styles.target}
      testID={testID}>
      {({ pressed }) => (
        <PixelFrame variant="raised" pressed={pressed} padding={Spacing.xs}>
          <PixelIcon name="info" />
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
