/**
 * CLI behind `npm run companion:sheet` (runs via tsx, PLAN 6.10 / 6.13, ADR-059 / ADR-061):
 * contact sheets of the companion sprite for review, for both bodies: every animation (moods,
 * victory, salute) for a few outfits, every accessory in four poses (per slot), every class weapon
 * (base and tier III), the colour looks and the hair styles. Writes docs/screenshots/6.13-*.png;
 * commit the results.
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
  HAIR_STYLES,
  type CompanionAnimation,
  type CompanionLook,
  type CompanionOutfit,
} from '@/data/companion';
import { COMPANION_BODIES } from '@/domain/companion';
import { COMPANION_SLOTS } from '@/domain/types';

import { renderFrameSheet, type FrameRow } from './animationSheet';
import { encodePng } from './png';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();
/** Image pixels per sprite pixel on the sheets. */
const CELL = 4;
const PREFIX = 'docs/screenshots/6.13';

const colorsFor = (look: CompanionLook = {}) => {
  const colors = companionColors(look);
  return (role: string) => colors[role];
};

/** The distinct frames of an animation (holds not repeated). */
const framesOf = (animation: CompanionAnimation, outfit: CompanionOutfit, look?: CompanionLook) =>
  COMPANION_ANIMATIONS[animation].map((frame) => companionFrame(frame, outfit, look));

const first = (animation: CompanionAnimation, outfit: CompanionOutfit, look?: CompanionLook) =>
  companionFrame(COMPANION_ANIMATIONS[animation][0], outfit, look);

/** An outfit in its key poses: content, happy (raised), waiting, sad, victory, salute. */
function posesRow(label: string, outfit: CompanionOutfit, look: CompanionLook = {}): FrameRow {
  return {
    label,
    frames: [
      first('content', outfit, look),
      framesOf('happy', outfit, look)[1],
      first('waiting', outfit, look),
      first('sad', outfit, look),
      first('victory', outfit, look),
      first('wave', outfit, look),
    ],
    colorOf: colorsFor(look),
  };
}

/** Four poses for the man, then the same four for the woman. */
function bothBodiesRow(label: string, outfit: CompanionOutfit, look: CompanionLook = {}): FrameRow {
  const poses = (body: (typeof COMPANION_BODIES)[number]) => {
    const withBody = { ...look, body };
    return [
      first('content', outfit, withBody),
      framesOf('happy', outfit, withBody)[1],
      first('waiting', outfit, withBody),
      first('sad', outfit, withBody),
    ];
  };
  return { label, frames: [...poses('man'), ...poses('woman')], colorOf: colorsFor(look) };
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
    look: { skin: 'tan', hair: 'chestnut', outfit: 'forest', hairStyle: 'ponytail' },
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

const weaponRow = (classId: string): FrameRow => {
  const base: CompanionOutfit = { loadout: {}, weapon: { classId, upgraded: false } };
  const upgraded: CompanionOutfit = { loadout: {}, weapon: { classId, upgraded: true } };
  const woman: CompanionLook = { body: 'woman' };
  return {
    label: classId,
    frames: [
      first('content', base),
      framesOf('happy', base)[1],
      first('waiting', base),
      first('sad', base),
      first('content', upgraded, woman),
      framesOf('happy', upgraded, woman)[1],
      first('wave', upgraded, woman),
      first('sad', upgraded, woman),
    ],
    colorOf: colorsFor(),
  };
};

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

/** Every outfit for the man, then for the woman. */
const outfitRows = (outfits: typeof OUTFITS) =>
  outfits.flatMap((entry) =>
    COMPANION_BODIES.map((body) =>
      posesRow(`${entry.label} ${body}`, entry.outfit, { ...entry.look, body }),
    ),
  );

const only = argument('only');
if (only !== undefined) {
  const wanted = only.split(',');
  write(
    argument('out') ?? 'companion.png',
    [
      ...ACCESSORIES.filter((item) => wanted.includes(item.id)).map((item) =>
        bothBodiesRow(item.id, { loadout: { [item.slot]: item.id } }),
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
    `${PREFIX}-companion-moods.png`,
    COMPANION_BODIES.flatMap((body) =>
      (['happy', 'content', 'waiting', 'sad', 'victory', 'wave'] as const).map((animation) => ({
        label: `${animation} ${body}`,
        frames: framesOf(animation, sample.outfit, { ...sample.look, body }),
        colorOf: colorsFor(sample.look),
      })),
    ),
    CELL,
  );
  for (const slot of COMPANION_SLOTS) {
    write(
      `${PREFIX}-accessories-${slot}.png`,
      ACCESSORIES.filter((item) => item.slot === slot).map((item) =>
        bothBodiesRow(item.id, { loadout: { [slot]: item.id } }),
      ),
      CELL,
    );
  }
  write(
    `${PREFIX}-weapons.png`,
    CLASS_WEAPONS.map((weapon) => weaponRow(weapon.classId)),
    CELL,
  );
  write(`${PREFIX}-companion-outfits.png`, outfitRows(OUTFITS), CELL);
  const recruit: CompanionOutfit = { loadout: {}, weapon: { classId: 'recruit', upgraded: false } };
  write(
    `${PREFIX}-companion-looks.png`,
    [
      ...COMPANION_TINTS.map((tint, index) => {
        const look = {
          skin: tint.id,
          hair: COMPANION_HAIRS[index % COMPANION_HAIRS.length].id,
          outfit: COMPANION_DYES[index % COMPANION_DYES.length].id,
        };
        return {
          label: `${look.skin} ${look.hair} ${look.outfit}`,
          frames: COMPANION_BODIES.flatMap((body) =>
            HAIR_STYLES.map((style) =>
              first('content', recruit, { ...look, body, hairStyle: style.id }),
            ),
          ),
          colorOf: colorsFor(look),
        };
      }),
    ],
    CELL,
  );
}
