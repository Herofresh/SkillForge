/**
 * The widgets' layouts (PLAN 6.12, ADR-062), pure: no widget library, no React Native, so Jest
 * and the picker-preview script (`scripts/widgetPreview.ts`) use the same layout as the widget.
 *
 * A layout is a small tree of boxes, texts, icons and the companion sprite (`WidgetNode`). For a
 * widget size, every arrangement of the content (a **size class**: narrow, standard, wide, tall,
 * grid) is measured at every scale, with the fonts' real advance widths and line heights; the
 * arrangement that shows the most at the biggest scale and fills the height best wins. So the
 * content grows with the widget and reflows into more rows or columns instead of leaving empty
 * bands, and nothing is wider or taller than the widget (no clipped text).
 *
 * `nativeWidget.tsx` turns the tree into the library's primitives; `placeWidgetNodes` gives the
 * positions the same flex rules produce (for the preview and the tests).
 */
import { ATTRIBUTE_LABELS } from '@/components/attributeLabels';
import { Palette } from '@/components/palette';
import { AttributeColors, Colors, PIXEL, RankColors } from '@/components/theme';
import type { IconName } from '@/components/ui/icons';
import { HERO_CLASS_BY_ID } from '@/data/classes';
import { companionStill } from '@/data/companion';
import type { WidgetView } from '@/domain/widget';
import { trimPixelRows } from '@/lib/pixelGrid';

// --- Fonts ---------------------------------------------------------------------------------------

/** `pixel` = Jersey 15 (status, numbers, rank); `caps` = Silkscreen (the small caps labels). */
export type WidgetFont = 'pixel' | 'caps';

/** The first character of the advance tables (space). */
const FIRST_CHAR = 32;
/**
 * Advance widths of the printable ASCII characters (32–126), in thousandths of the font size,
 * read from the TTFs' `hmtx` tables (Jersey 15: 1350 units per em, Silkscreen: 1000). Regenerate
 * them if a font file changes.
 */
const ADVANCES: Readonly<Record<WidgetFont, readonly number[]>> = {
  pixel: [
    222, 185, 333, 630, 519, 630, 630, 185, 259, 259, 370, 481, 185, 407, 185, 370, 407, 259, 444,
    444, 407, 407, 444, 407, 444, 444, 185, 185, 444, 444, 444, 407, 667, 444, 444, 444, 444, 407,
    370, 444, 444, 185, 407, 407, 370, 630, 481, 444, 444, 444, 444, 481, 407, 444, 444, 630, 444,
    481, 444, 296, 370, 296, 481, 444, 148, 444, 444, 444, 444, 444, 333, 444, 444, 185, 222, 370,
    185, 630, 444, 444, 444, 444, 370, 444, 370, 444, 444, 630, 444, 444, 407, 296, 333, 296, 519,
  ],
  caps: [
    500, 375, 625, 875, 750, 875, 750, 375, 500, 500, 875, 875, 500, 625, 375, 625, 750, 625, 750,
    750, 750, 750, 750, 750, 750, 750, 375, 500, 625, 625, 625, 750, 875, 750, 750, 750, 750, 625,
    625, 750, 750, 375, 750, 750, 625, 875, 875, 750, 750, 750, 750, 750, 625, 750, 875, 875, 875,
    875, 625, 500, 625, 500, 625, 750, 500, 750, 750, 750, 750, 625, 625, 750, 750, 375, 750, 750,
    625, 875, 875, 750, 750, 750, 750, 750, 625, 750, 875, 875, 875, 875, 625, 625, 375, 625, 750,
  ],
};
/** A character outside the tables counts as one full em (too wide rather than clipped). */
const UNKNOWN_ADVANCE = 1000;
/**
 * Line height per font size: the fonts' ascent + descent (`hhea`). Jersey 15: (1050 + 300) / 1350;
 * Silkscreen: (1030 + 250) / 1000.
 */
const LINE_HEIGHT: Readonly<Record<WidgetFont, number>> = { pixel: 1, caps: 1.28 };

/** Width (dp) of `text` in `font` at `size` (the widget draws font sizes in dp, not sp). */
export function textWidthDp(text: string, font: WidgetFont, size: number): number {
  let units = 0;
  for (const char of text) {
    units += ADVANCES[font][(char.codePointAt(0) ?? 0) - FIRST_CHAR] ?? UNKNOWN_ADVANCE;
  }
  return (units * size) / 1000;
}

/** Height (dp) of one line of `font` at `size`. */
export function lineHeightDp(font: WidgetFont, size: number): number {
  return Math.ceil(LINE_HEIGHT[font] * size);
}

// --- Sizes ---------------------------------------------------------------------------------------

/** Scale-1 sizes (the compact 6.6 layout): icons, gaps and padding in dp, type in dp. */
const BASE = {
  icon: 24,
  status: 20,
  number: 24,
  rank: 20,
  attribute: 16,
  label: 10,
  gap: 6,
  padding: 10,
} as const;
/** Icons are 12 × 12 grids: their size stays a multiple of this so every grid cell is whole dp. */
const ICON_GRID = 12;
/** An icon may be this much (dp) bigger than its exact scaled size before it rounds down. */
const ICON_ROUNDING_SLACK = 4;
/** The padding stops growing at this scale (a big widget needs content, not a wider rim). */
const PADDING_MAX_SCALE = 1.5;
/** ...and is at most this share of the widget's shorter side. */
const PADDING_MAX_SHARE = 0.04;
/** The scales tried, smallest to largest, in steps (font sizes round to whole dp anyway). */
export const MIN_SCALE = 0.6;
export const MAX_SCALE = 3;
const SCALE_STEP = 0.05;
/** The frame's two pixel lines (ink, stone edge) on every side, in dp. */
const FRAME_DP = 2 * PIXEL;
/**
 * Content may use this share of the inner box: the measured widths and line heights are exact,
 * this keeps a margin for rounding to device pixels.
 */
const FIT_SHARE = 0.97;

/** Font sizes, icon sizes and gaps (dp) of the widget at one scale. */
export interface WidgetSizes {
  scale: number;
  icon: number;
  smallIcon: number;
  status: number;
  number: number;
  rank: number;
  attribute: number;
  label: number;
  gap: number;
  padding: number;
}

/** The sizes at `scale` (1 = the compact layout of PLAN 6.6). */
export function widgetSizes(scale: number): WidgetSizes {
  const sized = (base: number) => Math.round(base * scale);
  const icon = Math.max(
    ICON_GRID,
    Math.floor((BASE.icon * scale + ICON_ROUNDING_SLACK) / ICON_GRID) * ICON_GRID,
  );
  return {
    scale,
    icon,
    smallIcon: Math.round((icon * 2) / 3),
    status: sized(BASE.status),
    number: sized(BASE.number),
    rank: sized(BASE.rank),
    attribute: sized(BASE.attribute),
    label: sized(BASE.label),
    gap: Math.max(2, sized(BASE.gap)),
    padding: Math.round(BASE.padding * Math.min(scale, PADDING_MAX_SCALE)),
  };
}

// --- The layout tree -----------------------------------------------------------------------------

export interface WidgetText {
  type: 'text';
  text: string;
  font: WidgetFont;
  size: number;
  color: string;
}

export interface WidgetIcon {
  type: 'icon';
  name: IconName;
  size: number;
}

/** The companion sprite: its rows (trimmed to the painted cells), `pixel` dp per sprite pixel. */
export interface WidgetSprite {
  type: 'sprite';
  pixel: number;
  rows: readonly string[];
}

export type WidgetAlign = 'start' | 'center' | 'end';
export type WidgetJustify = 'start' | 'center' | 'space-between' | 'space-evenly';

/**
 * A row or column. `gap` is the least space between children; `justify` spreads the free space
 * along the box (only a box that is wider / taller than its content has any: the root, which
 * fills the widget, and a `stretch`ed child, which fills its parent across the parent's
 * direction). `align` places the children across the box.
 */
export interface WidgetBox {
  type: 'box';
  direction: 'row' | 'column';
  gap: number;
  align: WidgetAlign;
  justify: WidgetJustify;
  stretch?: boolean;
  children: WidgetNode[];
}

export type WidgetNode = WidgetText | WidgetIcon | WidgetSprite | WidgetBox;
export type WidgetLeaf = Exclude<WidgetNode, WidgetBox>;

export interface Size {
  width: number;
  height: number;
}

/** The natural (content) size of a node in dp. */
export function measureWidgetNode(node: WidgetNode): Size {
  switch (node.type) {
    case 'text':
      return {
        width: Math.ceil(textWidthDp(node.text, node.font, node.size)),
        height: lineHeightDp(node.font, node.size),
      };
    case 'icon':
      return { width: node.size, height: node.size };
    case 'sprite':
      return { width: node.rows[0].length * node.pixel, height: node.rows.length * node.pixel };
    case 'box': {
      const sizes = node.children.map(measureWidgetNode);
      const gaps = node.gap * Math.max(0, sizes.length - 1);
      const along = (size: Size) => (node.direction === 'row' ? size.width : size.height);
      const across = (size: Size) => (node.direction === 'row' ? size.height : size.width);
      const main = sizes.reduce((sum, size) => sum + along(size), 0) + gaps;
      const cross = sizes.reduce((max, size) => Math.max(max, across(size)), 0);
      return node.direction === 'row'
        ? { width: main, height: cross }
        : { width: cross, height: main };
    }
  }
}

export interface PlacedLeaf {
  node: WidgetLeaf;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where every text, icon and sprite of `root` lands when the root fills a `width` × `height` box
 * at (`x`, `y`): the flex rules the widget's `FlexWidget`s follow (see `WidgetBox`).
 */
export function placeWidgetNodes(
  root: WidgetNode,
  x: number,
  y: number,
  width: number,
  height: number,
): PlacedLeaf[] {
  if (root.type !== 'box') return [{ node: root, x, y, width, height }];
  const row = root.direction === 'row';
  const mainSize = row ? width : height;
  const crossSize = row ? height : width;
  const children = root.children.map((child) => {
    const natural = measureWidgetNode(child);
    const main = row ? natural.width : natural.height;
    const stretched = child.type === 'box' && child.stretch === true;
    const cross = stretched ? crossSize : row ? natural.height : natural.width;
    return { child, main, cross };
  });
  const used =
    children.reduce((sum, entry) => sum + entry.main, 0) +
    root.gap * Math.max(0, children.length - 1);
  const free = Math.max(0, mainSize - used);
  const count = children.length;
  let lead = 0;
  let between = root.gap;
  if (root.justify === 'center') lead = free / 2;
  if (root.justify === 'space-between' && count > 1) between += free / (count - 1);
  if (root.justify === 'space-between' && count === 1) lead = 0;
  if (root.justify === 'space-evenly') {
    lead = free / (count + 1);
    between += free / (count + 1);
  }
  const placed: PlacedLeaf[] = [];
  let cursor = lead;
  for (const { child, main, cross } of children) {
    const crossOffset =
      root.align === 'center'
        ? (crossSize - cross) / 2
        : root.align === 'end'
          ? crossSize - cross
          : 0;
    const childX = row ? x + cursor : x + crossOffset;
    const childY = row ? y + crossOffset : y + cursor;
    placed.push(...placeWidgetNodes(child, childX, childY, row ? main : cross, row ? cross : main));
    cursor += main + between;
  }
  return placed;
}

// --- Building blocks -----------------------------------------------------------------------------

type HeroView = Extract<WidgetView, { kind: 'hero' }>;

const text = (value: string, font: WidgetFont, size: number, color: string): WidgetText => ({
  type: 'text',
  text: font === 'caps' ? value.toUpperCase() : value,
  font,
  size,
  color,
});

const icon = (name: IconName, size: number): WidgetIcon => ({ type: 'icon', name, size });

function box(
  direction: WidgetBox['direction'],
  children: WidgetNode[],
  options: Partial<Omit<WidgetBox, 'type' | 'direction' | 'children'>> = {},
): WidgetBox {
  return {
    type: 'box',
    direction,
    gap: 0,
    align: 'start',
    justify: 'start',
    ...options,
    children,
  };
}

const row = (children: WidgetNode[], options?: Parameters<typeof box>[2]) =>
  box('row', children, { align: 'center', ...options });
const column = (children: WidgetNode[], options?: Parameters<typeof box>[2]) =>
  box('column', children, options);

/** ✓ "Trained today" / ⧗ "Not yet today". */
function statusRow(view: HeroView, sizes: WidgetSizes, twoLines = false): WidgetNode {
  const tone = view.trainedToday ? Colors.success : Colors.gold;
  return row(
    [
      icon(view.trainedToday ? 'check' : 'hourglass', sizes.icon),
      twoLines
        ? column(splitLine(view.status).map((part) => text(part, 'pixel', sizes.status, tone)))
        : text(view.status, 'pixel', sizes.status, tone),
    ],
    { gap: sizes.gap },
  );
}

/** "Not yet today" → ["Not yet", "today"]: split at the last space (a slim, tall widget). */
export function splitLine(line: string): string[] {
  const at = line.lastIndexOf(' ');
  return at <= 0 ? [line] : [line.slice(0, at), line.slice(at + 1)];
}

/** A big number over its caps label. */
function stat(value: number, label: string, tone: string, sizes: WidgetSizes): WidgetNode {
  return column([
    text(String(value), 'pixel', sizes.number, tone),
    text(label, 'caps', sizes.label, Colors.textMuted),
  ]);
}

/** The flame, the streak and the level. */
function statsRow(view: HeroView, sizes: WidgetSizes): WidgetNode {
  return row(
    [
      icon('flame', sizes.icon),
      row(
        [
          stat(view.streak, 'Streak', Colors.ember, sizes),
          stat(view.level, 'Level', Colors.goldLight, sizes),
        ],
        { gap: sizes.gap * 2, align: 'start' },
      ),
    ],
    { gap: sizes.gap },
  );
}

/** The worn class's title in its color (PLAN 6.9), or nothing. */
function classText(view: HeroView, sizes: WidgetSizes): WidgetNode[] {
  if (!view.heroClass) return [];
  const classColor = HERO_CLASS_BY_ID.get(view.heroClass.id)?.color;
  return [
    text(
      view.heroClass.title,
      'caps',
      sizes.label,
      classColor ? Palette[classColor] : Colors.textMuted,
    ),
  ];
}

/** The shield and the rank, the class title under it. */
function rankBlock(view: HeroView, sizes: WidgetSizes, align: WidgetAlign): WidgetNode {
  return column(
    [
      row(
        [
          icon('shield', sizes.smallIcon),
          text(view.rank, 'pixel', sizes.rank, RankColors[view.rank]),
        ],
        { gap: Math.round((sizes.gap * 2) / 3) },
      ),
      ...classText(view, sizes),
    ],
    { align },
  );
}

/** The strongest `count` attributes, one per line ("PULL 12"). */
function attributesColumn(
  view: HeroView,
  count: number,
  sizes: WidgetSizes,
  align: WidgetAlign,
): WidgetNode {
  const shown = view.topAttributes.slice(0, count);
  if (shown.length === 0) return text('No stats yet', 'caps', sizes.label, Colors.textMuted);
  return column(
    shown.map((entry) =>
      row(
        [
          text(ATTRIBUTE_LABELS[entry.attribute], 'caps', sizes.label, Colors.textMuted),
          text(String(entry.value), 'pixel', sizes.attribute, AttributeColors[entry.attribute]),
        ],
        { gap: Math.round(sizes.gap / 2) },
      ),
    ),
    { align, gap: Math.round(sizes.gap / 3) },
  );
}

// --- Arrangements (size classes) -----------------------------------------------------------------

/**
 * - `narrow`: one column, status over streak and level (a slim widget).
 * - `standard`: two columns: status over streak / level, rank over the attributes (short, wide).
 * - `wide`: one row: status, streak / level, rank (very short and wide).
 * - `tall`: one column of everything (a tall, slim widget).
 * - `grid`: status, then streak / level, then rank and attributes side by side (squarish).
 *
 * The companion widget uses the same names for where its sprite goes (see `companionLayout`).
 */
export type WidgetSizeClass = 'narrow' | 'standard' | 'wide' | 'tall' | 'grid';

interface Candidate {
  sizeClass: WidgetSizeClass;
  /** How much it shows besides status, streak and level (rank, class, each attribute). */
  extras: number;
  build: (sizes: WidgetSizes) => WidgetNode;
}

/** Each extra shown (rank, class, an attribute) is worth this much scale in the choice. */
const EXTRA_WEIGHT = 0.2;
/**
 * Text below this scale (status 18 dp, labels 9 dp) is hard to read: an arrangement that only fits
 * smaller is chosen only when nothing else fits at a readable size.
 */
const READABLE_SCALE = 0.9;
/** Outweighs any score of a smaller-than-readable arrangement. */
const READABLE_BONUS = 1000;

function heroCandidates(view: HeroView): Candidate[] {
  const rankExtras = 1 + (view.heroClass ? 1 : 0);
  const attributeCounts = [0, 1, 2, 3].filter(
    (count) => count === 0 || count <= view.topAttributes.length,
  );
  const candidates: Candidate[] = [
    ...[false, true].map((twoLines): Candidate => ({
      sizeClass: 'narrow',
      extras: 0,
      build: (s) =>
        column([statusRow(view, s, twoLines), statsRow(view, s)], {
          gap: s.gap,
          justify: 'space-evenly',
        }),
    })),
    {
      sizeClass: 'wide',
      extras: rankExtras,
      build: (s) =>
        row([statusRow(view, s), statsRow(view, s), rankBlock(view, s, 'start')], {
          gap: s.gap * 2,
          justify: 'space-between',
        }),
    },
  ];
  for (const count of attributeCounts) {
    const extras = rankExtras + count;
    const attributes = (s: WidgetSizes, align: WidgetAlign) =>
      count > 0 ? [attributesColumn(view, count, s, align)] : [];
    candidates.push(
      {
        sizeClass: 'standard',
        extras,
        build: (s) =>
          row(
            [
              column([statusRow(view, s), statsRow(view, s)], {
                gap: s.gap,
                stretch: true,
                justify: 'space-evenly',
              }),
              column([rankBlock(view, s, 'end'), ...attributes(s, 'end')], {
                gap: s.gap,
                align: 'end',
                stretch: true,
                justify: 'space-evenly',
              }),
            ],
            { gap: s.gap * 2, justify: 'space-between' },
          ),
      },
      ...[false, true].map((twoLines): Candidate => ({
        sizeClass: 'tall',
        extras,
        build: (s) =>
          column(
            [
              statusRow(view, s, twoLines),
              statsRow(view, s),
              rankBlock(view, s, 'start'),
              ...attributes(s, 'start'),
            ],
            { gap: s.gap, justify: 'space-evenly' },
          ),
      })),
      {
        sizeClass: 'grid',
        extras,
        build: (s) =>
          column(
            [
              statusRow(view, s),
              statsRow(view, s),
              row([rankBlock(view, s, 'start'), ...attributes(s, 'end')], {
                gap: s.gap * 2,
                align: 'start',
                stretch: true,
                justify: 'space-between',
              }),
            ],
            { gap: s.gap, justify: 'space-evenly' },
          ),
      },
    );
  }
  return candidates;
}

/** Before the first snapshot: the sword, "SkillForge" and the hint, in a row or stacked. */
function emptyCandidates(): Candidate[] {
  const title = (s: WidgetSizes) => text('SkillForge', 'pixel', s.number, Colors.gold);
  const hint = (s: WidgetSizes, value: string) => text(value, 'caps', s.label, Colors.textMuted);
  return [
    {
      sizeClass: 'wide',
      extras: 0,
      build: (s) =>
        row([icon('sword', s.icon), column([title(s), hint(s, EMPTY_HINT)])], {
          gap: s.gap,
          justify: 'center',
        }),
    },
    {
      sizeClass: 'tall',
      extras: 0,
      build: (s) =>
        column(
          [icon('sword', s.icon), title(s), ...splitLine(EMPTY_HINT).map((part) => hint(s, part))],
          { gap: s.gap, align: 'center', justify: 'center' },
        ),
    },
  ];
}

const EMPTY_HINT = 'Open the app to begin';

// --- Choosing ------------------------------------------------------------------------------------

/** The chosen layout for one widget size. */
export interface WidgetLayout {
  sizeClass: WidgetSizeClass;
  sizes: WidgetSizes;
  root: WidgetNode;
  /** The padding inside the frame lines (dp). */
  padding: number;
  /** The box inside the frame and padding (dp): the root fills it. */
  inner: Size;
  /** The content's natural size (dp); never more than `inner`. */
  content: Size;
  /** content.height / inner.height: how much of the height the content covers. */
  fill: number;
  /** dp per sprite pixel (the companion widget only). */
  spritePixel?: number;
}

/**
 * The padding inside the frame (dp): the scaled padding, but at most `PADDING_MAX_SHARE` of the
 * widget's shorter side, so a one-row widget keeps its height for the content.
 */
export function framePadding(widthDp: number, heightDp: number, sizes: WidgetSizes): number {
  return Math.min(sizes.padding, Math.round(Math.min(widthDp, heightDp) * PADDING_MAX_SHARE));
}

/** The box inside the frame lines and the padding at `sizes`. */
export function innerSize(widthDp: number, heightDp: number, sizes: WidgetSizes): Size {
  const inset = 2 * (FRAME_DP + framePadding(widthDp, heightDp, sizes));
  return { width: widthDp - inset, height: heightDp - inset };
}

const scales = (): number[] => {
  const steps = Math.round((MAX_SCALE - MIN_SCALE) / SCALE_STEP);
  return Array.from(
    { length: steps + 1 },
    (_, i) => Math.round((MAX_SCALE - i * SCALE_STEP) * 100) / 100,
  );
};
const SCALES = scales();

const fits = (content: Size, inner: Size) =>
  content.width <= inner.width * FIT_SHARE && content.height <= inner.height * FIT_SHARE;

type Measured = Omit<WidgetLayout, 'sizeClass' | 'fill' | 'spritePixel'>;

/** `build`'s tree at `scale` for this widget size, with its padding, inner box and content size. */
function measured(
  widthDp: number,
  heightDp: number,
  scale: number,
  build: (sizes: WidgetSizes) => WidgetNode,
): Measured {
  const sizes = widgetSizes(scale);
  const root = build(sizes);
  return {
    sizes,
    root,
    padding: framePadding(widthDp, heightDp, sizes),
    inner: innerSize(widthDp, heightDp, sizes),
    content: measureWidgetNode(root),
  };
}

/** The biggest scale at which `build` fits, or undefined if not even the smallest does. */
function fitted(
  widthDp: number,
  heightDp: number,
  build: (sizes: WidgetSizes) => WidgetNode,
): Measured | undefined {
  for (const scale of SCALES) {
    const result = measured(widthDp, heightDp, scale, build);
    if (fits(result.content, result.inner)) return result;
  }
  return undefined;
}

const heightFill = ({ content, inner }: Measured) =>
  Math.min(1, content.height / Math.max(1, inner.height));

/**
 * Picks the candidate with the best score: scale × (1 + `EXTRA_WEIGHT` × extras) × height fill,
 * readable ones first.
 */
function choose(widthDp: number, heightDp: number, candidates: Candidate[]): WidgetLayout {
  let best: { layout: WidgetLayout; score: number } | undefined;
  for (const candidate of candidates) {
    const result = fitted(widthDp, heightDp, candidate.build);
    if (!result) continue;
    const fill = heightFill(result);
    const score =
      (result.sizes.scale >= READABLE_SCALE ? READABLE_BONUS : 0) +
      result.sizes.scale * (1 + EXTRA_WEIGHT * candidate.extras) * fill;
    if (!best || score > best.score) {
      best = { layout: { sizeClass: candidate.sizeClass, ...result, fill }, score };
    }
  }
  if (best) return best.layout;
  // Smaller than anything fits (only below the configured minimum size): the first candidate at
  // the smallest scale; the widget clips rather than drawing nothing.
  const result = measured(widthDp, heightDp, MIN_SCALE, candidates[0].build);
  return { sizeClass: candidates[0].sizeClass, ...result, fill: heightFill(result) };
}

/** The small widget's layout (status, streak, level and, as space allows, rank and stats). */
export function widgetLayout(view: WidgetView, widthDp: number, heightDp: number): WidgetLayout {
  return choose(
    widthDp,
    heightDp,
    view.kind === 'empty' ? emptyCandidates() : heroCandidates(view),
  );
}

// --- The companion widget ------------------------------------------------------------------------

/** The companion's lines: status, mood, streak / level, rank and class. */
function companionText(view: HeroView, sizes: WidgetSizes, mood: string) {
  return {
    status: statusRow(view, sizes),
    mood: text(mood, 'caps', sizes.label, Colors.goldLight),
    stats: statsRow(view, sizes),
    rank: rankBlock(view, sizes, 'start'),
  };
}

/**
 * The companion's arrangements, for one sprite size:
 * - `standard`: the sprite left, a column of the four lines right (the default 4 × 2).
 * - `wide`: the sprite left, the lines as a 2 × 2 grid right (short and wide, 4 × 1).
 * - `grid`: the sprite on top, the 2 × 2 grid under it (squarish and tall, 4 × 3).
 * - `tall`: the sprite on top, the column under it (slim and tall).
 */
function companionCandidates(view: HeroView, mood: string, sprite: WidgetSprite): Candidate[] {
  const lines = (s: WidgetSizes) => companionText(view, s, mood);
  const linesColumn = (s: WidgetSizes, stretch: boolean) => {
    const parts = lines(s);
    return column([parts.status, parts.mood, parts.stats, parts.rank], {
      gap: s.gap,
      stretch,
      justify: 'space-evenly',
    });
  };
  const linesGrid = (s: WidgetSizes, stretch: boolean) => {
    const parts = lines(s);
    return row(
      [
        column([parts.status, parts.mood], { gap: s.gap, stretch, justify: 'space-evenly' }),
        column([parts.stats, parts.rank], { gap: s.gap, stretch, justify: 'space-evenly' }),
      ],
      { gap: s.gap * 2, align: 'start', stretch, justify: 'space-between' },
    );
  };
  const extras = 3;
  return [
    {
      sizeClass: 'standard',
      extras,
      build: (s) =>
        row([sprite, linesColumn(s, true)], { gap: s.gap * 2, justify: 'space-evenly' }),
    },
    {
      sizeClass: 'wide',
      extras,
      build: (s) => row([sprite, linesGrid(s, true)], { gap: s.gap * 2, justify: 'space-evenly' }),
    },
    {
      sizeClass: 'grid',
      extras,
      build: (s) =>
        column([sprite, linesGrid(s, false)], {
          gap: s.gap,
          align: 'center',
          justify: 'space-evenly',
        }),
    },
    {
      sizeClass: 'tall',
      extras,
      build: (s) =>
        column([sprite, linesColumn(s, false)], {
          gap: s.gap,
          align: 'center',
          justify: 'space-evenly',
        }),
    },
  ];
}

/** The smallest sprite: 2 dp per pixel (64 × 80 dp). */
const MIN_SPRITE_PIXEL = 2;
/**
 * How much a bigger sprite counts against bigger text in the choice (score = pixel ^ this × text
 * scale × fill): below 1, so the sprite grows only while the text keeps a good size.
 */
const SPRITE_WEIGHT = 0.75;

/**
 * The large widget's layout: every sprite size (whole dp per sprite pixel, so the pixels stay
 * crisp) × every arrangement; the best scores sprite size × text scale × height fill. Without a
 * companion in the snapshot (an app that has not written one yet) it is the small widget's.
 */
export function companionLayout(view: WidgetView, widthDp: number, heightDp: number): WidgetLayout {
  if (view.kind === 'empty' || !view.companion) return widgetLayout(view, widthDp, heightDp);
  const mood = view.companion.moodTitle;
  // The mood's first frame without the empty canvas around it: the sprite takes only the space
  // its pixels need (the pose, weapon and accessories decide how much).
  const rows = trimPixelRows(
    companionStill(view.companion.mood, {
      loadout: view.companion.loadout,
      weapon: view.companion.weapon,
    }),
  );
  const sprite = (pixel: number): WidgetSprite => ({ type: 'sprite', pixel, rows });
  const maxPixel = Math.max(
    MIN_SPRITE_PIXEL,
    Math.floor(Math.min(widthDp / rows[0].length, heightDp / rows.length)),
  );
  let best: { layout: WidgetLayout; score: number } | undefined;
  for (let pixel = MIN_SPRITE_PIXEL; pixel <= maxPixel; pixel++) {
    const layout = choose(widthDp, heightDp, companionCandidates(view, mood, sprite(pixel)));
    if (!fits(layout.content, layout.inner)) continue;
    // A bigger sprite must not shrink the text below the readable scale (unless nothing else fits).
    const score =
      (layout.sizes.scale >= READABLE_SCALE ? READABLE_BONUS : 0) +
      pixel ** SPRITE_WEIGHT * layout.sizes.scale * layout.fill;
    if (!best || score > best.score) best = { layout: { ...layout, spritePixel: pixel }, score };
  }
  if (best) return best.layout;
  return {
    ...choose(widthDp, heightDp, companionCandidates(view, mood, sprite(MIN_SPRITE_PIXEL))),
    spritePixel: MIN_SPRITE_PIXEL,
  };
}
