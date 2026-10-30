import { nextGoalOptions } from '@/domain/goalReached';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

import { PixelModal } from '../ui';

import { NextGoalPicker } from './NextGoalPicker';

type Props = {
  /** The reached goal to replace. */
  goalId: string;
  onClose: () => void;
  onOpenNode: (nodeId: string) => void;
  testID?: string;
};

/**
 * "Pick the next goal" from a reached goal's card on the Character tab (PLAN 7.8 FB-9/11): the
 * same picker as the session summary, in a sheet. Picking one replaces the goal and closes.
 */
export function NextGoalSheet({ goalId, onClose, onOpenNode, testID = 'next-goal-sheet' }: Props) {
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const goals = useAppStore((state) => state.goals);
  const replaceGoal = useAppStore((state) => state.replaceGoal);
  const name = nodes.find((node) => node.id === goalId)?.name ?? goalId;
  return (
    <PixelModal visible title={t('After {name}', { name })} onClose={onClose} testID={testID}>
      <NextGoalPicker
        goalName={name}
        options={nextGoalOptions(nodes, progress, goalId, goals)}
        onPick={(nodeId) => {
          replaceGoal(goalId, nodeId);
          onClose();
        }}
        onKeep={onClose}
        onOpenNode={(nodeId) => {
          onClose();
          onOpenNode(nodeId);
        }}
        testID={`${testID}-next`}
      />
    </PixelModal>
  );
}
