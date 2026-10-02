import { Pressable, StyleSheet, View } from 'react-native';

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
  /** Makes the crest a button, e.g. to open the rank ladder (PLAN 6.7). */
  onPress?: () => void;
  testID?: string;
};

/**
 * The rank title with its pixel crest: the emblem in a rank-colored double frame. With `onPress`
 * the whole crest is a button and shows a "See all ranks" cue.
 */
export function RankCrest({ rank, hint, onPress, testID }: Props) {
  const label = `Rank: ${rank}${hint ? `. ${hint}` : ''}`;
  const body = (pressed: boolean) => (
    <View style={styles.row}>
      <PixelFrame
        frame={{ lines: [Colors.ink, RankColors[rank], Colors.ink], fill: Colors.surfaceRaised }}
        pressed={pressed}
        padding={Spacing.sm}>
        <PixelIcon name={RANK_ICONS[rank]} size={48} />
      </PixelFrame>
      <View style={styles.text}>
        <PixelText variant="label" tone="textMuted">
          Rank
        </PixelText>
        <PixelText variant="title" color={RankColors[rank]}>
          {rank}
        </PixelText>
        {hint !== undefined && (
          <PixelText variant="small" tone="textMuted">
            {hint}
          </PixelText>
        )}
        {onPress && (
          <PixelText variant="label" tone="rune">
            See all ranks
          </PixelText>
        )}
      </View>
    </View>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityRole="text" accessibilityLabel={label}>
        {body(false)}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Shows every rank and what the next ones need">
      {({ pressed }) => body(pressed)}
    </Pressable>
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
