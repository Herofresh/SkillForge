import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BranchTabs } from '@/components/BranchTabs';
import { ExerciseInfoSheet } from '@/components/node/ExerciseInfoSheet';
import { NodeRow } from '@/components/NodeRow';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import { PixelFrame, PixelText } from '@/components/ui';
import { nodesInBranch } from '@/domain/branch';
import { MAX_GOALS, MIN_GOALS } from '@/domain/onboarding';
import { BRANCHES, type Branch, type ExerciseNode } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 3: browse the tree by branch and pick 1–5 goal skills. Each skill's "i" (or a long press)
 * opens its info sheet without picking it (FB-2), since new users don't know the exercises yet.
 */
export default function GoalsStep() {
  const router = useRouter();
  const nodes = useAppStore((state) => state.nodes);
  const goals = useAppStore((state) => state.goals);
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const toggleGoal = useAppStore((state) => state.toggleGoal);
  const [branch, setBranch] = useState<Branch>(BRANCHES[0]);
  const [full, setFull] = useState(false);
  const [infoNode, setInfoNode] = useState<ExerciseNode | undefined>();
  const branchNodes = useMemo(() => nodesInBranch(nodes, branch), [nodes, branch]);

  const toggle = (nodeId: string) => setFull(!toggleGoal(nodeId));
  const goNext = () => router.push('/onboarding/assessment');

  return (
    <OnboardingScaffold
      step="goals"
      icon="star"
      title="Choose your quests"
      subtitle={`Pick ${MIN_GOALS} to ${MAX_GOALS} skills to work towards. Workouts lead you there.`}
      onBack={() => router.back()}
      skip={{ label: 'Later', onPress: goNext }}
      next={{ label: 'Next', onPress: goNext, disabled: goals.length < MIN_GOALS }}
      testID="onboarding-goals">
      <PixelFrame variant="gold" contentStyle={styles.summary}>
        <PixelText variant="label" tone="gold" testID="goal-count">
          Goals {goals.length} / {MAX_GOALS}
        </PixelText>
        <PixelText variant="small">
          {goals.length === 0
            ? 'No goals yet. Tap a skill below to pick it.'
            : goals.map((id) => nodeById.get(id)?.name ?? id).join(' · ')}
        </PixelText>
        {full && (
          <PixelText variant="small" tone="ember" accessibilityLiveRegion="polite">
            {`${MAX_GOALS} goals is the limit. Remove one to pick another.`}
          </PixelText>
        )}
      </PixelFrame>
      <BranchTabs value={branch} onChange={setBranch} />
      <View style={styles.list}>
        {branchNodes.map((node) => {
          const picked = goals.includes(node.id);
          return (
            <NodeRow
              key={node.id}
              node={node}
              icon={picked ? 'star' : node.legendary ? 'flame' : 'rune'}
              selected={picked}
              status={picked ? 'Goal' : undefined}
              role="checkbox"
              onPress={() => toggle(node.id)}
              accessibilityHint={picked ? 'Removes this goal' : 'Picks this skill as a goal'}
              onInfo={() => setInfoNode(node)}
              testID={`goal-${node.id}`}
            />
          );
        })}
      </View>
      {infoNode && <ExerciseInfoSheet node={infoNode} onClose={() => setInfoNode(undefined)} />}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
});
