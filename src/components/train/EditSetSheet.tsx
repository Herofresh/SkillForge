import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { stepTrialResult } from '@/domain/assessment';
import { formatPerformance } from '@/domain/format';
import type { SetMark } from '@/domain/train';
import type { LoggedSetView } from '@/domain/trainView';
import type { ExerciseNode, Metric, SetPerformance } from '@/domain/types';
import { t } from '@/i18n';

import { Spacing } from '../theme';
import { NumberStepper, PixelButton, PixelModal, PixelText } from '../ui';

type Props = {
  node: ExerciseNode;
  metric: Metric;
  target: SetPerformance;
  set: LoggedSetView;
  onSave: (entered: SetPerformance, mark: SetMark) => void;
  onDelete: () => void;
  onClose: () => void;
};

/**
 * Editing one logged set of the live session (PLAN 5.9, ADR-045): the logger's stepper, starting at
 * the logged result, with Save / Partial / Failed like logging, and "Delete set" behind a confirm.
 * The set's measured time stays. Mount it with a key per set so the stepper starts fresh.
 */
export function EditSetSheet({ node, metric, target, set, onSave, onDelete, onClose }: Props) {
  const [entered, setEntered] = useState<SetPerformance>(set.editStart);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = t('Set {n}', { n: set.index + 1 });
  return (
    <PixelModal
      visible
      title={t('Edit set {n}', { n: set.index + 1 })}
      onClose={onClose}
      closeLabel={t('Cancel')}
      testID="edit-set-sheet">
      <PixelText variant="small" tone="textMuted">
        {t('Logged: {logged} · Target: {target}', {
          logged: set.text,
          target: formatPerformance(metric, target),
        })}
      </PixelText>
      {confirmDelete ? (
        <View style={styles.gap}>
          <PixelText>
            {t('Delete {set}? Its result is removed from the session and the later sets move up.', {
              set: title,
            })}
          </PixelText>
          <PixelButton
            label={t('Delete set')}
            variant="danger"
            onPress={onDelete}
            testID="edit-set-delete-confirm"
          />
          <PixelButton
            label={t('Keep set')}
            variant="secondary"
            onPress={() => setConfirmDelete(false)}
            testID="edit-set-keep"
          />
        </View>
      ) : (
        <View style={styles.gap}>
          <NumberStepper
            label={t('Did')}
            valueText={formatPerformance(metric, entered)}
            onDecrement={() => setEntered((value) => stepTrialResult(node, value, -1))}
            onIncrement={() => setEntered((value) => stepTrialResult(node, value, 1))}
            decrementDisabled={entered.value <= 0}
            testID="edit-set-stepper"
          />
          <PixelButton
            label={t('Save')}
            icon="check"
            onPress={() => onSave(entered, 'done')}
            accessibilityHint={t('Saves the set as entered')}
            testID="edit-set-save"
          />
          <View style={styles.row}>
            <PixelButton
              label={t('Partial')}
              variant="secondary"
              onPress={() => onSave(entered, 'partial')}
              accessibilityHint={t('Saves the set as short of the target')}
              testID="edit-set-partial"
              style={styles.half}
            />
            <PixelButton
              label={t('Failed')}
              variant="secondary"
              onPress={() => onSave(entered, 'failed')}
              accessibilityHint={t('Saves the set as not done')}
              testID="edit-set-failed"
              style={styles.half}
            />
          </View>
          <PixelButton
            label={t('Delete set')}
            variant="danger"
            onPress={() => setConfirmDelete(true)}
            accessibilityHint={t('Asks before removing the set')}
            testID="edit-set-delete"
          />
        </View>
      )}
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
});
