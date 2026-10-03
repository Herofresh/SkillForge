/**
 * The home-screen widgets' pictures in the launcher's widget picker (PLAN 6.6b, ADR-056; 6.12,
 * ADR-062): static PNGs of both widgets at their default size with sample values, drawn from the
 * same layout as the widget itself (`src/widget/widgetLayout.ts`: the arrangement, scale and
 * positions it chooses for that size), with the same pixel icons, sprite and colors. Text uses the
 * 3 × 5 preview font, sized to the real text's width and line, since the build has no TTF
 * rasterizer; the real widget draws Jersey 15 and Silkscreen. Written by `npm run icon:build` to
 * the paths app.json's widget `previewImage`s point at.
 */
import { Colors, PIXEL } from '@/components/theme';
import { iconCellColor, iconGrid, type IconRole } from '@/components/ui/icons';
import { companionColors } from '@/data/companion';
import { WIDGET_DEEP_LINK, type WidgetView } from '@/domain/widget';
import {
  companionLayout,
  placeWidgetNodes,
  widgetLayout,
  type PlacedLeaf,
  type WidgetLayout,
} from '@/widget/widgetLayout';

import type { RgbaImage } from './png';
import { createImage, drawGrid, fillRect, hexToRgba } from './raster';
import { drawText, GLYPH_HEIGHT, textWidth } from './tinyFont';

export const WIDGET_PREVIEW_PATH = 'assets/images/widget-preview.png';
export const COMPANION_PREVIEW_PATH = 'assets/images/widget-companion-preview.png';

/**
 * The default sizes on the Pixel 8 Pro emulator's launcher (4 columns), in dp, as the launcher
 * reports them to the widget: the small widget 4 × 1, the companion widget 4 × 2.
 */
export const PREVIEW_WIDTH_DP = 395;
export const PREVIEW_HEIGHT_DP = 115;
export const COMPANION_PREVIEW_WIDTH_DP = 395;
export const COMPANION_PREVIEW_HEIGHT_DP = 250;
/** Image pixels per dp (an xhdpi-sized picture; launchers scale it to the picker cell). */
export const PREVIEW_PX_PER_DP = 2;

/** Sample values: what a hero a few weeks in, trained today, might see. */
export const SAMPLE_VIEW: WidgetView = {
  kind: 'hero',
  deepLink: WIDGET_DEEP_LINK,
  trainedToday: true,
  status: 'Trained today',
  streak: 3,
  level: 7,
  rank: 'Adept',
  heroClass: { id: 'warrior', title: 'Warrior' },
  topAttributes: [
    { attribute: 'pull', value: 12 },
    { attribute: 'push', value: 9 },
    { attribute: 'core', value: 7 },
  ],
  companion: {
    // A Warrior a few weeks in.
    loadout: {
      head: 'iron_helm',
      cloak: 'hooded_cloak',
      hands: 'leather_bracers',
      aura: 'trial_medallion',
    },
    weapon: { classId: 'warrior', upgraded: false },
    look: {},
    mood: 'happy',
    moodTitle: 'Fired up',
  },
};

const px = (dp: number) => Math.round(dp * PREVIEW_PX_PER_DP);

/** The preview font's pixel size for a text box: as wide as the real text allows, fits its line. */
function fontPixel(value: string, widthPx: number, heightPx: number): number {
  const byWidth = Math.floor(widthPx / Math.max(1, textWidth(value, 1)));
  const byHeight = Math.floor(heightPx / GLYPH_HEIGHT);
  return Math.max(1, Math.min(byWidth, byHeight));
}

function drawLeaf(image: RgbaImage, placed: PlacedLeaf, view: WidgetView): void {
  const { node } = placed;
  const x = px(placed.x);
  const y = px(placed.y);
  switch (node.type) {
    case 'icon': {
      const grid = iconGrid(node.name);
      drawGrid(image, grid, (role) => iconCellColor(node.name, role as IconRole), {
        // Whole image pixels per cell (the 16 dp shield is 2.67 px per cell at 2 px per dp).
        cell: Math.max(1, Math.round(px(node.size) / grid.width)),
        x,
        y,
      });
      return;
    }
    case 'sprite': {
      if (view.kind !== 'hero' || !view.companion) return;
      const colors = companionColors(view.companion.look);
      drawGrid(image, node.rows, (role) => colors[role], { cell: px(node.pixel), x, y });
      return;
    }
    case 'text': {
      // Jersey 15's capitals fill about 70 % of its line, Silkscreen's about 60 %.
      const capShare = node.font === 'pixel' ? 0.7 : 0.6;
      const height = px(placed.height);
      const pixel = fontPixel(node.text, px(placed.width), Math.round(height * capShare));
      const top = y + Math.round((height - GLYPH_HEIGHT * pixel) / 2);
      drawText(image, node.text, x, top, node.color, pixel);
    }
  }
}

/** A widget's picker preview: the frame, then every placed text, icon and sprite of `layout`. */
function renderLayout(
  layout: WidgetLayout,
  view: WidgetView,
  widthDp: number,
  heightDp: number,
): RgbaImage {
  const image = createImage(px(widthDp), px(heightDp), Colors.ink);
  // The pixel frame: ink line, stone-edge line, stone fill (DESIGN.md → Home-screen widget).
  fillRect(
    image,
    px(PIXEL),
    px(PIXEL),
    px(widthDp - 2 * PIXEL),
    px(heightDp - 2 * PIXEL),
    hexToRgba(Colors.border),
  );
  const frame = 2 * PIXEL;
  fillRect(
    image,
    px(frame),
    px(frame),
    px(widthDp - 2 * frame),
    px(heightDp - 2 * frame),
    hexToRgba(Colors.surface),
  );
  const inset = frame + layout.padding;
  for (const placed of placeWidgetNodes(
    layout.root,
    inset,
    inset,
    layout.inner.width,
    layout.inner.height,
  )) {
    drawLeaf(image, placed, view);
  }
  return image;
}

/** The small widget's picker preview (its default 4 × 1 size). */
export function renderWidgetPreview(): RgbaImage {
  const layout = widgetLayout(SAMPLE_VIEW, PREVIEW_WIDTH_DP, PREVIEW_HEIGHT_DP);
  return renderLayout(layout, SAMPLE_VIEW, PREVIEW_WIDTH_DP, PREVIEW_HEIGHT_DP);
}

/** The companion widget's picker preview (its default 4 × 2 size). */
export function renderCompanionWidgetPreview(): RgbaImage {
  const layout = companionLayout(
    SAMPLE_VIEW,
    COMPANION_PREVIEW_WIDTH_DP,
    COMPANION_PREVIEW_HEIGHT_DP,
  );
  return renderLayout(layout, SAMPLE_VIEW, COMPANION_PREVIEW_WIDTH_DP, COMPANION_PREVIEW_HEIGHT_DP);
}
