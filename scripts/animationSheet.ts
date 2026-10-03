/**
 * Contact sheets of the exercise animations (PLAN 6.4, ADR-053): one row per animation with its
 * label and every frame of the loop, on the app's stone panel color, so a person can check that
 * each one reads as its exercise. `npm run animations:sheet` writes them to docs/screenshots/.
 */
import { FIGURE_COLORS } from '@/components/ui/figurePalette';
import { Palette } from '@/components/palette';
import { FIGURE_GRID } from '@/lib/figure';
import { animationFrames, type FigureAnimation } from '@/lib/figureAnimation';

import type { RgbaImage } from './png';
import { createImage, drawGrid } from './raster';
import { drawText, GLYPH_HEIGHT } from './tinyFont';

export interface SheetEntry {
  label: string;
  animation: FigureAnimation;
}

/** Image pixels per figure cell: a 32-cell frame is 128 px, about its size on a phone. */
export const SHEET_CELL = 4;
const GAP = 8;
const LABEL_SCALE = 3;
const LABEL_WIDTH = 30 * (4 * LABEL_SCALE);
const BACKGROUND = Palette.night;
const PANEL = Palette.stone;
const LABEL_COLOR = Palette.bone;

function colorOf(role: string): string | undefined {
  const name = FIGURE_COLORS[role as keyof typeof FIGURE_COLORS];
  return name === undefined ? undefined : Palette[name];
}

function fillRect(image: RgbaImage, x: number, y: number, w: number, h: number, color: string) {
  const panel = createImage(1, 1, color).data.subarray(0, 4);
  for (let v = y; v < y + h; v += 1) {
    for (let u = x; u < x + w; u += 1) image.data.set(panel, (v * image.width + u) * 4);
  }
}

/** A labelled row of finished frames (grid rows) and how its roles are colored. */
export interface FrameRow {
  label: string;
  frames: readonly (readonly string[])[];
  colorOf: (role: string) => string | undefined;
}

/**
 * One row per entry: the label, then each frame on a stone panel. Also draws the companion
 * sheets (PLAN 6.10), whose frames carry accessories and their own colors.
 */
export function renderFrameSheet(rows: readonly FrameRow[], cell = SHEET_CELL): RgbaImage {
  const first = rows[0]?.frames[0];
  const FRAME_W = (first?.[0]?.length ?? FIGURE_GRID) * cell;
  const FRAME_PX = (first?.length ?? FIGURE_GRID) * cell;
  const columns = Math.max(1, ...rows.map((row) => row.frames.length));
  const width = GAP + LABEL_WIDTH + columns * (FRAME_W + GAP);
  const height = GAP + rows.length * (FRAME_PX + GAP);
  const image = createImage(width, height, BACKGROUND);
  rows.forEach((entry, row) => {
    const y = GAP + row * (FRAME_PX + GAP);
    const label = entry.label.slice(0, Math.floor(LABEL_WIDTH / (4 * LABEL_SCALE)) - 1);
    drawText(
      image,
      label,
      GAP,
      y + Math.floor((FRAME_PX - GLYPH_HEIGHT * LABEL_SCALE) / 2),
      LABEL_COLOR,
      LABEL_SCALE,
    );
    entry.frames.forEach((rows, column) => {
      const x = GAP + LABEL_WIDTH + column * (FRAME_W + GAP);
      fillRect(image, x, y, FRAME_W, FRAME_PX, PANEL);
      drawGrid(image, rows, entry.colorOf, { cell, x, y });
    });
  });
  return image;
}

/** One row per animation: the label, then each frame on a stone panel. */
export function renderSheet(entries: readonly SheetEntry[], cell = SHEET_CELL): RgbaImage {
  return renderFrameSheet(
    entries.map((entry) => ({
      label: entry.label,
      frames: animationFrames(entry.animation),
      colorOf,
    })),
    cell,
  );
}
