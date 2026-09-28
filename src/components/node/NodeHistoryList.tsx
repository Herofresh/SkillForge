import { Pressable, StyleSheet, View } from 'react-native';

import { formatPerformance, formatShortDate } from '@/domain/format';
import type { NodeSessionLog } from '@/domain/treeView';
import type { Metric } from '@/domain/types';

import { Colors, PIXEL, Spacing, TOUCH_TARGET } from '../theme';
import { PixelIcon, PixelText } from '../ui';

type Props = {
  history: readonly NodeSessionLog[];
  metric: Metric;
  /** Opens the past session (`app/session/[sessionId]`, PLAN 5.10). */
  onOpenSession: (sessionId: string) => void;
};

/**
 * The node's recent sessions, newest first: date, a Trial tag, and what each set achieved. Each row
 * opens that session's summary (onboarding test-outs too: they are ordinary Trial sessions).
 */
export function NodeHistoryList({ history, metric, onOpenSession }: Props) {
  if (history.length === 0) {
    return (
      <PixelText tone="textMuted" testID="history-empty">
        No sets logged yet. Train it or attempt its Trial to start the story.
      </PixelText>
    );
  }
  return (
    <View style={styles.list}>
      {history.map((entry, index) => {
        const date = formatShortDate(entry.at);
        const sets = entry.sets.map((set) => formatPerformance(metric, set.actual)).join(' · ');
        return (
          <Pressable
            key={entry.sessionId}
            onPress={() => onOpenSession(entry.sessionId)}
            accessibilityRole="button"
            accessibilityLabel={`${date}${entry.isTrial ? ', Trial' : ''}: ${sets}`}
            accessibilityHint="Opens the session summary"
            style={[styles.row, index > 0 && styles.divider]}
            testID={`history-${index}`}>
            <View style={styles.text}>
              <View style={styles.heading}>
                <PixelText variant="label" tone="gold">
                  {date}
                </PixelText>
                {entry.isTrial && (
                  <PixelText variant="label" tone="rune">
                    Trial
                  </PixelText>
                )}
              </View>
              <PixelText variant="small">{sets}</PixelText>
            </View>
            <PixelIcon name="scroll" tint={Colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
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
