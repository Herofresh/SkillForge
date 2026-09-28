import { Pressable, StyleSheet, View } from 'react-native';

import type { GoalProgressView } from '@/domain/characterView';

import { Colors, Spacing, TOUCH_TARGET } from '../theme';
import { PixelIcon, PixelText, SegmentedBar, TierChip } from '../ui';

type Props = {
  goal: GoalProgressView;
  onOpen: (nodeId: string) => void;
  testID?: string;
};

/** Segments of the path bar; a path is rarely longer than this many nodes. */
const PATH_SEGMENTS = 8;

/**
 * A goal with its progress along its path (proficient path nodes / all path nodes) and the next
 * node to work on. The goal and the next node each open their detail.
 */
export function GoalProgressCard({ goal, onOpen, testID }: Props) {
  const reached = goal.next === undefined;
  const steps = `${goal.stepsDone} of ${goal.stepsTotal} path skills proficient`;
  return (
    <View style={styles.card} testID={testID}>
      <Pressable
        onPress={() => onOpen(goal.nodeId)}
        accessibilityRole="button"
        accessibilityLabel={`Goal ${goal.name}: ${steps}`}
        style={styles.header}>
        <PixelIcon name={reached ? 'check' : 'star'} />
        <PixelText variant="heading" style={styles.flex}>
          {goal.name}
        </PixelText>
        <TierChip tier={goal.tier} />
      </Pressable>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${goal.name} path`}
        accessibilityValue={{ min: 0, max: goal.stepsTotal, now: goal.stepsDone, text: steps }}>
        <SegmentedBar
          fraction={goal.fraction}
          segments={Math.max(1, Math.min(PATH_SEGMENTS, goal.stepsTotal))}
          color={Colors.gold}
          height={8}
        />
      </View>
      <PixelText variant="small" tone="textMuted">
        {steps}
      </PixelText>
      {goal.next && (
        <Pressable
          onPress={() => goal.next && onOpen(goal.next.nodeId)}
          accessibilityRole="link"
          accessibilityLabel={`Next step: ${goal.next.name}`}
          style={styles.next}>
          <PixelIcon name="sword" />
          <PixelText tone="rune">{`Next: ${goal.next.name}`}</PixelText>
        </Pressable>
      )}
      {reached && (
        <PixelText variant="label" tone="success">
          Goal reached
        </PixelText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xs,
  },
  header: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  next: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
