import type { ColorValue } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { PIXEL } from '../theme';

import { ICON_SIZE_CELLS, iconCellColor, iconGrid, type IconName, type IconRole } from './icons';

type Props = {
  name: IconName;
  /** Size in dp; keep it a multiple of 12 × PIXEL (24, 48) so cells stay whole pixels. */
  size?: number;
  /**
   * Paint the icon in this one color (tab bar, buttons, disabled); its knockout roles stay empty.
   * Omit for the icon's own colors.
   */
  tint?: ColorValue;
  /** Screen-reader label. Without one the icon is decorative and hidden from accessibility. */
  label?: string;
  testID?: string;
};

/**
 * A pixel icon drawn from its character grid (icons.ts) as SVG rects, one per horizontal run. At the
 * default sizes a cell is a whole number of dp, so edges stay sharp.
 */
export function PixelIcon({ name, size = ICON_SIZE_CELLS * PIXEL, tint, label, testID }: Props) {
  const grid = iconGrid(name);
  const a11y = label
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: label }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };
  return (
    <Svg
      {...a11y}
      testID={testID}
      width={size}
      height={size}
      viewBox={`0 0 ${grid.width} ${grid.height}`}>
      {grid.runs.map((run) => {
        const fill = iconCellColor(name, run.role as IconRole, tint);
        return fill === undefined ? null : (
          <Rect
            key={`${run.x}-${run.y}`}
            x={run.x}
            y={run.y}
            width={run.width}
            height={1}
            fill={fill}
          />
        );
      })}
    </Svg>
  );
}
