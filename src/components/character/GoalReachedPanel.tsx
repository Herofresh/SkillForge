import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { nextGoalOptions } from '@/domain/goalReached';
import { useAppStore } from '@/store/useAppStore';

import { Spacing, TOUCH_TARGET } from '../theme';
import { BURST_TITLES, LevelUpBurst, PixelFrame, PixelIcon, PixelText } from '../ui';

import { NextGoalPicker } from './NextGoalPicker';

type Props = {
  /** The goals the session reached (`goalsReachedIn`), as they were when the screen opened. */
  goalIds: readonly string[];
  /** Plays the GOAL REACHED! burst (the fresh summary); off for history. */
  celebrate: boolean;
  /** Replays the burst when it changes (the session id). */
  playKey: string;
  /** Opens a skill's detail (the next goal line; the info sheet's "Open skill"). */
  onOpenNode?: (nodeId: string) => void;
  testID?: string;
};

type Decision = { kind: 'picked'; nodeId: string } | { kind: 'kept' };

export const GOALS_KEPT_TEXT =
  'Your goals stay as they are. You can pick a new one in the Tree any time.';

/**
 * A goal reached in this session (PLAN 7.8 FB-9/10/11, ADR-077): a GOAL REACHED! burst, then the
 * question whether to jump to the next goal, with the sensible options (`nextGoalOptions`) to
 * choose from. Picking one puts it in the reached goal's place (`replaceGoal`). One frame per
 * reached goal; nothing when the session reached none.
 */
export function GoalReachedPanel({
  goalIds,
  celebrate,
  playKey,
  onOpenNode,
  testID = 'summary-goal',
}: Props) {
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const goals = useAppStore((state) => state.goals);
  const replaceGoal = useAppStore((state) => state.replaceGoal);
  const [decisions, setDecisions] = useState<Readonly<Record<string, Decision>>>({});
  const nameOf = (id: string) => nodes.find((node) => node.id === id)?.name ?? id;
  const decide = (goalId: string, decision: Decision) =>
    setDecisions((current) => ({ ...current, [goalId]: decision }));
  if (goalIds.length === 0) return null;
  return (
    <>
      {goalIds.map((goalId, index) => {
        const name = nameOf(goalId);
        const decision = decisions[goalId];
        return (
          <PixelFrame
            key={goalId}
            variant="gold"
            contentStyle={styles.gap}
            testID={`${testID}-${goalId}`}>
            {celebrate ? (
              <LevelUpBurst
                title={BURST_TITLES.goalReached}
                subtitle={name}
                playKey={`${playKey}-goal-${index}`}
              />
            ) : (
              <PixelText variant="label" tone="gold" accessibilityRole="header">
                {`Goal reached: ${name}`}
              </PixelText>
            )}
            <PixelText align="center" testID={`${testID}-${goalId}-text`}>
              {`${name} is yours: its Trial is passed and its whole path is proficient.`}
            </PixelText>
            {decision === undefined ? (
              <NextGoalPicker
                goalName={name}
                options={nextGoalOptions(nodes, progress, goalId, goals)}
                onPick={(nodeId) => {
                  replaceGoal(goalId, nodeId);
                  decide(goalId, { kind: 'picked', nodeId });
                }}
                onKeep={() => decide(goalId, { kind: 'kept' })}
                {...(onOpenNode ? { onOpenNode } : {})}
                testID={`${testID}-${goalId}-next`}
              />
            ) : decision.kind === 'picked' ? (
              <Pressable
                onPress={() => onOpenNode?.(decision.nodeId)}
                disabled={!onOpenNode}
                accessibilityRole="link"
                accessibilityLabel={`Next goal: ${nameOf(decision.nodeId)}`}
                style={styles.next}
                testID={`${testID}-${goalId}-picked`}>
                <PixelIcon name="star" />
                <PixelText tone="gold">{`Next goal: ${nameOf(decision.nodeId)}`}</PixelText>
              </Pressable>
            ) : (
              <PixelText variant="small" tone="textMuted" testID={`${testID}-${goalId}-kept`}>
                {GOALS_KEPT_TEXT}
              </PixelText>
            )}
          </PixelFrame>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  next: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
