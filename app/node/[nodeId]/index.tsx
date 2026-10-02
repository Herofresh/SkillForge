import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AttributeChips } from '@/components/node/AttributeChips';
import { CustomizeSection } from '@/components/node/CustomizeSection';
import { DetailSection } from '@/components/node/DetailSection';
import { NodeHeader } from '@/components/node/NodeHeader';
import { NodeHistoryList } from '@/components/node/NodeHistoryList';
import { PrerequisiteList } from '@/components/node/PrerequisiteList';
import { UnlockSheet } from '@/components/node/UnlockSheet';
import { stackHeaderOptions } from '@/components/stackHeader';
import { Spacing } from '@/components/theme';
import { EmptyState, PixelButton, PixelText, Screen } from '@/components/ui';
import {
  formatDescription,
  formatShortDate,
  formatTrial,
  formatWorkingRange,
} from '@/domain/format';
import { MAX_GOALS } from '@/domain/onboarding';
import { customizationOf } from '@/domain/overlayEdit';
import { nodeDetail, type NodeDetail } from '@/domain/treeView';
import type { ReviewStatus } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

const REVIEW_TEXT: Readonly<Record<ReviewStatus, string>> = {
  draft: 'Draft: not reviewed by a coach yet.',
  coach_reviewed: 'Reviewed by a coach.',
};

/**
 * The node detail (PLAN 4.3): everything about one skill (what it is first, PLAN 6.2), from the user's tree with the overlay
 * applied (`state.nodes`), and its actions: set/remove goal, attempt the Trial, and "unlock anyway"
 * for a locked node (ADR-023: advisory, acknowledged, never blocked), and "Your tree": edit, add after,
 * reset, hide or delete (PLAN 4.7, ADR-036).
 */
export default function NodeDetailScreen() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const goals = useAppStore((state) => state.goals);
  const sessions = useAppStore((state) => state.sessions);
  const detail = useMemo(
    () => nodeDetail(nodes, nodeId, progress, goals, sessions),
    [nodes, nodeId, progress, goals, sessions],
  );
  if (!detail) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions('Skill')} />
        <EmptyState icon="potion" title="Unknown skill" message={`No skill '${nodeId}' here.`} />
      </Screen>
    );
  }
  return <NodeDetailBody detail={detail} />;
}

function NodeDetailBody({ detail }: { detail: NodeDetail }) {
  const router = useRouter();
  const toggleGoal = useAppStore((state) => state.toggleGoal);
  const trialPassedAt = useAppStore(
    (state) => state.engine.progress[detail.tile.node.id]?.trialPassedAt,
  );
  const overlay = useAppStore((state) => state.overlay);
  const customization = useMemo(
    () => customizationOf(overlay, detail.tile.node.id),
    [overlay, detail.tile.node.id],
  );
  const [goalsFull, setGoalsFull] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockBurstKey, setUnlockBurstKey] = useState<number | undefined>();
  const { tile, prerequisites, attributes, history } = detail;
  const { node, state, isGoal, status } = tile;
  const locked = state === 'locked' || state === 'legendary';

  const openNode = useCallback(
    (nodeId: string) => router.push({ pathname: '/node/[nodeId]', params: { nodeId } }),
    [router],
  );
  const openSession = (sessionId: string) =>
    router.push({ pathname: '/session/[sessionId]', params: { sessionId } });
  const onToggleGoal = () => setGoalsFull(!toggleGoal(node.id));
  const onUnlocked = () => {
    setUnlocking(false);
    setUnlockBurstKey((key) => (key ?? 0) + 1);
  };

  return (
    <>
      <Stack.Screen options={stackHeaderOptions(node.name)} />
      <Screen testID="node-detail">
        <NodeHeader
          tile={tile}
          unlockBurstKey={unlockBurstKey}
          custom={
            customization === 'added' || customization === 'edited' ? customization : undefined
          }
        />

        <DetailSection title="About" icon="info" testID="detail-description">
          <PixelText testID="detail-description-text">
            {formatDescription(node.description)}
          </PixelText>
        </DetailSection>

        <DetailSection title="Actions" icon="sword" variant="raised" testID="detail-actions">
          <PixelButton
            label={isGoal ? 'Remove goal' : 'Set as goal'}
            icon="star"
            variant={isGoal ? 'secondary' : 'primary'}
            onPress={onToggleGoal}
            accessibilityHint={
              isGoal ? 'Workouts stop leading here' : 'Workouts lead you towards this skill'
            }
            testID="goal-toggle"
          />
          {goalsFull && (
            <PixelText variant="small" tone="ember" accessibilityLiveRegion="polite">
              {`${MAX_GOALS} goals is the limit. Remove one to pick another.`}
            </PixelText>
          )}
          {trialPassedAt !== undefined ? (
            <PixelText variant="small" tone="success" testID="trial-passed-note">
              {`Trial passed on ${formatShortDate(trialPassedAt)}.`}
            </PixelText>
          ) : (
            <PixelButton
              label="Attempt Trial"
              icon="sword"
              variant="secondary"
              onPress={() =>
                router.push({ pathname: '/node/[nodeId]/trial', params: { nodeId: node.id } })
              }
              accessibilityHint="Log a Trial: pass it to become proficient"
              testID="attempt-trial"
            />
          )}
          {locked && (
            <PixelButton
              label="Unlock anyway"
              icon="lock"
              variant="secondary"
              onPress={() => setUnlocking(true)}
              accessibilityHint="Opens it for training although its prerequisites are not met"
              testID="unlock-anyway"
            />
          )}
        </DetailSection>

        <DetailSection title="Prerequisites" icon="chain" testID="detail-prerequisites">
          <PrerequisiteList prerequisites={prerequisites} onOpen={openNode} />
          {status.warnings.length > 0 && (
            <PixelText variant="small" tone="textMuted">
              Recommended ones never lock a skill; they are good preparation.
            </PixelText>
          )}
        </DetailSection>

        <DetailSection title="Trains" icon="bar">
          <AttributeChips attributes={attributes} />
        </DetailSection>

        <DetailSection title="Standards" icon="shield" testID="detail-standards">
          <View style={styles.pair}>
            <PixelText variant="label" tone="textMuted">
              Working range
            </PixelText>
            <PixelText>{formatWorkingRange(node.metric, node.workingRange)}</PixelText>
          </View>
          <View style={styles.pair}>
            <PixelText variant="label" tone="textMuted">
              Trial standard
            </PixelText>
            <PixelText>{formatTrial(node.metric, node.trial)}</PixelText>
          </View>
        </DetailSection>

        {node.cues.length > 0 && (
          <DetailSection title="Cues" icon="scroll" variant="parchment">
            {node.cues.map((cue) => (
              <PixelText key={cue} tone="textOnParchment">
                {`• ${cue}`}
              </PixelText>
            ))}
          </DetailSection>
        )}

        <DetailSection title="History" icon="scroll" testID="detail-history">
          <NodeHistoryList history={history} metric={node.metric} onOpenSession={openSession} />
        </DetailSection>

        <CustomizeSection node={node} customization={customization} />

        <DetailSection title="Review" icon="rune" testID="detail-review">
          <PixelText variant="small">{REVIEW_TEXT[node.review.status]}</PixelText>
          {node.review.notes !== undefined && (
            <PixelText variant="small">{`Coach notes: ${node.review.notes}`}</PixelText>
          )}
          {node.verify !== undefined && (
            <PixelText variant="small" tone="textMuted">
              {`Still being checked: ${node.verify}`}
            </PixelText>
          )}
          {node.source === 'user' && (
            <PixelText variant="small" tone="rune">
              Your own skill (from your changes to the tree).
            </PixelText>
          )}
        </DetailSection>
      </Screen>
      {unlocking && (
        <UnlockSheet node={node} onClose={() => setUnlocking(false)} onUnlocked={onUnlocked} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  pair: {
    gap: Spacing.xs,
  },
});
