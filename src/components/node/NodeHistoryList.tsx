import { StyleSheet, View } from 'react-native';

import { formatPerformance, formatShortDate } from '@/domain/format';
import type { NodeSessionLog } from '@/domain/treeView';
import type { Metric } from '@/domain/types';

import { Colors, PIXEL, Spacing } from '../theme';
import { PixelText } from '../ui';

type Props = {
  history: readonly NodeSessionLog[];
  metric: Metric;
};

/** The node's recent sessions, newest first: date, a Trial tag, and what each set achieved. */
export function NodeHistoryList({ history, metric }: Props) {
  if (history.length === 0) {
    return (
      <PixelText tone="textMuted" testID="history-empty">
        No sets logged yet. Train it or attempt its Trial to start the story.
      </PixelText>
    );
  }
  return (
    <View style={styles.list}>
      {history.map((entry, index) => (
        <View
          key={entry.sessionId}
          style={[styles.row, index > 0 && styles.divider]}
          testID={`history-${index}`}>
          <View style={styles.heading}>
            <PixelText variant="label" tone="gold">
              {formatShortDate(entry.at)}
            </PixelText>
            {entry.isTrial && (
              <PixelText variant="label" tone="rune">
                Trial
              </PixelText>
            )}
          </View>
          <PixelText variant="small">
            {entry.sets.map((set) => formatPerformance(metric, set.actual)).join(' · ')}
          </PixelText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    gap: PIXEL,
  },
  divider: {
    paddingTop: Spacing.sm,
    borderTopWidth: PIXEL,
    borderTopColor: Colors.border,
  },
  heading: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
