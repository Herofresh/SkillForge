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

/** The distinct roles a grid uses, in order of first appearance. */
export function gridRoles(grid: PixelGrid): string[] {
  return [...new Set(grid.runs.map((run) => run.role))];
}
