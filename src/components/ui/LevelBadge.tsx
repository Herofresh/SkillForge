import { StyleSheet, View } from 'react-native';

import { Spacing } from '../theme';

import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';

type Props = {
  level: number;
  /** `lg` for the character sheet, `md` elsewhere. */
  size?: 'md' | 'lg';
  testID?: string;
};

/** "LV 7" in a gold pixel frame. */
export function LevelBadge({ level, size = 'md', testID }: Props) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Level ${level}`}
      style={styles.wrapper}>
      <PixelFrame variant="gold" padding={size === 'lg' ? Spacing.sm : Spacing.xs}>
        <View style={styles.content}>
          <PixelText variant="label" tone="textMuted">
            LV
          </PixelText>
          <PixelText variant={size === 'lg' ? 'display' : 'title'}>{level}</PixelText>
        </View>
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  content: {
    alignItems: 'center',
    minWidth: 40,
    paddingHorizontal: Spacing.xs,
  },
});
