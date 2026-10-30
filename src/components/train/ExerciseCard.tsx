import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { TRIAL_NEEDED_LABEL, trialNeededNote } from '@/domain/format';
import type { ExerciseView } from '@/domain/trainView';
import { t } from '@/i18n';

import { InfoButton } from '../node/InfoButton';
import { Frames, Spacing } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';
import { SwapButton } from './SwapButton';

type Props = {
  exercise: ExerciseView;
  /** Gold-lined when it is the exercise being trained. */
  highlighted?: boolean;
  /** Buttons under the details (swap/remove in the preview). */
  children?: ReactNode;
  /** Opens the exercise info sheet (PLAN 6.2): an "i" next to the name. */
  onInfo?: () => void;
  /** Opens the swap sheet (PLAN 7.8 FB-16): the swap icon next to the "i". */
  onSwap?: () => void;
  testID?: string;
};

/**
 * One exercise of a plan or session: name, sets × target and rest, with its markers: Trial,
 * straight-arm, Trial needed (stuck at level 5, PLAN 7.8 FB-4), swapped by the user, replaced for the equipment (ADR-005) and its strength pair,
 * and an "i" for the exercise info sheet (PLAN 6.2) when `onInfo` is set.
 */
export function ExerciseCard({
  exercise,
  highlighted = false,
  children,
  onInfo,
  onSwap,
  testID,
}: Props) {
  const tags = exerciseTags(exercise);
  return (
    <PixelFrame
      frame={highlighted ? Frames.selected : Frames.stone}
      contentStyle={styles.content}
      testID={testID}>
      <View style={styles.header}>
        <PixelIcon name={exercise.isTrial ? 'shield' : exercise.skipped ? 'cross' : 'sword'} />
        <PixelText
          variant="heading"
          tone={exercise.skipped ? 'textMuted' : highlighted ? 'gold' : 'text'}
          style={styles.name}>
          {exercise.name}
        </PixelText>
        {onInfo && (
          <InfoButton name={exercise.name} onPress={onInfo} testID={testID && `${testID}-info`} />
        )}
        {onSwap && (
          <SwapButton name={exercise.name} onPress={onSwap} testID={testID && `${testID}-swap`} />
        )}
      </View>
      <PixelText testID={testID && `${testID}-prescription`}>
        {`${exercise.prescription} · ${exercise.rest}`}
      </PixelText>
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <PixelText key={tag.text} variant="label" tone={tag.tone}>
              {tag.text}
            </PixelText>
          ))}
        </View>
      )}
      {exercise.swappedFromName !== undefined && (
        <PixelText variant="small" tone="textMuted" testID={testID && `${testID}-swapped`}>
          {t('Swapped from {name}', { name: exercise.swappedFromName })}
        </PixelText>
      )}
      {exercise.substitutedFromName !== undefined && (
        <PixelText variant="small" tone="textMuted">
          {t("Replaces {name} (needs equipment you don't have)", {
            name: exercise.substitutedFromName,
          })}
        </PixelText>
      )}
      {exercise.awaitingTrial && (
        <PixelText variant="small" tone="ember" testID={testID && `${testID}-trial-needed`}>
          {exercise.trialPlan ? `${trialNeededNote()} ${exercise.trialPlan}` : trialNeededNote()}
        </PixelText>
      )}
      {exercise.pairedWithName !== undefined && (
        <PixelText variant="small" tone="textMuted">
          {t('Pair: alternate sets with {name}', { name: exercise.pairedWithName })}
        </PixelText>
      )}
      {children}
    </PixelFrame>
  );
}

type Tag = { text: string; tone: 'rune' | 'ember' | 'textMuted' | 'success' };

function exerciseTags(exercise: ExerciseView): Tag[] {
  const tags: Tag[] = [];
  if (exercise.isTrial) tags.push({ text: t('Trial'), tone: 'rune' });
  if (exercise.straightArm) tags.push({ text: t('Straight-arm'), tone: 'ember' });
  if (exercise.awaitingTrial) tags.push({ text: t(TRIAL_NEEDED_LABEL), tone: 'ember' });
  if (exercise.skipped) tags.push({ text: t('Skipped'), tone: 'textMuted' });
  else if (exercise.done) tags.push({ text: t('Done'), tone: 'success' });
  return tags;
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
