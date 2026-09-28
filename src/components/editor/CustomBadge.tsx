import { StyleSheet, View } from 'react-native';

import { Frames, Spacing } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';

type Props = {
  /** `added`: the user's own exercise; `edited`: a built-in one the user changed. */
  kind: 'added' | 'edited';
  testID?: string;
};

const SPOKEN = {
  added: 'Custom: your own exercise',
  edited: 'Custom: changed by you',
} as const;

/** "CUSTOM" with a quill in a small arcane frame: the user changed or added this node (PLAN 4.7). */
export function CustomBadge({ kind, testID }: Props) {
  return (
    <View
      style={styles.badge}
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={SPOKEN[kind]}>
      <PixelFrame frame={Frames.arcane} shadow={false} padding={Spacing.xs}>
        <View style={styles.row}>
          <PixelIcon name="quill" />
          <PixelText variant="label" tone="arcane">
            Custom
          </PixelText>
        </View>
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.xs,
  },
});
