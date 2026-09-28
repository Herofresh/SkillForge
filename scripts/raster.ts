/**
 * Tiny RGBA raster helpers for the app icon build (scripts/appIcon.ts, ADR-042): draw a pixel grid
 * with nearest-neighbour cells, composite layers, mask, and downscale for previews. Pure functions
 * on {@link RgbaImage}; no I/O.
 */
import { parsePixelGrid } from '@/lib/pixelGrid';

import type { RgbaImage } from './png';

const HEX_COLOR = /^#([0-9a-f]{6})$/i;
const OPAQUE = 255;

export type Rgba = readonly [number, number, number, number];

/** `#RRGGBB` to an opaque RGBA tuple. */
export function hexToRgba(hex: string): Rgba {
  const match = HEX_COLOR.exec(hex);
  if (!match) throw new Error(`Expected a #RRGGBB color, got "${hex}"`);
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, OPAQUE];
}

/** A transparent image, or one filled with `color`. */
export function createImage(width: number, height: number, color?: string): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  if (color !== undefined) {
    const rgba = hexToRgba(color);
    for (let i = 0; i < data.length; i += 4) data.set(rgba, i);
  }
  return { width, height, data };
}

/** The RGBA value at (x, y). */
export function pixelAt(image: RgbaImage, x: number, y: number): Rgba {
  const i = (y * image.width + x) * 4;
  const d = image.data;
  return [d[i], d[i + 1], d[i + 2], d[i + 3]];
}

/** Paints a rectangle (clipped to the image) in one opaque color. */
function fillRect(image: RgbaImage, x0: number, y0: number, w: number, h: number, rgba: Rgba) {
  const x1 = Math.min(image.width, x0 + w);
  const y1 = Math.min(image.height, y0 + h);
  for (let y = Math.max(0, y0); y < y1; y += 1) {
    for (let x = Math.max(0, x0); x < x1; x += 1) image.data.set(rgba, (y * image.width + x) * 4);
  }
}

export interface GridPlacement {
  /** Size of one grid cell in image pixels (nearest-neighbour upscaling). */
  cell: number;
  /** Top-left corner of the grid in image pixels. */
  x: number;
  y: number;
}

/**
 * Draws a pixel grid (rows of role characters, `.` empty, see src/lib/pixelGrid.ts) onto `image`.
 * `colorOf` maps a role to a `#RRGGBB` color, or `undefined` to leave the cell empty.
 */
export function drawGrid(
  image: RgbaImage,
  rows: readonly string[],
  colorOf: (role: string) => string | undefined,
  placement: GridPlacement,
): RgbaImage {
  const { cell } = placement;
  for (const run of parsePixelGrid(rows).runs) {
    const color = colorOf(run.role);
    if (color === undefined) continue;
    fillRect(
      image,
      placement.x + run.x * cell,
      placement.y + run.y * cell,
      run.width * cell,
      cell,
      hexToRgba(color),
    );
  }
  return image;
}

/** `top` over `bottom` (same size), source-over alpha compositing. Returns a new image. */
export function composite(bottom: RgbaImage, top: RgbaImage): RgbaImage {
  if (bottom.width !== top.width || bottom.height !== top.height) {
    throw new Error('composite needs images of the same size');
  }
  const out = createImage(bottom.width, bottom.height);
  for (let i = 0; i < out.data.length; i += 4) {
    const ta = top.data[i + 3] / OPAQUE;
    const ba = bottom.data[i + 3] / OPAQUE;
    const a = ta + ba * (1 - ta);
    for (let c = 0; c < 3; c += 1) {
      const value = a === 0 ? 0 : (top.data[i + c] * ta + bottom.data[i + c] * ba * (1 - ta)) / a;
      out.data[i + c] = Math.round(value);
    }
    out.data[i + 3] = Math.round(a * OPAQUE);
  }
  return out;
}

/** Crops the centred square of `size` pixels. */
export function cropCenter(image: RgbaImage, size: number): RgbaImage {
  const out = createImage(size, size);
  const x0 = Math.floor((image.width - size) / 2);
  const y0 = Math.floor((image.height - size) / 2);
  for (let y = 0; y < size; y += 1) {
    const from = ((y0 + y) * image.width + x0) * 4;
    out.data.set(image.data.subarray(from, from + size * 4), y * size * 4);
  }
  return out;
}

/** Clears every pixel for which `keep(x, y)` is false (a launcher mask in the previews). */
export function mask(image: RgbaImage, keep: (x: number, y: number) => boolean): RgbaImage {
  const out = { ...image, data: image.data.slice() };
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (!keep(x, y)) out.data[(y * image.width + x) * 4 + 3] = 0;
    }
  }
  return out;
}

/**
 * Area-average downscale to `size` × `size` (what a launcher does to a 1024 px icon), with
 * premultiplied alpha so transparent pixels don't darken edges.
 */
export function downscale(image: RgbaImage, size: number): RgbaImage {
  const out = createImage(size, size);
  const sx = image.width / size;
  const sy = image.height / size;
  for (let y = 0; y < size; y += 1) {
    const ya = Math.floor(y * sy);
    const yb = Math.max(ya + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < size; x += 1) {
      const xa = Math.floor(x * sx);
      const xb = Math.max(xa + 1, Math.floor((x + 1) * sx));
      const sum = [0, 0, 0, 0];
      for (let v = ya; v < yb; v += 1) {
        for (let u = xa; u < xb; u += 1) {
          const [r, g, b, a] = pixelAt(image, u, v);
          sum[0] += r * a;
          sum[1] += g * a;
          sum[2] += b * a;
          sum[3] += a;
        }
      }
      const count = (yb - ya) * (xb - xa);
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c += 1)
        out.data[i + c] = sum[3] === 0 ? 0 : Math.round(sum[c] / sum[3]);
      out.data[i + 3] = Math.round(sum[3] / count);
    }
  }
  return out;
}

/** Nearest-neighbour upscale by an integer factor (to look at a small downscale in the preview). */
export function upscale(image: RgbaImage, factor: number): RgbaImage {
  const out = createImage(image.width * factor, image.height * factor);
  for (let y = 0; y < out.height; y += 1) {
    for (let x = 0; x < out.width; x += 1) {
      out.data.set(
        pixelAt(image, Math.floor(x / factor), Math.floor(y / factor)),
        (y * out.width + x) * 4,
      );
    }
  }
  return out;
}

/** Copies `source` onto `target` at (x, y), alpha-blended. Mutates and returns `target`. */
export function blit(target: RgbaImage, source: RgbaImage, x: number, y: number): RgbaImage {
  for (let v = 0; v < source.height; v += 1) {
    for (let u = 0; u < source.width; u += 1) {
      const tx = x + u;
      const ty = y + v;
      if (tx < 0 || ty < 0 || tx >= target.width || ty >= target.height) continue;
      const [r, g, b, a] = pixelAt(source, u, v);
      if (a === 0) continue;
      const i = (ty * target.width + tx) * 4;
      const t = a / OPAQUE;
      target.data[i] = Math.round(r * t + target.data[i] * (1 - t));
      target.data[i + 1] = Math.round(g * t + target.data[i + 1] * (1 - t));
      target.data[i + 2] = Math.round(b * t + target.data[i + 2] * (1 - t));
      target.data[i + 3] = Math.max(target.data[i + 3], a);
    }
  }
  return target;
}
