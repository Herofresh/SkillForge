import { StyleSheet, View } from 'react-native';

import type { RankTitle } from '@/domain/types';

import { Colors, RankColors, Spacing } from '../theme';
import { PixelFrame, PixelIcon, PixelText, type IconName } from '../ui';

/** The crest's emblem per rank: from a plain shield to the legendary flame. */
export const RANK_ICONS: Readonly<Record<RankTitle, IconName>> = {
  Novice: 'shield',
  Apprentice: 'sword',
  Adept: 'rune',
  Master: 'star',
  Legend: 'flame',
};

type Props = {
  rank: RankTitle;
  /** "Next: Apprentice at OG 2 median", or a line for the top rank. */
  hint?: string;
  testID?: string;
};

/** The rank title with its pixel crest: the emblem in a rank-colored double frame. */
export function RankCrest({ rank, hint, testID }: Props) {
  const color = RankColors[rank];
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Rank: ${rank}${hint ? `. ${hint}` : ''}`}
      style={styles.row}>
      <PixelFrame
        frame={{ lines: [Colors.ink, color, Colors.ink], fill: Colors.surfaceRaised }}
        padding={Spacing.sm}>
        <PixelIcon name={RANK_ICONS[rank]} size={48} />
      </PixelFrame>
      <View style={styles.text}>
        <PixelText variant="label" tone="textMuted">
          Rank
        </PixelText>
        <PixelText variant="title" color={color}>
          {rank}
        </PixelText>
        {hint !== undefined && (
          <PixelText variant="small" tone="textMuted">
            {hint}
          </PixelText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    flex: 1,
  },
});
