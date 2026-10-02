import { ScrollView, StyleSheet, View } from 'react-native';

import { formatDescription } from '@/domain/format';
import type { ExerciseNode } from '@/domain/types';

import { Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelModal, PixelText } from '../ui';

type Props = {
  node: ExerciseNode;
  onClose: () => void;
  /** The Tree adds "Open skill" (the full node detail); Train leaves it out to stay in the session. */
  onOpenDetail?: () => void;
  testID?: string;
};

/**
 * The exercise info sheet (PLAN 6.2, ADR-049): what the exercise is (its description) and its
 * cues, over whatever screen opened it. One component for the Tree (column tile, map node) and
 * Train (plan preview, live session), so it reads the same everywhere. Mount it to open it.
 */
export function ExerciseInfoSheet({
  node,
  onClose,
  onOpenDetail,
  testID = 'exercise-info',
}: Props) {
  return (
    <PixelModal visible title={node.name} onClose={onClose} testID={testID}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        <PixelText testID={`${testID}-description`}>
          {formatDescription(node.description)}
        </PixelText>
        {node.cues.length > 0 && (
          <PixelFrame variant="parchment" shadow={false} contentStyle={styles.body}>
            <View style={styles.heading}>
              <PixelIcon name="scroll" />
              <PixelText variant="label" tone="textOnParchment" accessibilityRole="header">
                Cues
              </PixelText>
            </View>
            {node.cues.map((cue) => (
              <PixelText key={cue} variant="small" tone="textOnParchment">
                {`• ${cue}`}
              </PixelText>
            ))}
          </PixelFrame>
        )}
      </ScrollView>
      {onOpenDetail && (
        <PixelButton
          label="Open skill"
          icon="sword"
          onPress={onOpenDetail}
          accessibilityHint="Shows the skill's level, Trial and history"
          testID={`${testID}-open`}
        />
      )}
    </PixelModal>
  );
}

/** Long cue lists scroll inside the sheet so its buttons stay on screen. */
const BODY_MAX_HEIGHT = 360;

const styles = StyleSheet.create({
  scroll: {
    maxHeight: BODY_MAX_HEIGHT,
  },
  body: {
    gap: Spacing.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
