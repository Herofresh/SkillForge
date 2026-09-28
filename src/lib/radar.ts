/**
 * Geometry for pixel-art radar charts: points on the spokes of a regular polygon and a polygon
 * rasterized into square cells (so the filled area is drawn as crisp "pixels" instead of a smooth
 * shape). Plain math, no React.
 */

export interface Point {
  x: number;
  y: number;
}

/** A horizontal run of filled cells in row `y`, starting at column `x`. */
export interface CellRun {
  x: number;
  y: number;
  width: number;
}

const FULL_TURN = 2 * Math.PI;
/** Spoke 0 points straight up; the others follow clockwise. */
const START_ANGLE = -Math.PI / 2;

/** The point at `fraction` (0–1) of `radius` along spoke `index` of `count`. */
export function spokePoint(
  center: Point,
  radius: number,
  index: number,
  count: number,
  fraction = 1,
): Point {
  const angle = START_ANGLE + (FULL_TURN * index) / count;
  return {
    x: center.x + Math.cos(angle) * radius * fraction,
    y: center.y + Math.sin(angle) * radius * fraction,
  };
}

/** One point per value, each at its fraction (clamped to 0–1) of `radius` on its spoke. */
export function radarPolygon(fractions: readonly number[], center: Point, radius: number): Point[] {
  return fractions.map((fraction, index) =>
    spokePoint(center, radius, index, fractions.length, Math.min(Math.max(fraction, 0), 1)),
  );
}

/** Even-odd point-in-polygon test (ray casting to the right). */
export function isInsidePolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses = a.y > point.y !== b.y > point.y;
    if (crosses && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** `polygon` scaled by `factor` towards (< 1) or away from (> 1) `center`. */
export function scalePolygon(polygon: readonly Point[], center: Point, factor: number): Point[] {
  return polygon.map((point) => ({
    x: center.x + (point.x - center.x) * factor,
    y: center.y + (point.y - center.y) * factor,
  }));
}

/** A straight line from `a` to `b` as a thin rectangle (`thickness` wide) to rasterize. */
export function segmentQuad(a: Point, b: Point, thickness: number): Point[] {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (length === 0) return [];
  const nx = (-(b.y - a.y) / length) * (thickness / 2);
  const ny = ((b.x - a.x) / length) * (thickness / 2);
  return [
    { x: a.x + nx, y: a.y + ny },
    { x: b.x + nx, y: b.y + ny },
    { x: b.x - nx, y: b.y - ny },
    { x: a.x - nx, y: a.y - ny },
  ];
}

/**
 * The cells of a `columns` × `rows` grid (cell size `cell`) whose centres lie inside `polygon`
 * (and not inside `hole`, when given: an outline or ring), merged into horizontal runs.
 * Coordinates of the runs are in cells.
 */
export function rasterizePolygon(
  polygon: readonly Point[],
  cell: number,
  columns: number,
  rows: number,
  hole?: readonly Point[],
): CellRun[] {
  const runs: CellRun[] = [];
  if (polygon.length < 3) return runs;
  const holed = hole !== undefined && hole.length >= 3;
  const covers = (point: Point): boolean =>
    isInsidePolygon(point, polygon) && !(holed && isInsidePolygon(point, hole));
  for (let y = 0; y < rows; y += 1) {
    let start: number | undefined;
    for (let x = 0; x <= columns; x += 1) {
      const inside = x < columns && covers({ x: (x + 0.5) * cell, y: (y + 0.5) * cell });
      if (inside && start === undefined) start = x;
      if (!inside && start !== undefined) {
        runs.push({ x: start, y, width: x - start });
        start = undefined;
      }
    }
  }
  return runs;
}
