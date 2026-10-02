import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { tierForOgLevel } from '@/domain/tier';
import type { MapNodePlacement } from '@/domain/treeMap';
import type { TreeTile } from '@/domain/treeView';

import { Colors, PIXEL, Spacing, TierColors, TileFrames } from '../../theme';
import { PixelFrame, PixelIcon, PixelText } from '../../ui';
import {
  TILE_LOOKS,
  TRAINED_TILE_STATES,
  tileAccessibilityLabel,
  tileStateLabel,
} from '../tileLook';

type Props = {
  tile: TreeTile;
  place: MapNodePlacement;
  onOpen: (nodeId: string) => void;
  custom: boolean;
  /** Long press opens the exercise info sheet (PLAN 6.2); the node is too small for an "i". */
  onInfo?: (nodeId: string) => void;
};

/** Map text may grow with the system font a little; the map node has a fixed size (the column view scales fully). */
const MAX_FONT_SCALE = 1.2;
const TIER_PIP = 4 * PIXEL;

/**
 * One node on the tree map (PLAN 5.1): the column tile's look in a fixed-size card, framed by its
 * state (`TileFrames`), with the state icon, a goal star (else the quill of a custom node), the name, a tier pip and the state or
 * level line. A long press opens the exercise info sheet (PLAN 6.2). Same accessible label as the
 * column tile. Memoized: panning never re-renders it.
 */
export const MapNode = memo(function MapNode({ tile, place, onOpen, custom, onInfo }: Props) {
  const { node, state, level, isGoal } = tile;
  const look = TILE_LOOKS[state];
  const silhouette = state === 'legendary';
  const status = TRAINED_TILE_STATES.includes(state)
    ? `LV ${level.level}` // the state icon (sword, shield, star) says the rest
    : tileStateLabel(tile);
  return (
    <Pressable
      onPress={() => onOpen(node.id)}
      onLongPress={onInfo && (() => onInfo(node.id))}
      accessibilityRole="button"
      accessibilityLabel={tileAccessibilityLabel(tile, custom)}
      accessibilityHint={
        onInfo ? 'Opens the skill. Long press shows what the exercise is.' : 'Opens the skill'
      }
      testID={`map-node-${node.id}`}
      style={[
        styles.slot,
        { left: place.x, top: place.y, width: place.width, height: place.height },
      ]}>
      {({ pressed }) => (
        <PixelFrame
          frame={TileFrames[state]}
          pressed={pressed}
          padding={Spacing.xs}
          style={styles.fill}
          contentStyle={styles.fill}>
          <View style={styles.row}>
            <View style={styles.icons}>
              <PixelIcon name={look.icon} tint={silhouette ? Colors.goldDark : undefined} />
              {isGoal ? (
                <PixelIcon name="star" testID={`map-goal-${node.id}`} />
              ) : (
                custom && <PixelIcon name="quill" />
              )}
            </View>
            <View style={styles.text}>
              <PixelText
                variant="small"
                tone={look.nameTone}
                numberOfLines={2}
                maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {node.name}
              </PixelText>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.pip,
                    { backgroundColor: TierColors[tierForOgLevel(node.ogLevel)] },
                  ]}
                />
                <PixelText
                  variant="label"
                  tone={look.tone}
                  numberOfLines={1}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  style={styles.status}
                  testID={`map-state-${node.id}`}>
                  {status}
                </PixelText>
              </View>
            </View>
          </View>
        </PixelFrame>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
  },
  fill: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  icons: {
    gap: Spacing.xs,
  },
  text: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pip: {
    width: TIER_PIP,
    height: TIER_PIP,
  },
  status: {
    flexShrink: 1,
  },
});
