import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { BranchTabs } from '@/components/BranchTabs';
import { NodeRow } from '@/components/NodeRow';
import { ExerciseInfoSheet } from '@/components/node/ExerciseInfoSheet';
import { Colors, Spacing } from '@/components/theme';
import { TreeLegend } from '@/components/tree/TreeLegend';
import { NodeTile } from '@/components/tree/NodeTile';
import { TreeMap } from '@/components/tree/map/TreeMap';
import { TreeModeTabs } from '@/components/tree/TreeModeTabs';
import { PixelButton, PixelFrame, PixelText, PixelTextInput } from '@/components/ui';
import { BRANCH_NAMES } from '@/data/skills/branches';
import { customizedNodeIds } from '@/domain/overlayEdit';
import { mapFocus, mapLayout, mapTiles } from '@/domain/treeMap';
import {
  branchColumn,
  branchSummary,
  defaultBranch,
  searchTree,
  type TreeTile,
} from '@/domain/treeView';
import type { Branch, ExerciseNode } from '@/domain/types';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

/**
 * The Tree tab (PLAN 4.2): pick a branch, see its column of skill tiles in chain order with pixel
 * chains to their prerequisites, and tap a tile for the node detail; its "i" (or a long press, also
 * on the map) opens the exercise info sheet (PLAN 6.2). One branch at a time in a
 * FlatList of memoized tiles, so the 89-node tree stays light. "Add exercise" opens the editor for a
 * custom node in the branch (PLAN 4.7); the user's own changes carry a "Custom" tag.
 *
 * Map mode (PLAN 5.1, ADR-037) shows the whole tree as a pan/zoom graph instead. The layout
 * depends only on the tree, so it is computed once per `state.nodes`; progress only restyles it.
 * The mode is a setting (`treeMode`); Columns stays the screen-reader-friendly path.
 */
export default function TreeScreen() {
  const router = useRouter();
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const goals = useAppStore((state) => state.goals);
  const overlay = useAppStore((state) => state.overlay);
  const treeMode = useAppStore((state) => state.treeMode);
  const setTreeMode = useAppStore((state) => state.setTreeMode);
  const customized = useMemo(() => customizedNodeIds(overlay), [overlay]);
  const [branch, setBranch] = useState<Branch>(() => defaultBranch(nodes, goals));
  const [legendOpen, setLegendOpen] = useState(false);
  /** The search text (FB-17): while it has one, the column shows matching skills of every branch. */
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const results = useMemo(
    () => (searching ? searchTree(nodes, query) : []),
    [nodes, query, searching],
  );
  /** The node whose info sheet is open (PLAN 6.2): from a tile's "i" or a long press. */
  const [infoId, setInfoId] = useState<string | undefined>();
  const infoNode = infoId === undefined ? undefined : nodes.find((node) => node.id === infoId);
  const tiles = useMemo(
    () => branchColumn(nodes, branch, progress, goals),
    [nodes, branch, progress, goals],
  );
  const summary = useMemo(() => branchSummary(tiles), [tiles]);

  const openNode = useCallback(
    (nodeId: string) => router.push({ pathname: '/node/[nodeId]', params: { nodeId } }),
    [router],
  );
  const openInfo = useCallback((nodeId: string) => setInfoId(nodeId), []);
  const renderItem = useCallback<ListRenderItem<TreeTile | ExerciseNode>>(
    ({ item }) =>
      'node' in item ? (
        <NodeTile
          tile={item}
          onOpen={openNode}
          onInfo={openInfo}
          custom={customized.has(item.node.id)}
        />
      ) : (
        <View style={styles.result}>
          <NodeRow
            node={item}
            status={t(BRANCH_NAMES[item.branch])}
            onPress={() => openNode(item.id)}
            onInfo={() => openInfo(item.id)}
            accessibilityHint={t('Opens the skill')}
            testID={`tree-result-${item.id}`}
          />
        </View>
      ),
    [openNode, openInfo, customized],
  );
  const infoSheet = infoNode && (
    <ExerciseInfoSheet
      node={infoNode}
      onClose={() => setInfoId(undefined)}
      onOpenDetail={() => {
        setInfoId(undefined);
        openNode(infoNode.id);
      }}
    />
  );

  const header = (
    <PixelFrame variant="raised" contentStyle={styles.header}>
      <PixelText variant="label" tone="rune">
        {t('Skill Tree')}
      </PixelText>
      <PixelTextInput
        label={t('Search')}
        accessibilityLabel={t('Search the whole tree by skill name')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('Skill name, e.g. dip')}
        autoCorrect={false}
        testID="tree-search"
      />
      {searching ? (
        <PixelText variant="small" tone="textMuted" testID="tree-search-summary">
          {results.length === 0
            ? t('No skill matches {query}.', { query: query.trim() })
            : results.length === 1
              ? t('1 skill matches, from every branch')
              : t('{n} skills match, from every branch', { n: results.length })}
        </PixelText>
      ) : (
        <>
          <PixelText variant="title" accessibilityRole="header" testID="tree-branch-title">
            {t(BRANCH_NAMES[branch])}
          </PixelText>
          <PixelText variant="small" tone="textMuted" testID="tree-branch-summary">
            {t('{open} of {total} open · {proficient} proficient', {
              open: summary.open,
              total: summary.total,
              proficient: summary.proficient,
            }) +
              (summary.goals > 0
                ? ` · ${summary.goals === 1 ? t('1 goal') : t('{n} goals', { n: summary.goals })}`
                : '')}
          </PixelText>
        </>
      )}
      <View style={styles.headerButtons}>
        <PixelButton
          label={t('Legend')}
          icon="scroll"
          variant="secondary"
          onPress={() => setLegendOpen(true)}
          testID="tree-legend"
        />
        <PixelButton
          label={t('Add exercise')}
          icon="quill"
          variant="secondary"
          onPress={() => router.push({ pathname: '/progressions/new', params: { branch } })}
          accessibilityHint={t('Adds your own exercise to this branch')}
          testID="tree-add-exercise"
        />
      </View>
    </PixelFrame>
  );

  if (treeMode === 'map') {
    return (
      <View style={styles.root} testID="tree-screen">
        <View style={styles.tabs}>
          <TreeModeTabs value={treeMode} onChange={setTreeMode} />
        </View>
        <TreeMapMode openNode={openNode} openInfo={openInfo} customized={customized} />
        {infoSheet}
      </View>
    );
  }

  return (
    <View style={styles.root} testID="tree-screen">
      <View style={styles.tabs}>
        <TreeModeTabs value={treeMode} onChange={setTreeMode} />
        <BranchTabs value={branch} onChange={setBranch} />
      </View>
      <FlatList<TreeTile | ExerciseNode>
        data={searching ? results : tiles}
        keyExtractor={(item) => ('node' in item ? item.node.id : `result-${item.id}`)}
        renderItem={renderItem}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        windowSize={7}
        testID="tree-column"
      />
      <TreeLegend visible={legendOpen} onClose={() => setLegendOpen(false)} />
      {infoSheet}
    </View>
  );
}

/** Map mode: the layout (once per tree), the node states and the focus, memoized over store state. */
function TreeMapMode({
  openNode,
  openInfo,
  customized,
}: {
  openNode: (nodeId: string) => void;
  openInfo: (nodeId: string) => void;
  customized: ReadonlySet<string>;
}) {
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const goals = useAppStore((state) => state.goals);
  const setTreeMode = useAppStore((state) => state.setTreeMode);
  const layout = useMemo(() => mapLayout(nodes), [nodes]);
  const mapState = useMemo(() => mapTiles(nodes, progress, goals), [nodes, progress, goals]);
  const focus = useMemo(() => mapFocus(layout, mapState, goals), [layout, mapState, goals]);
  return (
    <TreeMap
      layout={layout}
      state={mapState}
      focus={focus}
      customized={customized}
      onOpen={openNode}
      onInfo={openInfo}
      onSwitchToList={() => setTreeMode('columns')}
    />
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
    gap: Spacing.sm,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    gap: Spacing.xs,
  },
  result: {
    marginTop: Spacing.sm,
  },
  headerButtons: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
