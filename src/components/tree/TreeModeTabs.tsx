import { StyleSheet, View } from 'react-native';

import type { TreeMode } from '@/domain/treeMap';
import { k, t } from '@/i18n';

import { Spacing } from '../theme';
import { PixelChip } from '../ui';

type Props = {
  value: TreeMode;
  onChange: (mode: TreeMode) => void;
};

const MODES: readonly { mode: TreeMode; label: string; spoken: string }[] = [
  { mode: 'columns', label: k('Columns'), spoken: k('Columns, one branch as a list') },
  { mode: 'map', label: k('Map'), spoken: k('Map of the whole tree') },
];

/** Columns | Map: the Tree tab's two views (PLAN 5.1, ADR-003). */
export function TreeModeTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {MODES.map(({ mode, label, spoken }) => (
        <PixelChip
          key={mode}
          role="tab"
          label={t(label)}
          accessibilityLabel={t(spoken)}
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
