/**
 * The app icon (PLAN 5.6, ADR-042), drawn as a pixel grid like the UI icons in
 * src/components/ui/icons.ts: a gold hero in a handstand inside a glowing rune ring, on the night
 * background. `npm run icon:build` (scripts/iconBuild.ts) renders every asset app.json points at
 * from this one grid with nearest-neighbour cells, plus the docs preview. Edit the grid, rebuild,
 * commit the PNGs.
 *
 * Pure: grids, colors and render functions only; the CLI writes the files.
 */
import { Palette, type PaletteColor } from '@/components/palette';

import type { RgbaImage } from './png';
import {
  blit,
  composite,
  createImage,
  cropCenter,
  downscale,
  drawGrid,
  mask,
  upscale,
} from './raster';

/**
 * The motif, 32 × 32 cells. Roles: `r` rune ring, `s` its inner glow line, `f` the stone disc inside
 * the ring, `#` gold body, `*` gold highlight (lit left edge), `o` gold shade (right edge), `b` the
 * bronze floor; `.` is empty (the background shows).
 */
export const MOTIF_ROWS: readonly string[] = [
  '..........rrrrrrrrrrrr..........',
  '........rrrrrrrrrrrrrrrr........',
  '......rrrrssssssssssssrrrr......',
  '.....rrrss*#offffff*#ossrrr.....',
  '....rrssfff*#offff*#offfssrr....',
  '...rrsfffff*#offff*#offfffsrr...',
  '...rrsfffff*#offff*#offfffsrr...',
  '..rrsfffffff*#off*#offfffffsrr..',
  '..rrsfffffff*#off*#offfffffsrr..',
  '.rrsff*fffff*#off*#offfff*ffsrr.',
  '.rrsf***fffff*#o*#offfff***fsrr.',
  '.rrsff*ffffff*#o*#offffff*ffsrr.',
  'rrsffffffffff*#o*#offffffffffsrr',
  'rrsffffffffff*####offffffffffsrr',
  'rrsffffffffff*####offffffffffsrr',
  'rrsffffffffff*####offffffffffsrr',
  'rrsffffffffff*####offffffffffsrr',
  'rrsfffffffff*######offfffffffsrr',
  'rrsfffffffff*######offfffffffsrr',
  'rrsffffffff*########offffffffsrr',
  '.rrsffffff*##########offffffsrr.',
  '.rrsffffff*#off#off*#offffffsrr.',
  '.rrsffffff*#of*##of*#offffffsrr.',
  '..rrsfffff*#of*##of*#offfffsrr..',
  '..rrsfffff*#of*##of*#offfffsrr..',
  '...rrsffff*#off#off*#offffsrr...',
  '...rrsfff*###offff*###offfsrr...',
  '....rrssbbbbbbbbbbbbbbbbssrr....',
  '.....rrrssffffffffffffssrrr.....',
  '......rrrrssssssssssssrrrr......',
  '........rrrrrrrrrrrrrrrr........',
  '..........rrrrrrrrrrrr..........',
];

export const MOTIF_CELLS = 32;
export const MOTIF_ROLES = 'rsf#*ob';
export type MotifRole = 'r' | 's' | 'f' | '#' | '*' | 'o' | 'b';

/** Each role's palette color: the gold/rune accents of the design system (docs/DESIGN.md). */
export const MOTIF_COLORS: Readonly<Record<MotifRole, PaletteColor>> = {
  r: 'rune',
  s: 'runeShade',
  f: 'stone',
  '#': 'gold',
  '*': 'goldLight',
  o: 'goldDark',
  b: 'bronze',
};

/** The icon's background: the app's night sky (`Colors.background`). */
export const BACKGROUND_COLOR: PaletteColor = 'night';

/**
 * Roles left empty in the monochrome (themed) icon, which Android reads as an alpha mask: without
 * the disc the hero and the ring stay separate shapes instead of one solid blob.
 */
export const MONOCHROME_KNOCKOUT: readonly MotifRole[] = ['f'];
/** Any opaque color works for the mask; Android tints it with the wallpaper colors. */
export const MONOCHROME_COLOR: PaletteColor = 'bone';

/** Adaptive icon geometry (Android): a 108 dp layer, of which a 66 dp centred circle is always visible. */
export const ADAPTIVE_LAYER_DP = 108;
export const ADAPTIVE_SAFE_ZONE_DP = 66;
/** The 72 dp a launcher shows before masking (for the previews). */
export const ADAPTIVE_VISIBLE_DP = 72;

export const ICON_SIZE_PX = 1024;
export const FAVICON_SIZE_PX = 48;

export type IconLayer = 'full' | 'foreground' | 'background' | 'monochrome';

/** One PNG app.json needs: where it goes, its size, which layer and the motif's cell size. */
export interface IconAsset {
  path: string;
  size: number;
  layer: IconLayer;
  /** Pixels per motif cell (the motif is centred); unused for the background. */
  cell: number;
}

export const ICON_ASSETS: readonly IconAsset[] = [
  // Store / iOS / legacy icon: full bleed, motif at 87.5 % so a circular mask never cuts the ring.
  { path: 'assets/images/icon.png', size: ICON_SIZE_PX, layer: 'full', cell: 28 },
  // Adaptive layers: the motif is 576 px of 1024 (~61 dp); its outermost pixel corners sit 32.7 dp
  // from the centre, inside the 66 dp safe-zone circle (radius 33 dp).
  {
    path: 'assets/images/android-icon-foreground.png',
    size: ICON_SIZE_PX,
    layer: 'foreground',
    cell: 18,
  },
  {
    path: 'assets/images/android-icon-background.png',
    size: ICON_SIZE_PX,
    layer: 'background',
    cell: 18,
  },
  {
    path: 'assets/images/android-icon-monochrome.png',
    size: ICON_SIZE_PX,
    layer: 'monochrome',
    cell: 18,
  },
  // Splash: transparent, edge to edge (app.json scales it to `imageWidth`).
  { path: 'assets/images/splash-icon.png', size: ICON_SIZE_PX, layer: 'foreground', cell: 32 },
  { path: 'assets/images/favicon.png', size: FAVICON_SIZE_PX, layer: 'full', cell: 1 },
];

export const PREVIEW_PATH = 'docs/screenshots/5.6-app-icon.png';

function isMotifRole(role: string): role is MotifRole {
  return MOTIF_ROLES.includes(role);
}

function motifColor(role: string): string | undefined {
  return isMotifRole(role) ? Palette[MOTIF_COLORS[role]] : undefined;
}

function monochromeColor(role: string): string | undefined {
  if (!isMotifRole(role) || MONOCHROME_KNOCKOUT.includes(role)) return undefined;
  return Palette[MONOCHROME_COLOR];
}

/** Pixel offset that centres the motif at `cell` px per cell in a `size` px square. */
export function motifOffset(size: number, cell: number): number {
  const extent = MOTIF_CELLS * cell;
  if (extent > size) throw new Error(`A ${cell} px cell makes the motif larger than ${size} px`);
  return Math.floor((size - extent) / 2);
}

function drawMotif(image: RgbaImage, cell: number, colorOf: (role: string) => string | undefined) {
  const offset = motifOffset(image.width, cell);
  return drawGrid(image, MOTIF_ROWS, colorOf, { cell, x: offset, y: offset });
}

/** Renders one layer as an RGBA image. */
export function renderLayer(layer: IconLayer, size: number, cell: number): RgbaImage {
  const background = Palette[BACKGROUND_COLOR];
  switch (layer) {
    case 'background':
      return createImage(size, size, background);
    case 'foreground':
      return drawMotif(createImage(size, size), cell, motifColor);
    case 'full':
      return drawMotif(createImage(size, size, background), cell, motifColor);
    case 'monochrome':
      return drawMotif(createImage(size, size), cell, monochromeColor);
  }
}

export function renderAsset(asset: IconAsset): RgbaImage {
  return renderLayer(asset.layer, asset.size, asset.cell);
}

// ---------------------------------------------------------------------------------------------
// Preview (docs/screenshots/5.6-app-icon.png): the icon as launchers show it, at full and small size.

const PREVIEW_TILE = 256;
const PREVIEW_GAP = 32;
const SMALL_SIZES = [96, 48] as const;
/** The small launcher sizes are also shown blown up ×4 so single pixels can be judged. */
const SMALL_ZOOM = 4;

/** What a launcher shows: background + foreground, the visible 72 of 108 dp, in a mask shape. */
function launcherIcon(layer: 'color' | 'themed', shape: 'circle' | 'squircle'): RgbaImage {
  const fg = ICON_ASSETS.find((asset) => asset.layer === 'foreground' && asset.cell < 32);
  if (!fg) throw new Error('No adaptive foreground asset');
  const visible = Math.round((ICON_SIZE_PX * ADAPTIVE_VISIBLE_DP) / ADAPTIVE_LAYER_DP);
  const stacked =
    layer === 'color'
      ? composite(
          renderLayer('background', ICON_SIZE_PX, fg.cell),
          renderLayer('foreground', ICON_SIZE_PX, fg.cell),
        )
      : // A themed icon: the monochrome mask in a light tone on a dark tinted plate.
        composite(
          createImage(ICON_SIZE_PX, ICON_SIZE_PX, Palette.stoneRaised),
          recolor(renderLayer('monochrome', ICON_SIZE_PX, fg.cell), Palette.mist),
        );
  const cropped = cropCenter(stacked, visible);
  const r = visible / 2;
  const corner = visible * 0.3;
  return mask(cropped, (x, y) => {
    const dx = Math.abs(x + 0.5 - r);
    const dy = Math.abs(y + 0.5 - r);
    if (shape === 'circle') return dx * dx + dy * dy <= r * r;
    const ex = Math.max(0, dx - (r - corner));
    const ey = Math.max(0, dy - (r - corner));
    return ex * ex + ey * ey <= corner * corner;
  });
}

function recolor(image: RgbaImage, color: string): RgbaImage {
  const tinted = createImage(image.width, image.height, color);
  for (let i = 3; i < tinted.data.length; i += 4) tinted.data[i] = image.data[i];
  return tinted;
}

/**
 * The preview sheet, top row: icon.png, the adaptive icon in a circle and a squircle mask, the
 * themed (monochrome) icon, the splash icon. Bottom row: the circle icon at 96 and 48 px, then the
 * same two blown up ×4 (nearest neighbour) to judge them pixel by pixel.
 */
export function renderPreview(): RgbaImage {
  const top: RgbaImage[] = [
    downscale(renderLayer('full', ICON_SIZE_PX, 28), PREVIEW_TILE),
    downscale(launcherIcon('color', 'circle'), PREVIEW_TILE),
    downscale(launcherIcon('color', 'squircle'), PREVIEW_TILE),
    downscale(launcherIcon('themed', 'circle'), PREVIEW_TILE),
    downscale(renderLayer('foreground', ICON_SIZE_PX, 32), PREVIEW_TILE),
  ];
  const circle = launcherIcon('color', 'circle');
  const small = SMALL_SIZES.map((size) => downscale(circle, size));
  const bottom: RgbaImage[] = [...small, ...small.map((image) => upscale(image, SMALL_ZOOM))];

  const width = PREVIEW_GAP + top.length * (PREVIEW_TILE + PREVIEW_GAP);
  const bottomHeight = Math.max(...bottom.map((image) => image.height));
  const height = PREVIEW_GAP * 3 + PREVIEW_TILE + bottomHeight;
  const sheet = createImage(width, height, Palette.stone);
  top.forEach((image, i) =>
    blit(sheet, image, PREVIEW_GAP + i * (PREVIEW_TILE + PREVIEW_GAP), PREVIEW_GAP),
  );
  let x = PREVIEW_GAP;
  const y = PREVIEW_GAP * 2 + PREVIEW_TILE;
  for (const image of bottom) {
    blit(sheet, image, x, y + bottomHeight - image.height);
    x += image.width + PREVIEW_GAP;
  }
  return sheet;
}
