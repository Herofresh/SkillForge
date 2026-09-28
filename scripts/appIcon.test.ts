import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Palette } from '@/components/palette';
import { Colors } from '@/components/theme';
import { parsePixelGrid } from '@/lib/pixelGrid';

import {
  ADAPTIVE_LAYER_DP,
  ADAPTIVE_SAFE_ZONE_DP,
  BACKGROUND_COLOR,
  FAVICON_SIZE_PX,
  ICON_ASSETS,
  ICON_SIZE_PX,
  MONOCHROME_KNOCKOUT,
  MOTIF_CELLS,
  MOTIF_COLORS,
  MOTIF_ROLES,
  MOTIF_ROWS,
  motifOffset,
  renderAsset,
  renderLayer,
  type MotifRole,
} from './appIcon';
import { hexToRgba, pixelAt } from './raster';

const ROOT = join(__dirname, '..');
const appJson = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')) as {
  expo: {
    icon: string;
    ios: { icon: string };
    android: { adaptiveIcon: Record<string, string> };
    web: { favicon: string };
    plugins: (string | [string, Record<string, unknown>])[];
  };
};

function pngSize(path: string): { width: number; height: number } {
  const file = readFileSync(join(ROOT, path));
  // The IHDR chunk follows the 8-byte signature and its 8-byte length + type.
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

function assetFor(path: string) {
  const asset = ICON_ASSETS.find((candidate) => candidate.path === path);
  if (!asset) throw new Error(`No icon asset for ${path}`);
  return asset;
}

function rgbaKey(rgba: readonly number[]): string {
  return rgba.join(',');
}

describe('app icon motif', () => {
  it('is a well-formed 32 × 32 grid of known roles', () => {
    expect(MOTIF_ROWS).toHaveLength(MOTIF_CELLS);
    const grid = parsePixelGrid(MOTIF_ROWS, MOTIF_ROLES);
    expect(grid.width).toBe(MOTIF_CELLS);
    expect(grid.height).toBe(MOTIF_CELLS);
  });

  it('uses every role, and every role maps to a palette color', () => {
    const used = new Set(MOTIF_ROWS.join('').replace(/\./g, ''));
    expect([...used].sort()).toEqual([...MOTIF_ROLES].sort());
    for (const role of MOTIF_ROLES) {
      expect(Object.keys(Palette)).toContain(MOTIF_COLORS[role as MotifRole]);
    }
    expect(Palette[BACKGROUND_COLOR]).toBe(Colors.background);
  });

  it('has a left-right symmetric silhouette (the shading may differ)', () => {
    for (const row of MOTIF_ROWS) {
      const shape = [...row].map((cell) => (cell === '.' ? '.' : 'x')).join('');
      expect(shape).toBe([...shape].reverse().join(''));
    }
  });
});

describe('app icon assets', () => {
  it('covers every image app.json points at', () => {
    const { expo } = appJson;
    const splash = expo.plugins.find(
      (plugin): plugin is [string, Record<string, unknown>] =>
        Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    );
    const referenced = [
      expo.icon,
      expo.ios.icon,
      expo.android.adaptiveIcon.foregroundImage,
      expo.android.adaptiveIcon.backgroundImage,
      expo.android.adaptiveIcon.monochromeImage,
      expo.web.favicon,
      splash?.[1].image,
    ].map((path) => String(path).replace(/^\.\//, ''));
    expect([...new Set(referenced)].sort()).toEqual(ICON_ASSETS.map((asset) => asset.path).sort());
  });

  it('uses the icon background color in app.json', () => {
    const splash = appJson.expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    ) as [string, { backgroundColor: string }];
    expect(appJson.expo.android.adaptiveIcon.backgroundColor).toBe(Palette[BACKGROUND_COLOR]);
    expect(splash[1].backgroundColor).toBe(Palette[BACKGROUND_COLOR]);
  });

  it('has the right sizes, on disk too', () => {
    for (const asset of ICON_ASSETS) {
      const expected = asset.path.endsWith('favicon.png') ? FAVICON_SIZE_PX : ICON_SIZE_PX;
      expect(asset.size).toBe(expected);
      expect(pngSize(asset.path)).toEqual({ width: expected, height: expected });
      if (asset.layer !== 'background')
        expect(motifOffset(asset.size, asset.cell)).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps the adaptive motif inside the 66 dp safe zone', () => {
    for (const path of [
      'assets/images/android-icon-foreground.png',
      'assets/images/android-icon-monochrome.png',
    ]) {
      const asset = assetFor(path);
      // The safe zone is a circle: every painted cell's outer corners must lie within its radius.
      const centre = MOTIF_CELLS / 2;
      let maxCells = 0;
      for (const run of parsePixelGrid(MOTIF_ROWS).runs) {
        for (const x of [run.x, run.x + run.width]) {
          for (const y of [run.y, run.y + 1]) {
            maxCells = Math.max(maxCells, Math.hypot(x - centre, y - centre));
          }
        }
      }
      const radiusDp = ((maxCells * asset.cell) / asset.size) * ADAPTIVE_LAYER_DP;
      expect(radiusDp).toBeLessThanOrEqual(ADAPTIVE_SAFE_ZONE_DP / 2);
    }
  });

  it('renders only palette colors, with nearest-neighbour cells', () => {
    const full = renderAsset(assetFor('assets/images/icon.png'));
    const allowed = new Set(
      [BACKGROUND_COLOR, ...Object.values(MOTIF_COLORS)].map((key) =>
        rgbaKey(hexToRgba(Palette[key])),
      ),
    );
    for (let y = 0; y < full.height; y += 7) {
      for (let x = 0; x < full.width; x += 7) {
        expect(allowed.has(rgbaKey(pixelAt(full, x, y)))).toBe(true);
      }
    }
    expect(rgbaKey(pixelAt(full, 0, 0))).toBe(rgbaKey(hexToRgba(Palette[BACKGROUND_COLOR])));
  });

  it('leaves the foreground transparent outside the motif and fills the background', () => {
    const fg = renderLayer('foreground', ICON_SIZE_PX, 18);
    expect(pixelAt(fg, 0, 0)[3]).toBe(0);
    expect(pixelAt(fg, ICON_SIZE_PX / 2, ICON_SIZE_PX / 2)[3]).toBe(255);
    const bg = renderLayer('background', ICON_SIZE_PX, 18);
    expect(rgbaKey(pixelAt(bg, 0, 0))).toBe(rgbaKey(hexToRgba(Palette[BACKGROUND_COLOR])));
  });

  it('knocks the disc out of the monochrome mask', () => {
    const cell = assetFor('assets/images/android-icon-monochrome.png').cell;
    const mono = renderLayer('monochrome', ICON_SIZE_PX, cell);
    const offset = motifOffset(ICON_SIZE_PX, cell);
    MOTIF_ROWS.forEach((row, y) => {
      [...row].forEach((role, x) => {
        const alpha = pixelAt(mono, offset + x * cell + 1, offset + y * cell + 1)[3];
        const knockedOut = role === '.' || MONOCHROME_KNOCKOUT.includes(role as MotifRole);
        expect(alpha).toBe(knockedOut ? 0 : 255);
      });
    });
  });
});
