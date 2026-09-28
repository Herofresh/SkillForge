import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatLevelProgress, formatOgLevel } from '@/domain/format';
import { tierForOgLevel } from '@/domain/tier';
import type { TreeTile } from '@/domain/treeView';

import { Border, Colors, Spacing, TileFrames, TOUCH_TARGET } from '../theme';
import { PixelFrame, PixelIcon, PixelText, TierChip, XPBar } from '../ui';

import { CHAIN_HEIGHT, CHAIN_WIDTH, ChainLink } from './ChainLink';
import { PrereqChip } from './PrereqChip';
import {
  TILE_LOOKS,
  TRAINED_TILE_STATES,
  tileAccessibilityLabel,
  tileStateLabel,
} from './tileLook';

type Props = {
  tile: TreeTile;
  /** Opens a node's detail (the tile's own node, or a linked prerequisite). */
  onOpen: (nodeId: string) => void;
  /** The user added or changed this node (PLAN 4.7): a "Custom" tag. */
  custom?: boolean;
};

/** "GOAL" with a star in a small gold frame. */
export function GoalMarker({ testID }: { testID?: string }) {
  return (
    <View style={styles.marker} testID={testID}>
      <PixelFrame variant="gold" shadow={false} padding={Spacing.xs}>
        <View style={styles.markerRow}>
          <PixelIcon name="star" />
          <PixelText variant="label" tone="gold">
            Goal
          </PixelText>
        </View>
      </PixelFrame>
    </View>
  );
}

/**
 * One skill node in the tree column (PLAN 4.2): an optional chain to the tile above, then a pixel
 * panel framed by its state (`TileFrames`) with the state icon, name, tier, OG level, a goal
 * marker, a "Custom" tag for the user's own changes, the level and XP bar once trained, and linked chips for its other prerequisites.
 * Memoized: the column re-renders only the tiles whose data changed.
 */
export const NodeTile = memo(function NodeTile({ tile, onOpen, custom = false }: Props) {
  const { node, state, level, isGoal, chainAbove, links } = tile;
  const look = TILE_LOOKS[state];
  const trained = TRAINED_TILE_STATES.includes(state);
  const silhouette = state === 'legendary';
  const label = tileAccessibilityLabel(tile, custom);

  return (
    <View>
      <View style={styles.chainSlot}>{chainAbove && <ChainLink met={chainAbove.met} />}</View>
      <Pressable
        onPress={() => onOpen(node.id)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens the skill"
        testID={`tile-${node.id}`}>
        {({ pressed }) => (
          <PixelFrame frame={TileFrames[state]} pressed={pressed} padding={Spacing.sm}>
            <View style={styles.row}>
              <PixelIcon name={look.icon} tint={silhouette ? Colors.goldDark : undefined} />
              <View style={styles.text}>
                <PixelText variant="heading" tone={look.nameTone}>
                  {node.name}
                </PixelText>
                <View style={styles.meta}>
                  <TierChip tier={tierForOgLevel(node.ogLevel)} />
                  <PixelText variant="label" tone="textMuted">
                    {formatOgLevel(node.ogLevel)}
                  </PixelText>
                  {node.straightArm && (
                    <PixelText variant="label" tone="ember">
                      Straight-arm
                    </PixelText>
                  )}
                  {custom && (
                    <View style={styles.customTag} testID={`tile-custom-${node.id}`}>
                      <PixelIcon name="quill" />
                      <PixelText variant="label" tone="arcane">
                        Custom
                      </PixelText>
                    </View>
                  )}
                </View>
              </View>
              {isGoal && <GoalMarker testID={`tile-goal-${node.id}`} />}
            </View>
            <View style={styles.status}>
              {trained ? (
                <XPBar
                  label={`LV ${level.level} · ${look.label}`}
                  valueText={formatLevelProgress(level)}
                  fraction={level.fraction}
                  testID={`tile-state-${node.id}`}
                />
              ) : (
                <PixelText variant="label" tone={look.tone} testID={`tile-state-${node.id}`}>
                  {tileStateLabel(tile)}
                </PixelText>
              )}
            </View>
            {links.length > 0 && (
              <View style={styles.links}>
                {links.map((link) => (
                  <PrereqChip
                    key={link.node.id}
                    link={link}
                    onPress={onOpen}
                    testID={`tile-link-${node.id}-${link.node.id}`}
                  />
                ))}
              </View>
            )}
          </PixelFrame>
        )}
      </Pressable>
    </View>
  );
});

/** The chain sits under the centre of the 24 dp state icon (two frame lines + padding in). */
const ICON_SIZE = 24;
const CHAIN_INSET = 2 * Border.line + Spacing.sm + ICON_SIZE / 2 - CHAIN_WIDTH / 2;

const styles = StyleSheet.create({
  chainSlot: {
    height: CHAIN_HEIGHT,
    paddingLeft: CHAIN_INSET,
  },
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  marker: {
    alignSelf: 'flex-start',
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  status: {
    marginTop: Spacing.sm,
  },
  links: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
