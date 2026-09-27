import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NodeRow } from '@/components/NodeRow';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import { PixelFrame, PixelText, PixelTextInput } from '@/components/ui';
import { assessmentAnchors, searchNodes } from '@/domain/assessment';
import type { ExerciseNode } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/** Step 4 (optional): "I can already do this" for anchors on the goal paths or any searched skill. */
export default function AssessmentStep() {
  const router = useRouter();
  const nodes = useAppStore((state) => state.nodes);
  const goals = useAppStore((state) => state.goals);
  const progress = useAppStore((state) => state.engine.progress);
  const [query, setQuery] = useState('');
  const anchors = useMemo(() => assessmentAnchors(nodes, goals), [nodes, goals]);
  const results = useMemo(() => searchNodes(nodes, query), [nodes, query]);

  const row = (node: ExerciseNode, prefix: string) => {
    const passed = progress[node.id]?.trialPassed === true;
    return (
      <NodeRow
        key={`${prefix}-${node.id}`}
        node={node}
        icon={passed ? 'check' : 'sword'}
        status={passed ? 'Tested out' : 'I can do this'}
        onPress={() =>
          router.push({ pathname: '/onboarding/trial/[nodeId]', params: { nodeId: node.id } })
        }
        accessibilityHint="Opens the Trial for this skill"
        testID={`${prefix}-${node.id}`}
      />
    );
  };

  return (
    <OnboardingScaffold
      step="assessment"
      icon="sword"
      title="Prove your might"
      subtitle="Optional. Already strong? Log a Trial for what you can do today and start further up the tree."
      onBack={() => router.back()}
      next={{ label: 'Continue', onPress: () => router.push('/onboarding/summary') }}
      testID="onboarding-assessment">
      <View style={styles.section}>
        <PixelText variant="label" tone="rune" accessibilityRole="header">
          On your path
        </PixelText>
        {anchors.length === 0 ? (
          <PixelFrame>
            <PixelText tone="textMuted">
              Pick goals to see milestones here, or search for any skill below.
            </PixelText>
          </PixelFrame>
        ) : (
          anchors.map((node) => row(node, 'anchor'))
        )}
      </View>
      <View style={styles.section}>
        <PixelTextInput
          label="Search any skill"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. planche, pistol"
          returnKeyType="search"
          testID="assessment-search"
        />
        {query.trim().length > 0 && results.length === 0 && (
          <PixelText tone="textMuted">No skill matches “{query.trim()}”.</PixelText>
        )}
        {results.map((node) => row(node, 'search'))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
});
