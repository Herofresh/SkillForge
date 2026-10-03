import Svg, { Rect } from 'react-native-svg';

import { HERO_CLASS_BY_ID, type EmblemRole, type HeroClass } from '@/data/classes';
import { parsePixelGrid, type PixelGrid } from '@/lib/pixelGrid';

import { Palette } from '../palette';
import { Colors, PIXEL, type FrameStyle } from '../theme';
import { PixelFrame } from '../ui';

const EMBLEM_ROLES = '#+*o';
const EMBLEM_CELLS = 12;

const grids = new Map<string, PixelGrid>();

function emblemGrid(heroClass: HeroClass): PixelGrid {
  let grid = grids.get(heroClass.id);
  if (!grid) {
    grid = parsePixelGrid(heroClass.emblem, EMBLEM_ROLES);
    grids.set(heroClass.id, grid);
  }
  return grid;
}

/** The class color as a hex value (the data stores Palette keys). */
export function classColor(classId: string): string {
  const heroClass = HERO_CLASS_BY_ID.get(classId);
  return heroClass ? Palette[heroClass.color] : Colors.text;
}

/**
 * The frame of a class emblem by tier (DESIGN.md → Classes): locked = the legendary silhouette,
 * tier I = a single line in the class color, tier II = a double line, tier III = the class color
 * inside a gold crown line.
 */
export function classFrame(classId: string, tier: number): FrameStyle {
  const color = classColor(classId);
  if (tier <= 0) return { lines: [Colors.ink, Colors.goldDark], fill: Colors.ink };
  if (tier === 1) return { lines: [Colors.ink, color], fill: Colors.surfaceRaised };
  if (tier === 2)
    return { lines: [Colors.ink, color, Colors.ink, color], fill: Colors.surfaceRaised };
  return { lines: [Colors.ink, Colors.goldLight, Colors.gold, color], fill: Colors.surfaceRaised };
}

type Props = {
  classId: string;
  /** Reached tier; 0 draws the locked silhouette (the emblem in gold-dark). */
  tier: number;
  /** Emblem size in dp; keep it a multiple of 12 × PIXEL (24, 48). */
  size?: number;
  /** Draw the emblem without its tier frame. */
  bare?: boolean;
  testID?: string;
};

/**
 * A hero class's pixel emblem (12 × 12 grid from `src/data/classes.ts`) in its tier frame.
 * Decorative: the surrounding row carries the accessible text.
 */
export function ClassEmblem({ classId, tier, size = 24 * PIXEL, bare = false, testID }: Props) {
  const heroClass = HERO_CLASS_BY_ID.get(classId);
  if (!heroClass) return null;
  const grid = emblemGrid(heroClass);
  const locked = tier <= 0;
  const svg = (
    <Svg
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
      width={size}
      height={size}
      viewBox={`0 0 ${EMBLEM_CELLS} ${EMBLEM_CELLS}`}>
      {grid.runs.map((run) => {
        const key = heroClass.emblemColors[run.role as EmblemRole];
        if (key === undefined) return null;
        return (
          <Rect
            key={`${run.x}-${run.y}`}
            x={run.x}
            y={run.y}
            width={run.width}
            height={1}
            fill={locked ? Colors.goldDark : Palette[key]}
          />
        );
      })}
    </Svg>
  );
  if (bare) return svg;
  return (
    <PixelFrame frame={classFrame(classId, tier)} padding={PIXEL * 3}>
      {svg}
    </PixelFrame>
  );
}
