import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BRANCH_NAMES } from '@/data/skills/branches';
import { BRANCHES, type Branch } from '@/domain/types';

import { Spacing } from './theme';
import { PixelChip } from './ui';

type Props = {
  value: Branch;
  onChange: (branch: Branch) => void;
  /** Tab ids are `${testIDPrefix}-${branch}` (default `branch`). */
  testIDPrefix?: string;
};

/**
 * The branches as a horizontally scrolling row of pixel tabs (goal picker, Tree tab). Scrolls the
 * selected tab into view when it first lays out, so a preselected later branch isn't hidden.
 */
export function BranchTabs({ value, onChange, testIDPrefix = 'branch' }: Props) {
  const scroll = useRef<ScrollView>(null);
  const revealed = useRef(false);
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist">
      {BRANCHES.map((branch) => (
        <View
          key={branch}
          onLayout={(event) => {
            if (branch !== value || revealed.current) return;
            revealed.current = true;
            const x = Math.max(event.nativeEvent.layout.x - Spacing.md, 0);
            scroll.current?.scrollTo({ x, animated: false });
          }}>
          <PixelChip
            role="tab"
            label={BRANCH_NAMES[branch]}
            selected={branch === value}
            onPress={() => onChange(branch)}
            testID={`${testIDPrefix}-${branch}`}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
});
