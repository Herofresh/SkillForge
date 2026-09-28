import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRANCH_NAMES } from '@/data/skills/branches';
import { routeRects, type MapEdge, type MapLayout } from '@/domain/treeMap';

import { BranchColors, ChainColors, MapStyle, Spacing } from '../../theme';
import { PixelText } from '../../ui';

type Props = {
  layout: MapLayout;
  /** Edge keys whose prerequisite is met (`mapTiles`). */
  metEdges: ReadonlySet<string>;
};

/**
 * The tree map's background (PLAN 5.1): a stone band per branch with its colored rule and caps
 * title, and every hard prerequisite as a square-cornered pixel line. A met one is a gold line on
 * a soft gold glow, an unmet one a thin dull steel line; lit paths are drawn last so they stay on
 * top. Plain views, not SVG: react-native-svg rasterizes an SVG into one bitmap of its full size,
 * which for the whole map is larger than Android can draw. Decorative: the nodes' labels carry
 * the same information for screen readers.
 */
export const MapCanvas = memo(function MapCanvas({ layout, metEdges }: Props) {
  const unmet = layout.edges.filter((edge) => !metEdges.has(edge.key));
  const met = layout.edges.filter((edge) => metEdges.has(edge.key));
  return (
    <View
      style={[styles.canvas, { width: layout.width, height: layout.height }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {layout.lanes.map((lane) => (
        <View
          key={`lane-${lane.branch}`}
          style={[
            styles.lane,
            {
              left: lane.x,
              top: lane.y,
              width: lane.width,
              height: lane.height,
              borderTopColor: BranchColors[lane.branch],
            },
          ]}>
          <PixelText
            variant="label"
            color={BranchColors[lane.branch]}
            numberOfLines={1}
            maxFontSizeMultiplier={1}
            style={styles.title}>
            {BRANCH_NAMES[lane.branch]}
          </PixelText>
        </View>
      ))}
      {unmet.map((edge) => (
        <Route key={edge.key} edge={edge} color={ChainColors.unmet} width={MapStyle.unmetWidth} />
      ))}
      {met.map((edge) => (
        <Route
          key={`glow-${edge.key}`}
          edge={edge}
          color={ChainColors.met}
          width={MapStyle.glowWidth}
          opacity={MapStyle.glowOpacity}
        />
      ))}
      {met.map((edge) => (
        <Route key={edge.key} edge={edge} color={ChainColors.met} width={MapStyle.chainWidth} />
      ))}
    </View>
  );
});

function Route({
  edge,
  color,
  width,
  opacity,
}: {
  edge: MapEdge;
  color: string;
  width: number;
  opacity?: number;
}) {
  return (
    <>
      {routeRects(edge.points, width).map((rect, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              backgroundColor: color,
              opacity,
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  lane: {
    position: 'absolute',
    backgroundColor: MapStyle.laneFill,
    borderTopWidth: MapStyle.laneRule,
  },
  title: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  segment: {
    position: 'absolute',
  },
});
