import { Pressable, StyleSheet, View } from 'react-native';

import type { GuideEntry } from '@/domain/guide';

import { Spacing, TOUCH_TARGET } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';

import { GUIDE_ICONS } from './guideIcons';

/** 12 icon cells × 3 dp, like the guide sheet's. */
const ICON_SIZE = 36;

/** One entry in the guide's list: icon, title and the short summary; opens the entry's page. */
export function GuideRow({ entry, onPress }: { entry: GuideEntry; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={entry.title}
      accessibilityHint="Opens this topic"
      testID={`guide-row-${entry.id}`}
      style={styles.target}>
      {({ pressed }) => (
        <PixelFrame variant="raised" pressed={pressed} contentStyle={styles.row}>
          <PixelIcon name={GUIDE_ICONS[entry.id]} size={ICON_SIZE} />
          <View style={styles.text}>
            <PixelText variant="heading">{entry.title}</PixelText>
            <PixelText variant="small" tone="textMuted" numberOfLines={2}>
              {entry.summary}
            </PixelText>
          </View>
        </PixelFrame>
      )}
    </Pressable>
  );
}

/**
 * A guide entry's page (PLAN 6.10c): the summary in a gold frame under its icon and title, then the
 * details on parchment, one paragraph each.
 */
export function GuideArticle({ entry }: { entry: GuideEntry }) {
  return (
    <>
      <PixelFrame variant="gold" contentStyle={styles.gap} testID="guide-page-summary">
        <View style={styles.row}>
          <PixelIcon name={GUIDE_ICONS[entry.id]} size={ICON_SIZE} />
          <View style={styles.text}>
            <PixelText variant="title" accessibilityRole="header">
              {entry.title}
            </PixelText>
          </View>
        </View>
        <PixelText>{entry.summary}</PixelText>
      </PixelFrame>
      {entry.more.length > 0 && (
        <PixelFrame variant="parchment" contentStyle={styles.gap} testID="guide-page-more">
          <View style={styles.heading}>
            <PixelIcon name="scroll" />
            <PixelText variant="label" tone="textOnParchment" accessibilityRole="header">
              In detail
            </PixelText>
          </View>
          {entry.more.map((paragraph) => (
            <PixelText key={paragraph} tone="textOnParchment">
              {`• ${paragraph}`}
            </PixelText>
          ))}
        </PixelFrame>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  target: {
    minHeight: TOUCH_TARGET,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
  gap: {
    gap: Spacing.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
