import { Pressable, StyleSheet, View } from 'react-native';

import type { SessionListItem } from '@/domain/characterView';
import { formatShortDate } from '@/domain/format';
import { t } from '@/i18n';

import { Colors, Spacing, TOUCH_TARGET } from '../theme';
import { PixelIcon, PixelText } from '../ui';

type Props = {
  item: SessionListItem;
  onPress: () => void;
  testID?: string;
};

/** One past session on parchment: date, what was trained, sets and XP; opens its summary. */
export function SessionHistoryRow({ item, onPress, testID }: Props) {
  const sets = item.sets === 1 ? t('1 set') : t('{n} sets', { n: item.sets });
  const trials =
    item.trialsPassed === 0
      ? ''
      : ` · ${
          item.trialsPassed === 1
            ? t('1 Trial passed')
            : t('{n} Trials passed', { n: item.trialsPassed })
        }`;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t('{date}: {title}, {sets}, {xp} XP', {
        date: formatShortDate(item.at),
        title: item.title,
        sets,
        xp: item.xp,
      })}
      accessibilityHint={t('Opens the session summary')}
      style={styles.row}>
      <PixelIcon name={item.trialsPassed > 0 ? 'shield' : 'scroll'} tint={Colors.bronze} />
      <View style={styles.text}>
        <PixelText variant="label" tone="textOnParchment">
          {formatShortDate(item.at)}
        </PixelText>
        <PixelText tone="textOnParchment" numberOfLines={2}>
          {item.title}
        </PixelText>
        <PixelText variant="small" tone="textOnParchment">
          {sets + trials}
        </PixelText>
      </View>
      <PixelText variant="heading" tone="textOnParchment">
        {`+${item.xp} XP`}
      </PixelText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    flex: 1,
  },
});
