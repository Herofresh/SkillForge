import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import type { ExerciseNode } from '@/domain/types';

import { NodeRow } from '../NodeRow';
import { Spacing } from '../theme';
import { PixelModal, PixelText, PixelTextInput } from '../ui';

type Props = {
  title: string;
  intro: string;
  /** The options for the current search text (the store's swap/add options). */
  options: (query: string) => ExerciseNode[];
  onPick: (nodeId: string) => void;
  onClose: () => void;
  /** Shows a search field (adding: every node can be found by name). */
  searchable?: boolean;
  empty: string;
  testID: string;
};

/** A sheet listing skill nodes to pick from (swap an exercise, add one). Mount it to open it. */
export function NodeOptionSheet({
  title,
  intro,
  options,
  onPick,
  onClose,
  searchable = false,
  empty,
  testID,
}: Props) {
  const [query, setQuery] = useState('');
  const list = options(query);
  return (
    <PixelModal visible title={title} onClose={onClose} closeLabel="Cancel" testID={testID}>
      <PixelText variant="small" tone="textMuted">
        {intro}
      </PixelText>
      {searchable && (
        <PixelTextInput
          label="Search"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. dip"
          testID={`${testID}-search`}
        />
      )}
      <ScrollView
        nestedScrollEnabled
        style={styles.scroll}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled">
        {list.length === 0 ? (
          <PixelText>{empty}</PixelText>
        ) : (
          list.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              onPress={() => onPick(node.id)}
              testID={`option-${node.id}`}
            />
          ))
        )}
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
