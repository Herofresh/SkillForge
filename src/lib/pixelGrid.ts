/**
 * Pixel-art grids: an icon is a list of equal-length rows of characters, one character per cell.
 * `.` (or a space) is transparent; every other character is a color role that the caller maps to a
 * color. `parsePixelGrid` merges horizontal runs of the same role into one rect, so a 12×12 icon
 * renders as a few dozen SVG rects instead of 144.
 */

/** Characters that leave a cell empty. */
export const TRANSPARENT_CELLS = ['.', ' '] as const;

export interface PixelRun {
  /** Column of the first cell. */
  x: number;
  /** Row. */
  y: number;
  /** Number of cells in the run. */
  width: number;
  /** The role character, e.g. `#`. */
  role: string;
}

export interface PixelGrid {
  width: number;
  height: number;
  runs: PixelRun[];
}

function isTransparent(cell: string): boolean {
  return (TRANSPARENT_CELLS as readonly string[]).includes(cell);
}

/**
 * Parses rows into runs. Throws when the grid is empty, the rows differ in length, or a cell uses a
 * role outside `allowedRoles` (when given), so a typo in an icon fails its test instead of rendering
 * a hole.
 */
export function parsePixelGrid(rows: readonly string[], allowedRoles?: string): PixelGrid {
  if (rows.length === 0 || rows[0].length === 0) throw new Error('A pixel grid needs cells');
  const width = rows[0].length;
  const runs: PixelRun[] = [];
  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(`Row ${y} has ${row.length} cells, expected ${width}`);
    }
    let x = 0;
    while (x < width) {
      const role = row[x];
      if (isTransparent(role)) {
        x += 1;
        continue;
      }
      if (allowedRoles !== undefined && !allowedRoles.includes(role)) {
        throw new Error(`Unknown role "${role}" at row ${y}, column ${x}`);
      }
      let end = x + 1;
      while (end < width && row[end] === role) end += 1;
      runs.push({ x, y, width: end - x, role });
      x = end;
    }
  });
  return { width, height: rows.length, runs };
}

/**
 * One SVG path per role: each run becomes a closed 1-cell-high rectangle, so a whole grid draws
 * as a handful of `Path`s instead of one `Rect` per run (the exercise animations, PLAN 6.4).
 * Coordinates are in cells.
 */
export function gridPaths(grid: PixelGrid): Record<string, string> {
  const paths: Record<string, string> = {};
  for (const run of grid.runs) {
    paths[run.role] = `${paths[run.role] ?? ''}M${run.x} ${run.y}h${run.width}v1h${-run.width}z`;
  }
  return paths;
}

/**
 * The grid as a standalone SVG document `sizePx` wide (height in proportion), one path per role
 * filled with `fillOf(role)`; a role without a fill stays empty. Crisp edges keep the pixels sharp
 * when the SVG is scaled (the home-screen widget draws icons from SVG strings, PLAN 6.6).
 */
export function gridSvg(
  grid: PixelGrid,
  sizePx: number,
  fillOf: (role: string) => string | undefined,
): string {
  const heightPx = (sizePx * grid.height) / grid.width;
  const paths = Object.entries(gridPaths(grid))
    .map(([role, d]) => ({ fill: fillOf(role), d }))
    .filter((path): path is { fill: string; d: string } => path.fill !== undefined)
    .map((path) => `<path fill="${path.fill}" d="${path.d}"/>`)
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${heightPx}" ` +
    `viewBox="0 0 ${grid.width} ${grid.height}" shape-rendering="crispEdges">${paths}</svg>`
  );
}

/**
 * The rows without their fully transparent edges (rows above and below, columns left and right),
 * so a sprite drawn into a fixed canvas takes only the space its pixels need (the companion
 * widget, PLAN 6.12). A grid without any painted cell comes back unchanged.
 */
export function trimPixelRows(rows: readonly string[]): string[] {
  const painted = (cell: string | undefined) => cell !== undefined && !isTransparent(cell);
  const filledRows = rows.flatMap((row, y) => ([...row].some(painted) ? [y] : []));
  if (filledRows.length === 0) return [...rows];
  const width = rows[0].length;
  const filledColumns = Array.from({ length: width }, (_, x) => x).filter((x) =>
    rows.some((row) => painted(row[x])),
  );
  const top = filledRows[0];
  const bottom = filledRows[filledRows.length - 1];
  const left = filledColumns[0];
  const right = filledColumns[filledColumns.length - 1];
  return rows.slice(top, bottom + 1).map((row) => row.slice(left, right + 1));
}

/** The distinct roles a grid uses, in order of first appearance. */
export function gridRoles(grid: PixelGrid): string[] {
  return [...new Set(grid.runs.map((run) => run.role))];
}
