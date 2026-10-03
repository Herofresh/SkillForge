/**
 * The home-screen widget's picture in the launcher's widget picker (PLAN 6.6b, ADR-055): a static
 * PNG of the default 4 × 2 widget with sample values, drawn from the same pixel icons and colors
 * as `src/widget/nativeWidget.tsx` (at its 1.5 scale). Text uses the 3 × 5 preview font, since
 * the build has no TTF rasterizer; the real widget draws Jersey 15 and Silkscreen. Written by
 * `npm run icon:build` to the path app.json's widget `previewImage` points at.
 */
import { AttributeColors, Colors, PIXEL, RankColors } from '@/components/theme';
import { iconCellColor, iconGrid, type IconName, type IconRole } from '@/components/ui/icons';

import type { RgbaImage } from './png';
import { createImage, drawGrid, fillRect, hexToRgba } from './raster';
import { drawText, GLYPH_HEIGHT, textWidth } from './tinyFont';

export const WIDGET_PREVIEW_PATH = 'assets/images/widget-preview.png';

/** The default 4 × 2 widget on a Pixel 8 Pro launcher, in dp. */
export const PREVIEW_WIDTH_DP = 336;
export const PREVIEW_HEIGHT_DP = 214;
/** Image pixels per dp (an xhdpi-sized picture; launchers scale it to the picker cell). */
export const PREVIEW_PX_PER_DP = 2;

/** Sizes in dp, the widget's at scale 1.5 (`widgetSizes(336, 214)`). */
const ICON_DP = 36;
const SMALL_ICON_DP = 24;
const PADDING_DP = 15;
const GAP_DP = 9;
/** dp per font pixel: status and rank, big numbers, small caps labels. */
const TEXT_DP = 3;
const NUMBER_DP = 4;
const LABEL_DP = 2;

/** Sample values: what a hero a few weeks in might see. */
const SAMPLE = {
  status: 'Trained today',
  streak: '3',
  level: '7',
  rank: 'Adept',
  attributes: [
    { label: 'Pull', value: '12', color: AttributeColors.pull },
    { label: 'Push', value: '9', color: AttributeColors.push },
    { label: 'Core', value: '7', color: AttributeColors.core },
  ],
} as const;

const px = (dp: number) => dp * PREVIEW_PX_PER_DP;
const textHeightDp = (fontDp: number) => GLYPH_HEIGHT * fontDp;
const textWidthDp = (text: string, fontDp: number) => textWidth(text, fontDp);

function icon(image: RgbaImage, name: IconName, xDp: number, yDp: number, sizeDp: number) {
  const grid = iconGrid(name);
  drawGrid(image, grid, (role) => iconCellColor(name, role as IconRole), {
    cell: px(sizeDp) / grid.width,
    x: px(xDp),
    y: px(yDp),
  });
}

function text(
  image: RgbaImage,
  value: string,
  xDp: number,
  yDp: number,
  color: string,
  fontDp: number,
) {
  drawText(image, value, px(xDp), px(yDp), color, px(fontDp));
}

function fillDp(
  image: RgbaImage,
  xDp: number,
  yDp: number,
  wDp: number,
  hDp: number,
  color: string,
) {
  fillRect(image, px(xDp), px(yDp), px(wDp), px(hDp), hexToRgba(color));
}

/** The widget picker preview: frame, status column and hero column with the sample values. */
export function renderWidgetPreview(): RgbaImage {
  const image = createImage(px(PREVIEW_WIDTH_DP), px(PREVIEW_HEIGHT_DP), Colors.ink);
  // The pixel frame: ink line, stone-edge line, stone fill (DESIGN.md → Home-screen widget).
  fillDp(
    image,
    PIXEL,
    PIXEL,
    PREVIEW_WIDTH_DP - 2 * PIXEL,
    PREVIEW_HEIGHT_DP - 2 * PIXEL,
    Colors.border,
  );
  const inset = 2 * PIXEL;
  fillDp(
    image,
    inset,
    inset,
    PREVIEW_WIDTH_DP - 2 * inset,
    PREVIEW_HEIGHT_DP - 2 * inset,
    Colors.surface,
  );

  // Status column, centred vertically: status row, then the streak / level row.
  const left = inset + PADDING_DP;
  const columnHeight = ICON_DP + GAP_DP + ICON_DP;
  const top = Math.round((PREVIEW_HEIGHT_DP - columnHeight) / 2);
  icon(image, 'check', left, top, ICON_DP);
  const textX = left + ICON_DP + GAP_DP;
  text(
    image,
    SAMPLE.status,
    textX,
    top + (ICON_DP - textHeightDp(TEXT_DP)) / 2,
    Colors.success,
    TEXT_DP,
  );

  const statsY = top + ICON_DP + GAP_DP;
  icon(image, 'flame', left, statsY, ICON_DP);
  const blockHeight = textHeightDp(NUMBER_DP) + LABEL_DP * 2 + textHeightDp(LABEL_DP);
  const numberY = statsY + (ICON_DP - blockHeight) / 2;
  const labelY = numberY + textHeightDp(NUMBER_DP) + LABEL_DP * 2;
  text(image, SAMPLE.streak, textX, numberY, Colors.ember, NUMBER_DP);
  text(image, 'Streak', textX, labelY, Colors.textMuted, LABEL_DP);
  const levelX = textX + textWidthDp('Streak', LABEL_DP) + 2 * GAP_DP;
  text(image, SAMPLE.level, levelX, numberY, Colors.goldLight, NUMBER_DP);
  text(image, 'Level', levelX, labelY, Colors.textMuted, LABEL_DP);

  // Hero column, right-aligned: shield + rank, then the top attributes.
  const right = PREVIEW_WIDTH_DP - inset - PADDING_DP;
  const rowDp = textHeightDp(TEXT_DP);
  const rowGap = GAP_DP / 3;
  const heroHeight = SMALL_ICON_DP + SAMPLE.attributes.length * (rowDp + rowGap);
  const heroTop = Math.round((PREVIEW_HEIGHT_DP - heroHeight) / 2);
  const rankWidth = textWidthDp(SAMPLE.rank, TEXT_DP);
  const shieldX = right - rankWidth - GAP_DP / 1.5 - SMALL_ICON_DP;
  icon(image, 'shield', shieldX, heroTop, SMALL_ICON_DP);
  text(
    image,
    SAMPLE.rank,
    right - rankWidth,
    heroTop + (SMALL_ICON_DP - rowDp) / 2,
    RankColors.Adept,
    TEXT_DP,
  );
  SAMPLE.attributes.forEach((entry, index) => {
    const rowY = heroTop + SMALL_ICON_DP + rowGap + index * (rowDp + rowGap);
    const valueWidth = textWidthDp(entry.value, TEXT_DP);
    text(image, entry.value, right - valueWidth, rowY, entry.color, TEXT_DP);
    const labelWidth = textWidthDp(entry.label, LABEL_DP);
    const labelX = right - valueWidth - GAP_DP / 1.5 - labelWidth;
    text(
      image,
      entry.label,
      labelX,
      rowY + rowDp - textHeightDp(LABEL_DP),
      Colors.textMuted,
      LABEL_DP,
    );
  });
  return image;
}
