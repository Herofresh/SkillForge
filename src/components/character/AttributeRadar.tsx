import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import type { RadarAxis } from '@/domain/characterView';
import {
  radarPolygon,
  rasterizePolygon,
  scalePolygon,
  segmentQuad,
  spokePoint,
  type CellRun,
  type Point,
} from '@/lib/radar';

import { ATTRIBUTE_LABELS } from '../node/AttributeChips';
import { AttributeColors, Colors, PIXEL } from '../theme';
import { PixelText } from '../ui';

type Props = {
  axes: readonly RadarAxis[];
  testID?: string;
};

/** One radar "pixel" in dp (3 art pixels): coarse enough to read as pixel art on a phone. */
const CELL = 3 * PIXEL;
/** Rings at a third, two thirds and the full value (the largest attribute). */
const RING_FRACTIONS = [1 / 3, 2 / 3, 1];
/** Room for a label next to a side spoke (the longest name, MOBILITY, in the caps font). */
const LABEL_WIDTH = 80;
const LABEL_HEIGHT = 36;
/** Side spokes (±30° from horizontal) reach cos 30° of the radius sideways. */
const SIDE_REACH = Math.cos(Math.PI / 6);
const MIN_RADIUS_CELLS = 10;
const MAX_RADIUS_CELLS = 20;
/** How far outside the grid a label sits (dp). */
const LABEL_GAP = 4 * PIXEL;
/** Fill opacity of the value area; its outline and vertex markers are drawn solid. */
const FILL_OPACITY = 0.4;
/** Line thickness of the rings and the value outline, in cells (≥ 1.5 so cell centres never miss it). */
const LINE_CELLS = 1.5;
/** Vertex markers: a square of this many cells. */
const MARKER_CELLS = 2;

function Runs({ runs, color, opacity }: { runs: CellRun[]; color: string; opacity?: number }) {
  return (
    <>
      {runs.map((run, index) => (
        <Rect
          // Layers built from several shapes (rings, spokes) can repeat a position.
          key={index}
          x={run.x * CELL}
          y={run.y * CELL}
          width={run.width * CELL}
          height={CELL}
          fill={color}
          opacity={opacity}
        />
      ))}
    </>
  );
}

/**
 * The six attributes as a pixel-art radar (PLAN 4.5): a hexagon grid, the value area rasterized
 * into square cells (gold, with a solid outline) and a marker in each attribute's color. Values are
 * normalised by the domain (`radarAxes`); the chart sizes itself to its container.
 */
export function AttributeRadar({ axes, testID }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const radiusCells = Math.max(
    MIN_RADIUS_CELLS,
    Math.min(
      MAX_RADIUS_CELLS,
      Math.floor((width / 2 - LABEL_WIDTH - LABEL_GAP) / SIDE_REACH / CELL),
    ),
  );
  const radius = radiusCells * CELL;
  const cells = 2 * radiusCells + 1;
  const size = cells * CELL;
  const center: Point = { x: size / 2, y: size / 2 };
  const count = axes.length;

  const layers = useMemo(() => {
    const middle: Point = { x: size / 2, y: size / 2 };
    const rim = (fraction: number) =>
      radarPolygon(
        axes.map(() => fraction),
        middle,
        radius,
      );
    const ring = (fraction: number) =>
      rasterizePolygon(
        rim(fraction),
        CELL,
        cells,
        cells,
        scalePolygon(rim(fraction), middle, 1 - (LINE_CELLS * CELL) / (fraction * radius)),
      );
    const spokes = axes.flatMap((_, index) =>
      rasterizePolygon(
        segmentQuad(middle, spokePoint(middle, radius, index, axes.length), CELL),
        CELL,
        cells,
        cells,
      ),
    );
    const value = radarPolygon(
      axes.map((axis) => axis.fraction),
      middle,
      radius,
    );
    const outline = rasterizePolygon(
      value,
      CELL,
      cells,
      cells,
      scalePolygon(value, middle, 1 - (LINE_CELLS * CELL) / radius),
    );
    return {
      rings: RING_FRACTIONS.flatMap(ring),
      spokes,
      fill: rasterizePolygon(value, CELL, cells, cells),
      outline,
      markers: value.map((point) => ({
        x: Math.round(point.x / CELL - MARKER_CELLS / 2) * CELL,
        y: Math.round(point.y / CELL - MARKER_CELLS / 2) * CELL,
      })),
    };
  }, [axes, radius, cells, size]);

  const summary = axes
    .map((axis) => `${ATTRIBUTE_LABELS[axis.attribute]} ${axis.value}`)
    .join(', ');
  const height = size + 2 * (LABEL_HEIGHT + LABEL_GAP);
  const top = LABEL_HEIGHT + LABEL_GAP;

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Attribute radar: ${summary}`}
      style={[styles.container, { height }]}>
      {width > 0 && (
        <>
          <View style={[styles.chart, { top, left: width / 2 - size / 2 }]}>
            <Svg width={size} height={size}>
              <Runs runs={layers.rings} color={Colors.border} />
              <Runs runs={layers.spokes} color={Colors.border} />
              <Runs runs={layers.fill} color={Colors.gold} opacity={FILL_OPACITY} />
              <Runs runs={layers.outline} color={Colors.gold} />
              {layers.markers.map((marker, index) =>
                axes[index].value === 0 ? null : (
                  <Rect
                    key={axes[index].attribute}
                    x={marker.x}
                    y={marker.y}
                    width={MARKER_CELLS * CELL}
                    height={MARKER_CELLS * CELL}
                    fill={AttributeColors[axes[index].attribute]}
                    stroke={Colors.ink}
                    strokeWidth={PIXEL / 2}
                  />
                ),
              )}
            </Svg>
          </View>
          {axes.map((axis, index) => {
            const tip = spokePoint(center, radius + LABEL_GAP, index, count);
            const x = width / 2 - size / 2 + tip.x;
            const y = top + tip.y;
            const side =
              Math.abs(tip.x - center.x) < 1 ? 'middle' : tip.x > center.x ? 'right' : 'left';
            const above = tip.y < center.y;
            return (
              <View
                key={axis.attribute}
                style={[
                  styles.label,
                  {
                    left:
                      side === 'middle'
                        ? x - LABEL_WIDTH / 2
                        : side === 'right'
                          ? x
                          : x - LABEL_WIDTH,
                    top: side === 'middle' ? (above ? y - LABEL_HEIGHT : y) : y - LABEL_HEIGHT / 2,
                    alignItems:
                      side === 'middle' ? 'center' : side === 'right' ? 'flex-start' : 'flex-end',
                  },
                ]}>
                <PixelText variant="label" color={AttributeColors[axis.attribute]}>
                  {ATTRIBUTE_LABELS[axis.attribute]}
                </PixelText>
                <PixelText variant="label" tone="text">
                  {String(axis.value)}
                </PixelText>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chart: {
    position: 'absolute',
  },
  label: {
    position: 'absolute',
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    justifyContent: 'center',
  },
});
