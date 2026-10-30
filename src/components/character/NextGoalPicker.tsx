import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRANCH_NAMES } from '@/data/skills/branches';
import type { NextGoalOption } from '@/domain/goalReached';
import type { ExerciseNode } from '@/domain/types';

import { ExerciseInfoSheet } from '../node/ExerciseInfoSheet';
import { NodeRow } from '../NodeRow';
import { Spacing } from '../theme';
import { PixelButton, PixelText } from '../ui';

type Props = {
  /** The reached goal the options build on. */
  goalName: string;
  options: readonly NextGoalOption[];
  /** The option picked as the next goal. */
  onPick: (nodeId: string) => void;
  /** The goals stay as they are. */
  onKeep: () => void;
  /** With it, the info sheet gets "Open skill" (not in the session summary). */
  onOpenNode?: (nodeId: string) => void;
  testID: string;
};

export const END_OF_PATH_TEXT =
  'That was the end of this path. Pick a new goal in the Tree whenever you like.';

/** "Still needs Dead hang and Hollow body hold" for an option that is not open yet. */
export function stillNeedsText(names: readonly string[]): string {
  if (names.length === 0) return '';
  const list =
    names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  return `Still needs ${list}`;
}

/**
 * The next goals to choose from after a reached goal (PLAN 7.8 FB-11, ADR-077): one row per
 * option with the "i" for its details, a picked row, then "Make it my goal" or "Keep my goals".
 * Used by the session summary and Trial outcome (`GoalReachedPanel`) and the Character tab's
 * goal card (`NextGoalSheet`).
 */
export function NextGoalPicker({ goalName, options, onPick, onKeep, onOpenNode, testID }: Props) {
  const [picked, setPicked] = useState<string | undefined>(undefined);
  const [infoNode, setInfoNode] = useState<ExerciseNode | undefined>(undefined);
  if (options.length === 0) {
    return (
      <View style={styles.gap}>
        <PixelText testID={`${testID}-end`}>{END_OF_PATH_TEXT}</PixelText>
        <PixelButton label="OK" variant="secondary" onPress={onKeep} testID={`${testID}-keep`} />
      </View>
    );
  }
  return (
    <View style={styles.gap}>
      <PixelText variant="label" tone="rune" accessibilityRole="header">
        {options.length === 1 ? 'Jump to the next goal?' : 'Jump to one of the next goals?'}
      </PixelText>
      {options.map((option) => (
        <NodeRow
          key={option.node.id}
          node={option.node}
          icon="star"
          selected={picked === option.node.id}
          role="checkbox"
          onPress={() => setPicked(option.node.id)}
          onInfo={() => setInfoNode(option.node)}
          {...(option.sameBranch ? {} : { status: BRANCH_NAMES[option.node.branch] })}
          testID={`${testID}-${option.node.id}`}>
          <PixelText variant="small" tone={option.stillNeeds.length > 0 ? 'ember' : 'textMuted'}>
            {option.stillNeeds.length > 0
              ? `Builds on ${goalName}. ${stillNeedsText(option.stillNeeds)}.`
              : `Builds on ${goalName}. Open to train now.`}
          </PixelText>
        </NodeRow>
      ))}
      <PixelButton
        label="Make it my goal"
        icon="star"
        onPress={() => picked !== undefined && onPick(picked)}
        disabled={picked === undefined}
        testID={`${testID}-pick`}
      />
      <PixelButton
        label="Keep my goals"
        variant="secondary"
        onPress={onKeep}
        testID={`${testID}-keep`}
      />
      {infoNode && (
        <ExerciseInfoSheet
          node={infoNode}
          onClose={() => setInfoNode(undefined)}
          {...(onOpenNode
            ? {
                onOpenDetail: () => {
                  const { id } = infoNode;
                  setInfoNode(undefined);
                  onOpenNode(id);
                },
              }
            : {})}
          testID={`${testID}-info`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
