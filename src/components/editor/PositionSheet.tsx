import { ScrollView, StyleSheet } from 'react-native';

import type { ExerciseNode } from '@/domain/types';

import { NodeRow } from '../NodeRow';
import { Spacing } from '../theme';
import { PixelButton, PixelModal, PixelText } from '../ui';

type Props = {
  /** The branch column without the node being placed (`chainNodes`). */
  chain: readonly ExerciseNode[];
  /** The node it currently comes after (`undefined` = at the top). */
  afterId: string | undefined;
  /** `undefined` = the top of the branch. */
  onPick: (afterId: string | undefined) => void;
  onClose: () => void;
};

/** Where a custom exercise goes in its branch: "at the top" or after one of the column's nodes. */
export function PositionSheet({ chain, afterId, onPick, onClose }: Props) {
  return (
    <PixelModal
      visible
      title="Comes after"
      onClose={onClose}
      closeLabel="Cancel"
      testID="position-sheet">
      <PixelText variant="small" tone="textMuted">
        Pick the exercise it follows in the column. Its tier is kept between its neighbours.
      </PixelText>
      <ScrollView nestedScrollEnabled style={styles.scroll} contentContainerStyle={styles.list}>
        <PixelButton
          label="At the top of the branch"
          variant={afterId === undefined ? 'primary' : 'secondary'}
          onPress={() => onPick(undefined)}
          testID="position-top"
        />
        {chain.map((node) => (
          <NodeRow
            key={node.id}
            node={node}
            selected={node.id === afterId}
            onPress={() => onPick(node.id)}
            testID={`position-${node.id}`}
          />
        ))}
      </ScrollView>
    </PixelModal>
  );
}

/** The list scrolls inside the sheet so the sheet's buttons stay on screen. */
const LIST_MAX_HEIGHT = 360;

const styles = StyleSheet.create({
  scroll: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  list: {
    gap: Spacing.sm,
  },
});
