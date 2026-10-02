/**
 * Rasterizes a figure pose (figure.ts) and its props into a pixel grid (rows of role characters,
 * the format of src/lib/pixelGrid.ts), so an exercise animation renders like the icons and the
 * app icon: crisp cells, colors by role (PLAN 6.4, ADR-053). Plain math, no React.
 */
import { BONES, FIGURE_GRID, jointsOf, type Point, type Pose } from './figure';

/** Roles in a figure grid; `figurePalette.ts` maps them to palette colors. */
export const FIGURE_ROLES = {
  empty: '.',
  /** Head, torso and the near leg. */
  body: '#',
  /** The near arm, lighter so it stands out against the torso. */
  bodyLight: '*',
  /** A dark edge around the head and the near arm, so they stand out from the torso. */
  outline: 'k',
  /** The far arm and leg, drawn behind the body. */
  bodyFar: 'o',
  /** Metal: bars, rings, parallettes, dip bars, pole. */
  metal: '+',
  /** Ring straps and legs of stands. */
  metalDark: 's',
  /** Floor, wall, box. */
  wood: '=',
} as const;
export type FigureRole = (typeof FIGURE_ROLES)[keyof typeof FIGURE_ROLES];

/** The floor's top row; a figure standing on the floor has its feet on `FLOOR_Y`. */
export const FLOOR_Y = 30;

/** Half-widths of the drawn lines in cells: limbs ~2 cells thick, the torso ~3. */
const LIMB_RADIUS = 1.15;
const TORSO_RADIUS = 1.8;
/** How far the outline reaches past the head and the near arm. */
const OUTLINE = 0.75;
const BAR_RADIUS = 1.6;
/** A bar's rig: the post stands this many columns behind the bar (to the left), unless set. */
const DEFAULT_POST_OFFSET = 11;
const POST_WIDTH = 2;
const RING_RADIUS = 1.6;
const RING_HOLE_RADIUS = 0.7;

export type Prop =
  /** The ground, rows `FLOOR_Y` and below. */
  | { kind: 'floor' }
  /** A wall whose face is at column `x`, extending to the right edge. */
  | { kind: 'wall'; x: number }
  /**
   * A pull-up bar seen end-on, centred at (`x`, `y`), on a rig: a post from the floor at column
   * `postX` (default 11 columns to the left) and a beam over to the bar, like a pull-up station
   * from the side.
   */
  | { kind: 'bar'; x: number; y: number; postX?: number }
  /** A bar seen from the front (front-view animations): a rail at row `y` from `x` to `x + width`. */
  | { kind: 'rail'; x: number; y: number; width: number }
  /** A gymnastics ring at (`x`, `y`) on a strap from the top edge. */
  | { kind: 'rings'; x: number; y: number }
  /** Parallettes seen from the side: a rail at height `height` from `x` to `x + width`. */
  | { kind: 'parallettes'; x: number; width: number; height?: number }
  /** Dip bars: a rail at row `y` from `x` to `x + width` on two posts. */
  | { kind: 'dipBars'; x: number; y: number; width: number }
  /** A box or bench on the floor. */
  | { kind: 'box'; x: number; width: number; height: number }
  /** A vertical pole at column `x` (human flag). */
  | { kind: 'pole'; x: number };

const DEFAULT_PARALLETTE_HEIGHT = 3;

type Canvas = string[][];

function blankCanvas(): Canvas {
  return Array.from({ length: FIGURE_GRID }, () =>
    Array.from({ length: FIGURE_GRID }, () => FIGURE_ROLES.empty as string),
  );
}

function paint(canvas: Canvas, x: number, y: number, role: FigureRole) {
  if (x < 0 || y < 0 || x >= FIGURE_GRID || y >= FIGURE_GRID) return;
  canvas[y][x] = role;
}

function fillRect(canvas: Canvas, x: number, y: number, w: number, h: number, role: FigureRole) {
  for (let v = Math.round(y); v < Math.round(y + h); v += 1) {
    for (let u = Math.round(x); u < Math.round(x + w); u += 1) paint(canvas, u, v, role);
  }
}

/** Distance from point `p` to the segment `a`–`b`. */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Paints every cell whose centre is within `radius` of the segment (a capsule). */
function drawSegment(canvas: Canvas, a: Point, b: Point, radius: number, role: FigureRole) {
  const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - radius));
  const x1 = Math.min(FIGURE_GRID - 1, Math.ceil(Math.max(a.x, b.x) + radius));
  const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - radius));
  const y1 = Math.min(FIGURE_GRID - 1, Math.ceil(Math.max(a.y, b.y) + radius));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (distanceToSegment({ x: x + 0.5, y: y + 0.5 }, a, b) <= radius) paint(canvas, x, y, role);
    }
  }
}

function drawDisc(canvas: Canvas, center: Point, radius: number, role: FigureRole, hole = 0) {
  for (let y = Math.floor(center.y - radius); y <= Math.ceil(center.y + radius); y += 1) {
    for (let x = Math.floor(center.x - radius); x <= Math.ceil(center.x + radius); x += 1) {
      const d = Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y);
      if (d <= radius && d > hole) paint(canvas, x, y, role);
    }
  }
}

/** Props behind the figure (floor, wall, box, stands, a rail); bars and rings go in front of the hands. */
function drawPropBehind(canvas: Canvas, prop: Prop) {
  const { wood, metal, metalDark } = FIGURE_ROLES;
  switch (prop.kind) {
    case 'floor':
      fillRect(canvas, 0, FLOOR_Y, FIGURE_GRID, FIGURE_GRID - FLOOR_Y, wood);
      return;
    case 'wall':
      fillRect(canvas, prop.x, 0, FIGURE_GRID - prop.x, FLOOR_Y, wood);
      return;
    case 'box':
      fillRect(canvas, prop.x, FLOOR_Y - prop.height, prop.width, prop.height, wood);
      return;
    case 'parallettes': {
      const top = FLOOR_Y - (prop.height ?? DEFAULT_PARALLETTE_HEIGHT);
      fillRect(canvas, prop.x + 1, top, 1, FLOOR_Y - top, metalDark);
      fillRect(canvas, prop.x + prop.width - 2, top, 1, FLOOR_Y - top, metalDark);
      fillRect(canvas, prop.x, top, prop.width, 1, metal);
      return;
    }
    case 'dipBars':
      fillRect(canvas, prop.x + 1, prop.y, 1, FLOOR_Y - prop.y, metalDark);
      fillRect(canvas, prop.x + prop.width - 2, prop.y, 1, FLOOR_Y - prop.y, metalDark);
      fillRect(canvas, prop.x, prop.y, prop.width, 1, metal);
      return;
    case 'rail':
      fillRect(canvas, prop.x, prop.y - 1, prop.width, 2, metal);
      return;
    case 'bar': {
      const postX = Math.max(0, Math.round(prop.postX ?? prop.x - DEFAULT_POST_OFFSET));
      const beamY = Math.round(prop.y) - 1;
      fillRect(canvas, postX, beamY, POST_WIDTH, FLOOR_Y - beamY, metalDark);
      const beamFrom = Math.min(postX, Math.round(prop.x));
      fillRect(canvas, beamFrom, beamY, Math.abs(Math.round(prop.x) - postX) + 1, 2, metalDark);
      return;
    }
    case 'pole':
      fillRect(canvas, prop.x, 0, 2, FLOOR_Y, metal);
      return;
    default:
      return;
  }
}

function drawPropInFront(canvas: Canvas, prop: Prop) {
  const { metal, metalDark } = FIGURE_ROLES;
  if (prop.kind === 'bar') {
    drawDisc(canvas, { x: prop.x, y: prop.y }, BAR_RADIUS, metal);
  } else if (prop.kind === 'rings') {
    fillRect(canvas, Math.round(prop.x) - 0.5, 0, 1, prop.y - RING_RADIUS, metalDark);
    drawDisc(canvas, { x: prop.x, y: prop.y }, RING_RADIUS, metal, RING_HOLE_RADIUS);
  }
}

/**
 * The pose and its props as `FIGURE_GRID` rows of role characters. Draw order: floor, wall, box
 * and stands; the far limbs; torso, near leg and head; the near arm (in a lighter gold, so it
 * shows in front of the body and head); bars and rings in front of the hands that hold them.
 */
export function rasterizePose(pose: Pose, props: readonly Prop[]): string[] {
  const canvas = blankCanvas();
  const j = jointsOf(pose);
  const { body, bodyLight, bodyFar, outline } = FIGURE_ROLES;
  for (const prop of props) drawPropBehind(canvas, prop);

  drawSegment(canvas, j.neck, j.elbowFar, LIMB_RADIUS, bodyFar);
  drawSegment(canvas, j.elbowFar, j.handFar, LIMB_RADIUS, bodyFar);
  drawSegment(canvas, j.hip, j.kneeFar, LIMB_RADIUS, bodyFar);
  drawSegment(canvas, j.kneeFar, j.ankleFar, LIMB_RADIUS, bodyFar);
  drawSegment(canvas, j.ankleFar, j.toeFar, LIMB_RADIUS, bodyFar);

  drawSegment(canvas, j.hip, j.neck, TORSO_RADIUS, body);
  drawSegment(canvas, j.hip, j.knee, LIMB_RADIUS, body);
  drawSegment(canvas, j.knee, j.ankle, LIMB_RADIUS, body);
  drawSegment(canvas, j.ankle, j.toe, LIMB_RADIUS, body);
  drawDisc(canvas, j.head, BONES.headRadius + OUTLINE, outline);
  drawDisc(canvas, j.head, BONES.headRadius, body);
  drawSegment(canvas, j.neck, j.elbow, LIMB_RADIUS + OUTLINE, outline);
  drawSegment(canvas, j.elbow, j.hand, LIMB_RADIUS + OUTLINE, outline);
  drawSegment(canvas, j.neck, j.elbow, LIMB_RADIUS, bodyLight);
  drawSegment(canvas, j.elbow, j.hand, LIMB_RADIUS, bodyLight);

  for (const prop of props) drawPropInFront(canvas, prop);
  return canvas.map((row) => row.join(''));
}
