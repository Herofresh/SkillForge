/**
 * CLI behind `npm run companion:sheet` (runs via tsx, PLAN 6.10, ADR-059): contact sheets of the
 * companion sprite for review: every animation (moods, victory, wave) for a few outfits, every
 * accessory in four poses (per slot), every class weapon (base and tier III) and the colour looks.
 * Writes docs/screenshots/6.10-*.png; commit the results.
 *
 * While tuning art: `npm run companion:sheet -- --only iron_helm,warrior,legend --cell 8 --out <png>`
 * (accessory ids, class ids for weapons, outfit labels).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

import {
  ACCESSORIES,
  CLASS_WEAPONS,
  COMPANION_ANIMATIONS,
  COMPANION_DYES,
  COMPANION_HAIRS,
  COMPANION_TINTS,
  companionColors,
  companionFrame,
  type CompanionAnimation,
  type CompanionLook,
  type CompanionOutfit,
} from '@/data/companion';
import { COMPANION_SLOTS } from '@/domain/types';

import { renderFrameSheet, type FrameRow } from './animationSheet';
import { encodePng } from './png';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();
/** Image pixels per sprite pixel on the sheets. */
const CELL = 4;

const colorsFor = (look: CompanionLook = {}) => {
  const colors = companionColors(look);
  return (role: string) => colors[role];
};

/** The distinct frames of an animation (holds not repeated). */
const framesOf = (animation: CompanionAnimation, outfit: CompanionOutfit) =>
  COMPANION_ANIMATIONS[animation].map((frame) => companionFrame(frame, outfit));

const first = (animation: CompanionAnimation, outfit: CompanionOutfit) =>
  companionFrame(COMPANION_ANIMATIONS[animation][0], outfit);

/** An outfit in its key poses: content, happy (mid-hop), waiting, sad, victory. */
function posesRow(label: string, outfit: CompanionOutfit, look?: CompanionLook): FrameRow {
  return {
    label,
    frames: [
      first('content', outfit),
      framesOf('happy', outfit)[1],
      first('waiting', outfit),
      first('sad', outfit),
      first('victory', outfit),
    ],
    colorOf: colorsFor(look),
  };
}

const OUTFITS: readonly { label: string; outfit: CompanionOutfit; look?: CompanionLook }[] = [
  {
    label: 'new hero',
    outfit: { loadout: { head: 'rope_headband' }, weapon: { classId: 'recruit', upgraded: false } },
  },
  {
    label: 'apprentice',
    outfit: {
      loadout: { head: 'rope_headband', hands: 'leather_bracers', body: 'travelers_tunic' },
      weapon: { classId: 'recruit', upgraded: false },
    },
    look: { skin: 'tan', hair: 'chestnut', outfit: 'forest' },
  },
  {
    label: 'warrior',
    outfit: {
      loadout: {
        head: 'iron_helm',
        cloak: 'hooded_cloak',
        body: 'chainmail_vest',
        hands: 'leather_bracers',
        aura: 'trial_medallion',
      },
      weapon: { classId: 'warrior', upgraded: false },
    },
    look: { skin: 'porcelain', hair: 'red', outfit: 'crimson' },
  },
  {
    label: 'ranger',
    outfit: {
      loadout: { head: 'green_hood', cloak: 'warden_cloak', body: 'travelers_tunic' },
      weapon: { classId: 'ranger', upgraded: true },
    },
    look: { skin: 'brown', hair: 'black', outfit: 'forest' },
  },
  {
    label: 'paladin',
    outfit: {
      loadout: {
        head: 'crested_helm',
        cloak: 'knights_mantle',
        body: 'templar_tabard',
        hands: 'shield_emblem',
        aura: 'lightbringer_halo',
      },
      weapon: { classId: 'paladin', upgraded: true },
    },
    look: { outfit: 'azure' },
  },
  {
    label: 'sorcerer',
    outfit: {
      loadout: {
        head: 'pointed_hat',
        cloak: 'hooded_cloak',
        body: 'holy_symbol',
        aura: 'arcane_aura',
      },
      weapon: { classId: 'sorcerer', upgraded: true },
    },
    look: { skin: 'olive', hair: 'silver', outfit: 'royal' },
  },
  {
    label: 'legend',
    outfit: {
      loadout: {
        head: 'golden_crown',
        cloak: 'high_lord_cape',
        body: 'dragonscale_armour',
        hands: 'runed_gauntlets',
        aura: 'golden_aura',
      },
      weapon: { classId: 'knight', upgraded: true },
    },
    look: { skin: 'deep', hair: 'blond', outfit: 'royal' },
  },
];

const weaponRow = (classId: string): FrameRow => ({
  label: classId,
  frames: [false, true].flatMap((upgraded) => {
    const outfit: CompanionOutfit = { loadout: {}, weapon: { classId, upgraded } };
    return [first('content', outfit), framesOf('happy', outfit)[1], first('sad', outfit)];
  }),
  colorOf: colorsFor(),
});

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function write(path: string, rows: FrameRow[], cell: number) {
  const image = renderFrameSheet(rows, cell);
  const absolute = isAbsolute(path) ? path : join(ROOT, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, encodePng(image));
  console.log(`Wrote ${path} (${image.width}×${image.height}, ${rows.length} rows)`);
}

const outfitRows = (outfits: typeof OUTFITS) =>
  outfits.map((entry) => posesRow(entry.label, entry.outfit, entry.look));

const only = argument('only');
if (only !== undefined) {
  const wanted = only.split(',');
  write(
    argument('out') ?? 'companion.png',
    [
      ...ACCESSORIES.filter((item) => wanted.includes(item.id)).map((item) =>
        posesRow(item.id, { loadout: { [item.slot]: item.id } }),
      ),
      ...CLASS_WEAPONS.filter((weapon) => wanted.includes(weapon.classId)).map((weapon) =>
        weaponRow(weapon.classId),
      ),
      ...outfitRows(OUTFITS.filter((entry) => wanted.includes(entry.label))),
    ],
    Number(argument('cell') ?? CELL),
  );
} else {
  const sample = OUTFITS[2];
  write(
    'docs/screenshots/6.10-companion-moods.png',
    (['happy', 'content', 'waiting', 'sad', 'victory', 'wave'] as const).map((animation) => ({
      label: animation,
      frames: framesOf(animation, sample.outfit),
      colorOf: colorsFor(sample.look),
    })),
    CELL,
  );
  for (const slot of COMPANION_SLOTS) {
    write(
      `docs/screenshots/6.10-accessories-${slot}.png`,
      ACCESSORIES.filter((item) => item.slot === slot).map((item) =>
        posesRow(item.id, { loadout: { [slot]: item.id } }),
      ),
      CELL,
    );
  }
  write(
    'docs/screenshots/6.10-weapons.png',
    CLASS_WEAPONS.map((weapon) => weaponRow(weapon.classId)),
    CELL,
  );
  write('docs/screenshots/6.10-companion-outfits.png', outfitRows(OUTFITS), CELL);
  write(
    'docs/screenshots/6.10-companion-looks.png',
    COMPANION_TINTS.map((tint, index) => {
      const look = {
        skin: tint.id,
        hair: COMPANION_HAIRS[index % COMPANION_HAIRS.length].id,
        outfit: COMPANION_DYES[index % COMPANION_DYES.length].id,
      };
      return {
        label: `${look.skin} ${look.hair} ${look.outfit}`,
        frames: [
          first('content', { loadout: {}, weapon: { classId: 'recruit', upgraded: false } }),
        ],
        colorOf: colorsFor(look),
      };
    }),
    CELL,
  );
}
