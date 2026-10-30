import { StyleSheet, View } from 'react-native';

import type { TrainingView } from '@/domain/battleView';
import { k, t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { PixelChip, PixelText } from '../ui';

const VIEWS: readonly { view: TrainingView; label: string; text: string }[] = [
  {
    view: 'classic',
    label: k('Classic'),
    text: k('One exercise at a time with a stepper; its sets are monsters that take the hits.'),
  },
  {
    view: 'battle',
    label: k('Battle'),
    text: k(
      'Every exercise at once, each set a monster: tap to beat it, tap again for one rep fewer, long press for an exact number.',
    ),
  },
];

/** "Training view" (PLAN 7.9, ADR-071): Classic or Battle for the live session; it takes effect at once. */
export function TrainingViewPanel() {
  const trainingView = useAppStore((state) => state.trainingView);
  const setTrainingView = useAppStore((state) => state.setTrainingView);
  const chosen = VIEWS.find((entry) => entry.view === trainingView) ?? VIEWS[0];
  return (
    <DetailSection title={t('Training view')} icon="sword" testID="settings-training-view">
      <View style={styles.row} accessibilityRole="tablist">
        {VIEWS.map(({ view, label }) => (
          <PixelChip
            key={view}
            role="tab"
            label={t(label)}
            accessibilityLabel={t('{label} training view', { label: t(label) })}
            selected={view === trainingView}
            onPress={() => setTrainingView(view)}
            testID={`training-view-${view}`}
          />
        ))}
      </View>
      <PixelText variant="small" tone="textMuted" testID="training-view-text">
        {t(chosen.text)}
      </PixelText>
    </DetailSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
