import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseView } from '@/domain/trainView';

import { Frames, Spacing } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';

type Props = {
  exercise: ExerciseView;
  /** Gold-lined when it is the exercise being trained. */
  highlighted?: boolean;
  /** Buttons under the details (swap/remove in the preview). */
  children?: ReactNode;
  testID?: string;
};

/**
 * One exercise of a plan or session: name, sets × target and rest, with its markers: Trial,
 * straight-arm, swapped by the user, replaced for the equipment (ADR-005) and its strength pair.
 */
export function ExerciseCard({ exercise, highlighted = false, children, testID }: Props) {
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
          {`Swapped from ${exercise.swappedFromName}`}
        </PixelText>
      )}
      {exercise.substitutedFromName !== undefined && (
        <PixelText variant="small" tone="textMuted">
          {`Replaces ${exercise.substitutedFromName} (needs equipment you don't have)`}
        </PixelText>
      )}
      {exercise.pairedWithName !== undefined && (
        <PixelText variant="small" tone="textMuted">
          {`Pair: alternate sets with ${exercise.pairedWithName}`}
        </PixelText>
      )}
      {children}
    </PixelFrame>
  );
}

type Tag = { text: string; tone: 'rune' | 'ember' | 'textMuted' | 'success' };

function exerciseTags(exercise: ExerciseView): Tag[] {
  const tags: Tag[] = [];
  if (exercise.isTrial) tags.push({ text: 'Trial', tone: 'rune' });
  if (exercise.straightArm) tags.push({ text: 'Straight-arm', tone: 'ember' });
  if (exercise.skipped) tags.push({ text: 'Skipped', tone: 'textMuted' });
  else if (exercise.done) tags.push({ text: 'Done', tone: 'success' });
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
