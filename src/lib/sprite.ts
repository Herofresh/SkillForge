/**
 * Layered pixel sprites (PLAN 6.10, ADR-059): small hand-drawn part grids (head, torso, arms,
 * legs, accessories, weapons) composed onto one canvas, then shaded and outlined in code, the way
 * SNES-era JRPG field sprites are drawn: every material has a ramp (outline, shadow, base, light,
 * optional specular), light comes from the top left, and the outline is a darker shade of the
 * shape it borders (a selective outline), never pure black. Parts only say *which material* a
 * cell is; the tones are worked out here, so recolouring a part (another skin, a dyed cloak,
 * chainmail instead of cloth) keeps the shading. Plain functions, no React.
 */

/** Tone steps of a material ramp, darkest first. */
export const TONES = ['outline', 'shadow', 'base', 'light', 'spec'] as const;
export type Tone = (typeof TONES)[number];

/** A painted cell: a material (shaded and outlined) or a fixed colour key (eyes, sparkles). */
export type SpriteCell = { material: string; region: string; tone?: Tone } | { fixed: string };

/** A part: rows of characters, `.` or space empty, each other character looked up in a legend. */
export interface SpritePart {
  rows: readonly string[];
}

export type Legend = Readonly<Record<string, SpriteCell>>;

export interface Point {
  x: number;
  y: number;
}

/** The canvas being composed: `width` × `height` cells, `undefined` = empty. */
export class SpriteCanvas {
  readonly cells: (SpriteCell | undefined)[][];

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => undefined as SpriteCell | undefined),
    );
  }

  get(x: number, y: number): SpriteCell | undefined {
    return this.cells[y]?.[x];
  }

  set(x: number, y: number, cell: SpriteCell) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.cells[y][x] = cell;
  }

  /** Draws `part` with its top-left at `at`; `mirror` flips it left to right. */
  draw(part: SpritePart, at: Point, legend: Legend, mirror = false) {
    part.rows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx += 1) {
        const char = row[mirror ? row.length - 1 - dx : dx];
        if (char === '.' || char === ' ') continue;
        const cell = legend[char];
        if (!cell) throw new Error(`Unknown sprite cell "${char}"`);
        this.set(at.x + dx, at.y + dy, cell);
      }
    });
  }

  /** Repaints every cell for which `change` returns a new cell (recolouring a region). */
  map(change: (cell: SpriteCell, x: number, y: number) => SpriteCell | undefined) {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const cell = this.cells[y][x];
        if (!cell) continue;
        const next = change(cell, x, y);
        if (next) this.cells[y][x] = next;
      }
    }
  }
}

/** Rotates a part a quarter turn clockwise (a weapon laid on the ground). */
export function rotatePart(part: SpritePart): SpritePart {
  const height = part.rows.length;
  const width = Math.max(...part.rows.map((row) => row.length));
  const rows: string[] = [];
  for (let x = 0; x < width; x += 1) {
    let row = '';
    for (let y = height - 1; y >= 0; y -= 1) row += part.rows[y][x] ?? '.';
    rows.push(row);
  }
  return { rows };
}

/** Flips a part left to right. */
export function mirrorPart(part: SpritePart): SpritePart {
  return { rows: part.rows.map((row) => [...row].reverse().join('')) };
}

const isMaterial = (
  cell: SpriteCell | undefined,
): cell is Extract<SpriteCell, { material: string }> => cell !== undefined && 'material' in cell;

/** Same material and region: the shape a cell's shading is worked out against. */
function sameShape(a: SpriteCell | undefined, b: SpriteCell | undefined): boolean {
  return isMaterial(a) && isMaterial(b) && a.material === b.material && a.region === b.region;
}

/**
 * The tone of a material cell from its neighbours (light from the top left): bottom and right
 * edges in shadow, top and left edges lit, cells right under another material in its cast
 * shadow, the lit top-left corners of shiny materials specular.
 */
function shadeTone(canvas: SpriteCanvas, x: number, y: number, shiny: boolean): Tone {
  const cell = canvas.get(x, y);
  const up = canvas.get(x, y - 1);
  const topOpen = !sameShape(cell, up);
  const leftOpen = !sameShape(cell, canvas.get(x - 1, y));
  const bottomOpen = !sameShape(cell, canvas.get(x, y + 1));
  const rightOpen = !sameShape(cell, canvas.get(x + 1, y));
  if (up !== undefined && topOpen && isMaterial(up)) return 'shadow';
  if ((bottomOpen && !topOpen) || (rightOpen && !leftOpen && !topOpen)) return 'shadow';
  if (topOpen && leftOpen && shiny && !bottomOpen) return 'spec';
  if ((topOpen && !bottomOpen) || (leftOpen && !rightOpen)) return 'light';
  return 'base';
}

/** What a finished cell shows: a material at a tone, or a fixed colour key. */
export type FinalCell = { material: string; tone: Tone } | { fixed: string };

export interface FinishOptions {
  /** Materials with a specular tone (metal, gold, gems). */
  shiny: ReadonlySet<string>;
  /** A fixed colour key for a 1-cell glow around the whole sprite (an aura), drawn outside the outline. */
  glow?: string;
  /** Fixed-colour cells drawn into empty space last (sparkles), canvas coordinates. */
  sparkles?: readonly (Point & { fixed: string })[];
  /** A soft ground shadow: an ellipse of this fixed key under the feet, behind everything. */
  shadow?: { key: string; centre: Point; rx: number; ry: number };
}

const NEIGHBOURS = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
] as const;

/**
 * Shades every material cell, adds the selective outline (each empty cell next to the sprite takes
 * the outline tone of the material it borders), then the aura glow, sparkles and ground shadow.
 */
export function finishSprite(
  canvas: SpriteCanvas,
  options: FinishOptions,
): (FinalCell | undefined)[][] {
  const out: (FinalCell | undefined)[][] = canvas.cells.map((row, y) =>
    row.map((cell, x) => {
      if (!cell) return undefined;
      if ('fixed' in cell) return cell;
      const tone = cell.tone ?? shadeTone(canvas, x, y, options.shiny.has(cell.material));
      return { material: cell.material, tone };
    }),
  );
  const filled = (x: number, y: number) => canvas.get(x, y) !== undefined;
  const outlined: [number, number, FinalCell][] = [];
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (filled(x, y)) continue;
      for (const [dx, dy] of NEIGHBOURS) {
        const near = canvas.get(x + dx, y + dy);
        if (!near) continue;
        outlined.push([
          x,
          y,
          isMaterial(near) ? { material: near.material, tone: 'outline' } : near,
        ]);
        break;
      }
    }
  }
  for (const [x, y, cell] of outlined) out[y][x] = cell;
  if (options.glow) {
    const glow: [number, number][] = [];
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (out[y][x]) continue;
        if (NEIGHBOURS.some(([dx, dy]) => out[y + dy]?.[x + dx] !== undefined)) glow.push([x, y]);
      }
    }
    for (const [x, y] of glow) out[y][x] = { fixed: options.glow };
  }
  for (const sparkle of options.sparkles ?? []) {
    if (out[sparkle.y]?.[sparkle.x] === undefined && sparkle.y >= 0 && sparkle.y < canvas.height) {
      out[sparkle.y][sparkle.x] = { fixed: sparkle.fixed };
    }
  }
  if (options.shadow) {
    const { centre, rx, ry, key } = options.shadow;
    for (let y = Math.floor(centre.y - ry); y <= Math.ceil(centre.y + ry); y += 1) {
      for (let x = Math.floor(centre.x - rx); x <= Math.ceil(centre.x + rx); x += 1) {
        const d = ((x + 0.5 - centre.x) / rx) ** 2 + ((y + 0.5 - centre.y) / ry) ** 2;
        if (d <= 1 && out[y]?.[x] === undefined && y < canvas.height) out[y][x] = { fixed: key };
      }
    }
  }
  return out;
}

/** The role character of a finished cell in the output grid. */
export type RoleOf = (cell: FinalCell) => string;

/** The finished sprite as grid rows (`src/lib/pixelGrid.ts` format), `.` for empty. */
export function spriteRows(
  cells: readonly (readonly (FinalCell | undefined)[])[],
  roleOf: RoleOf,
): string[] {
  return cells.map((row) => row.map((cell) => (cell ? roleOf(cell) : '.')).join(''));
}
