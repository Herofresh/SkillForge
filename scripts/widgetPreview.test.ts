import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Palette } from '@/components/palette';
import { Colors } from '@/components/theme';

import { encodePng } from './png';
import { hexToRgba, pixelAt } from './raster';
import {
  COMPANION_PREVIEW_HEIGHT_DP,
  COMPANION_PREVIEW_PATH,
  COMPANION_PREVIEW_WIDTH_DP,
  PREVIEW_HEIGHT_DP,
  PREVIEW_PX_PER_DP,
  PREVIEW_WIDTH_DP,
  renderCompanionWidgetPreview,
  renderWidgetPreview,
  WIDGET_PREVIEW_PATH,
} from './widgetPreview';

const ROOT = join(__dirname, '..');

interface WidgetConfig {
  name: string;
  previewImage?: string;
}

function widgetConfigs(): WidgetConfig[] {
  const appJson = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')) as {
    expo: { plugins: (string | [string, { widgets?: WidgetConfig[] }])[] };
  };
  const entry = appJson.expo.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'react-native-android-widget',
  ) as [string, { widgets: WidgetConfig[] }];
  return entry[1].widgets;
}

describe('widget picker preview', () => {
  const image = renderWidgetPreview();

  it('is the preview image app.json gives each widget', () => {
    expect(widgetConfigs().map((widget) => [widget.name, widget.previewImage])).toEqual([
      ['SkillForge', `./${WIDGET_PREVIEW_PATH}`],
      ['SkillForgeCompanion', `./${COMPANION_PREVIEW_PATH}`],
    ]);
  });

  it('is the 4 x 2 widget at its pixel density', () => {
    expect(image.width).toBe(PREVIEW_WIDTH_DP * PREVIEW_PX_PER_DP);
    expect(image.height).toBe(PREVIEW_HEIGHT_DP * PREVIEW_PX_PER_DP);
  });

  it('draws the frame lines and only opaque palette colors', () => {
    expect(pixelAt(image, 0, 0)).toEqual(hexToRgba(Colors.ink));
    expect(pixelAt(image, 2 * PREVIEW_PX_PER_DP, 2 * PREVIEW_PX_PER_DP)).toEqual(
      hexToRgba(Colors.border),
    );
    expect(pixelAt(image, image.width / 2, 8 * PREVIEW_PX_PER_DP)).toEqual(
      hexToRgba(Colors.surface),
    );
    const palette = new Set(Object.values(Palette).map((hex) => hexToRgba(hex).join(',')));
    for (let i = 0; i < image.data.length; i += 4) {
      const key = Array.from(image.data.subarray(i, i + 4)).join(',');
      if (!palette.has(key)) throw new Error(`Not a palette color: ${key} at pixel ${i / 4}`);
    }
  });

  it('is committed as rendered (run npm run icon:build after changing it)', () => {
    const onDisk = readFileSync(join(ROOT, WIDGET_PREVIEW_PATH));
    expect(onDisk.equals(encodePng(image))).toBe(true);
  });
});

describe('large widget picker preview (PLAN 6.10)', () => {
  const image = renderCompanionWidgetPreview();

  it('is the 4 x 3 widget at its pixel density, framed', () => {
    expect(image.width).toBe(COMPANION_PREVIEW_WIDTH_DP * PREVIEW_PX_PER_DP);
    expect(image.height).toBe(COMPANION_PREVIEW_HEIGHT_DP * PREVIEW_PX_PER_DP);
    expect(pixelAt(image, 0, 0)).toEqual(hexToRgba(Colors.ink));
  });

  it('is committed as rendered (run npm run icon:build after changing it)', () => {
    const onDisk = readFileSync(join(ROOT, COMPANION_PREVIEW_PATH));
    expect(onDisk.equals(encodePng(image))).toBe(true);
  });
});
