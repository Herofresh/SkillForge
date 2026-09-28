import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { BranchTabs } from '@/components/BranchTabs';
import { Colors, Spacing } from '@/components/theme';
import { TreeLegend } from '@/components/tree/TreeLegend';
import { NodeTile } from '@/components/tree/NodeTile';
import { PixelButton, PixelFrame, PixelText } from '@/components/ui';
import { BRANCH_NAMES } from '@/data/skills/branches';
import { customizedNodeIds } from '@/domain/overlayEdit';
import { branchColumn, branchSummary, defaultBranch, type TreeTile } from '@/domain/treeView';
import type { Branch } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * The Tree tab (PLAN 4.2): pick a branch, see its column of skill tiles in chain order with pixel
 * chains to their prerequisites, and tap a tile for the node detail. One branch at a time in a
 * FlatList of memoized tiles, so the 89-node tree stays light. "Add exercise" opens the editor for a
 * custom node in the branch (PLAN 4.7); the user's own changes carry a "Custom" tag.
 */
export default function TreeScreen() {
  const router = useRouter();
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const goals = useAppStore((state) => state.goals);
  const overlay = useAppStore((state) => state.overlay);
  const customized = useMemo(() => customizedNodeIds(overlay), [overlay]);
  const [branch, setBranch] = useState<Branch>(() => defaultBranch(nodes, goals));
  const [legendOpen, setLegendOpen] = useState(false);
  const tiles = useMemo(
    () => branchColumn(nodes, branch, progress, goals),
    [nodes, branch, progress, goals],
  );
  const summary = useMemo(() => branchSummary(tiles), [tiles]);

  const openNode = useCallback(
    (nodeId: string) => router.push({ pathname: '/node/[nodeId]', params: { nodeId } }),
    [router],
  );
  const renderTile = useCallback<ListRenderItem<TreeTile>>(
    ({ item }) => <NodeTile tile={item} onOpen={openNode} custom={customized.has(item.node.id)} />,
    [openNode, customized],
  );

  const header = (
    <PixelFrame variant="raised" contentStyle={styles.header}>
      <PixelText variant="label" tone="rune">
        Skill Tree
      </PixelText>
      <PixelText variant="title" accessibilityRole="header" testID="tree-branch-title">
        {BRANCH_NAMES[branch]}
      </PixelText>
      <PixelText variant="small" tone="textMuted" testID="tree-branch-summary">
        {`${summary.open} of ${summary.total} open · ${summary.proficient} proficient` +
          (summary.goals > 0
            ? ` · ${summary.goals} ${summary.goals === 1 ? 'goal' : 'goals'}`
            : '')}
      </PixelText>
      <View style={styles.headerButtons}>
        <PixelButton
          label="Legend"
          icon="scroll"
          variant="secondary"
          onPress={() => setLegendOpen(true)}
          testID="tree-legend"
        />
        <PixelButton
          label="Add exercise"
          icon="quill"
          variant="secondary"
          onPress={() => router.push({ pathname: '/progressions/new', params: { branch } })}
          accessibilityHint="Adds your own exercise to this branch"
          testID="tree-add-exercise"
        />
      </View>
    </PixelFrame>
  );

  return (
    <View style={styles.root} testID="tree-screen">
      <View style={styles.tabs}>
        <BranchTabs value={branch} onChange={setBranch} />
      </View>
      <FlatList
        data={tiles}
        keyExtractor={(tile) => tile.node.id}
        renderItem={renderTile}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        windowSize={7}
        testID="tree-column"
      />
      <TreeLegend visible={legendOpen} onClose={() => setLegendOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    paddingTop: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    gap: Spacing.xs,
  },
  headerButtons: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
