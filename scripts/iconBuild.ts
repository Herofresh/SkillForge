/**
 * CLI behind `npm run icon:build` (runs via tsx, ADR-042): renders the app icon grid in
 * scripts/appIcon.ts to every PNG app.json points at, plus the docs preview. Commit the results.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ICON_ASSETS, PREVIEW_PATH, renderAsset, renderPreview } from './appIcon';
import { encodePng, type RgbaImage } from './png';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();

function write(path: string, image: RgbaImage) {
  const absolute = join(ROOT, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, encodePng(image));
  console.log(`Wrote ${path} (${image.width}×${image.height})`);
}

for (const asset of ICON_ASSETS) write(asset.path, renderAsset(asset));
write(PREVIEW_PATH, renderPreview());
