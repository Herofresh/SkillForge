import { StyleSheet, View } from 'react-native';

import type { TreeMode } from '@/domain/treeMap';

import { Spacing } from '../theme';
import { PixelChip } from '../ui';

type Props = {
  value: TreeMode;
  onChange: (mode: TreeMode) => void;
};

const MODES: readonly { mode: TreeMode; label: string; spoken: string }[] = [
  { mode: 'columns', label: 'Columns', spoken: 'Columns, one branch as a list' },
  { mode: 'map', label: 'Map', spoken: 'Map of the whole tree' },
];

/** Columns | Map: the Tree tab's two views (PLAN 5.1, ADR-003). */
export function TreeModeTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {MODES.map(({ mode, label, spoken }) => (
        <PixelChip
          key={mode}
          role="tab"
          label={label}
          accessibilityLabel={spoken}
          selected={mode === value}
          onPress={() => onChange(mode)}
          testID={`tree-mode-${mode}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
