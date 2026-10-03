import { HERO_CLASS_BY_ID, HERO_CLASSES } from '@/data/classes';
import { COMPANION_BODIES, COMPANION_MOODS, type CompanionLookChoice } from '@/domain/companion';
import { COMPANION_SLOTS } from '@/domain/types';
import { parsePixelGrid } from '@/lib/pixelGrid';

import { GROUND_Y } from './body';

import {
  ACCESSORIES,
  ACCESSORY_ART,
  BODY_SHAPES,
  companionBody,
  CLASS_WEAPONS,
  COMPANION_ANIMATIONS,
  HAIR_STYLES,
  SPRITE_SIZE,
  COMPANION_DYES,
  COMPANION_HAIRS,
  COMPANION_ROLE_CHARS,
  COMPANION_TINTS,
  companionColors,
  companionFrame,
  companionFrames,
  companionRole,
  companionStill,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  WEAPON_ART,
  weaponFor,
  type CompanionAnimation,
  type CompanionOutfit,
} from '.';

const ANIMATIONS = Object.keys(COMPANION_ANIMATIONS) as CompanionAnimation[];

/** The accessory list the user was shown (2026-10-03): id → how it is earned. */
const SPEC: Readonly<Record<string, string>> = {
  rope_headband: 'rank Novice',
  leather_bracers: 'rank Apprentice',
  iron_circlet: 'rank Adept',
  knights_mantle: 'rank Master',
  golden_crown: 'rank Legend',
  golden_aura: 'rank Legend',
  travelers_tunic: 'level 5',
  hooded_cloak: 'level 10',
  chainmail_vest: 'level 20',
  runed_gauntlets: 'level 35',
  dragonscale_armour: 'level 50',
  phoenix_cloak: 'level 75',
  trial_medallion: 'trials 1',
  ember_aura: 'streak 7',
  flame_aura: 'streak 30',
  starforged_halo: 'eliteTrial',
  veterans_scarf: 'sessions 50',
  war_banner: 'sessions 100',
  iron_helm: 'warrior 1',
  warlord_helm: 'warrior 3',
  green_hood: 'ranger 1',
  warden_cloak: 'ranger 3',
  prayer_beads: 'monk 1',
  grandmaster_robe: 'monk 3',
  fur_pelt: 'barbarian 1',
  bone_crown: 'barbarian 3',
  shadow_mask: 'rogue 1',
  nightblade_cowl: 'rogue 3',
  antler_wreath: 'druid 1',
  leaf_crown: 'druid 3',
  shield_emblem: 'paladin 1',
  lightbringer_halo: 'paladin 3',
  hachimaki: 'samurai 1',
  kabuto: 'samurai 3',
  templar_tabard: 'templar 1',
  templar_cape: 'templar 3',
  feathered_cap: 'bard 1',
  lute_emblem: 'bard 3',
  holy_symbol: 'cleric 1',
  mitre: 'cleric 3',
  crested_helm: 'knight 1',
  high_lord_cape: 'knight 3',
  war_paint: 'berserker 1',
  skull_pauldrons: 'berserker 3',
  pointed_hat: 'sorcerer 1',
  arcane_aura: 'sorcerer 3',
};

function ruleKey(rule: (typeof ACCESSORIES)[number]['rule']): string {
  switch (rule.kind) {
    case 'rank':
      return `rank ${rule.rank}`;
    case 'level':
      return `level ${rule.level}`;
    case 'class':
      return `${rule.classId} ${rule.tier}`;
    case 'eliteTrial':
      return 'eliteTrial';
    default:
      return `${rule.kind} ${rule.count}`;
  }
}

const allowed = COMPANION_ROLE_CHARS;

function expectGrid(rows: readonly string[]) {
  expect(rows).toHaveLength(SPRITE_HEIGHT);
  for (const row of rows) expect(row).toHaveLength(SPRITE_WIDTH);
  expect(() => parsePixelGrid(rows, allowed)).not.toThrow();
}

const LOOKS: readonly CompanionLookChoice[] = COMPANION_BODIES.map((body) => ({ body }));

/** Sparkle roles: the only cells allowed to float apart from the hero. */
const SPARKLES = new Set(
  ['sparkGold', 'sparkWhite', 'sparkRune', 'sparkArcane', 'sparkFire', 'sparkRed'].map((fixed) =>
    companionRole({ fixed }),
  ),
);

/**
 * No layer gaps: every painted cell except sparkles touches the rest (one 4-connected shape:
 * the hero, its gear, its outline and the ground shadow), so no part floats loose from the body.
 */
function expectOnePiece(rows: readonly string[], what: string) {
  const painted = (x: number, y: number) => rows[y]?.[x] !== undefined && rows[y][x] !== '.';
  const cells: [number, number][] = [];
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => cell !== '.' && !SPARKLES.has(cell) && cells.push([x, y])),
  );
  const seen = new Set<string>();
  const stack = [cells[0]];
  while (stack.length > 0) {
    const [x, y] = stack.pop() as [number, number];
    const key = `${x},${y}`;
    if (seen.has(key) || !painted(x, y)) continue;
    seen.add(key);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const loose = cells.filter(([x, y]) => !seen.has(`${x},${y}`));
  if (loose.length > 0) throw new Error(`${what}: loose cells at ${JSON.stringify(loose)}`);
}

/** The boots stand on the ground row and the face is on the canvas (pixel bounds). */
function expectStanding(rows: readonly string[]) {
  const boots = new Set(
    (['shadow', 'base', 'light'] as const).map((tone) =>
      companionRole({ material: 'boots', tone }),
    ),
  );
  expect([...rows[GROUND_Y]].some((cell) => boots.has(cell))).toBe(true);
  const skin = new Set(
    (['shadow', 'base', 'light'] as const).map((tone) => companionRole({ material: 'skin', tone })),
  );
  expect(rows.slice(0, GROUND_Y).some((row) => [...row].some((cell) => skin.has(cell)))).toBe(true);
}

describe('companion accessories (PLAN 6.10)', () => {
  it('is exactly the list shown to the user, with its unlock rules', () => {
    expect(Object.fromEntries(ACCESSORIES.map((item) => [item.id, ruleKey(item.rule)]))).toEqual(
      SPEC,
    );
  });

  it('has unique snake_case ids, a slot, a flavour line and art for each', () => {
    const ids = ACCESSORIES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of ACCESSORIES) {
      expect(item.id).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(COMPANION_SLOTS).toContain(item.slot);
      expect(item.flavor.length).toBeGreaterThan(5);
      expect(ACCESSORY_ART[item.id]).toBeDefined();
    }
    expect(Object.keys(ACCESSORY_ART).sort()).toEqual([...ids].sort());
  });

  it('only names classes that exist, at tiers they have', () => {
    for (const item of ACCESSORIES) {
      if (item.rule.kind !== 'class') continue;
      const heroClass = HERO_CLASS_BY_ID.get(item.rule.classId);
      expect(heroClass).toBeDefined();
      expect(item.rule.tier).toBeLessThanOrEqual(heroClass?.tiers.length ?? 0);
    }
  });

  it('draws every accessory on both bodies in every pose, in one piece, and it changes the picture', () => {
    for (const look of LOOKS) {
      for (const item of ACCESSORIES) {
        for (const animation of ANIMATIONS) {
          const outfit: CompanionOutfit = { loadout: { [item.slot]: item.id } };
          const rows = companionStill(animation, outfit, look);
          expectGrid(rows);
          expectOnePiece(rows, `${look.body} ${item.id} ${animation}`);
          expect(rows).not.toEqual(companionStill(animation, { loadout: {} }, look));
        }
      }
    }
  });
});

describe('class weapons', () => {
  it('gives every hero class a weapon with art, and upgrades it at tier III', () => {
    expect(CLASS_WEAPONS.map((weapon) => weapon.classId).sort()).toEqual(
      HERO_CLASSES.map((heroClass) => heroClass.id).sort(),
    );
    for (const weapon of CLASS_WEAPONS) expect(WEAPON_ART[weapon.classId]).toBeDefined();
    expect(weaponFor('warrior', 2)).toEqual({
      classId: 'warrior',
      name: 'Longsword',
      upgraded: false,
    });
    expect(weaponFor('warrior', 3)).toEqual({
      classId: 'warrior',
      name: 'Runeblade',
      upgraded: true,
    });
    expect(weaponFor('unknown', 1).classId).toBe('recruit');
  });

  it('draws each weapon held, raised and resting, and the upgrade looks different', () => {
    for (const weapon of CLASS_WEAPONS) {
      const base: CompanionOutfit = {
        loadout: {},
        weapon: { classId: weapon.classId, upgraded: false },
      };
      const upgraded: CompanionOutfit = {
        loadout: {},
        weapon: { classId: weapon.classId, upgraded: true },
      };
      for (const look of LOOKS) {
        for (const animation of ANIMATIONS) {
          for (const outfit of [base, upgraded]) {
            const rows = companionStill(animation, outfit, look);
            expectGrid(rows);
            expectOnePiece(rows, `${look.body} ${weapon.classId} ${animation}`);
            expect(rows).not.toEqual(companionStill(animation, { loadout: {} }, look));
          }
        }
        if (weapon.classId !== 'recruit') {
          expect(companionStill('content', upgraded, look)).not.toEqual(
            companionStill('content', base, look),
          );
        }
      }
    }
  });
});

describe('companion bodies and hair styles (PLAN 6.13)', () => {
  it('exports its size from one constant', () => {
    expect(SPRITE_SIZE).toEqual({ width: SPRITE_WIDTH, height: SPRITE_HEIGHT });
  });

  it('draws a distinct man and woman, the man by default (stored looks from before 6.13)', () => {
    expect(Object.keys(BODY_SHAPES).sort()).toEqual([...COMPANION_BODIES].sort());
    const outfit: CompanionOutfit = {
      loadout: {},
      weapon: { classId: 'warrior', upgraded: false },
    };
    expect(companionStill('content', outfit)).toEqual(
      companionStill('content', outfit, { body: 'man' }),
    );
    // Same hair style, so the body itself differs, not just the hair.
    expect(companionStill('content', outfit, { body: 'woman', hairStyle: 'spiky' })).not.toEqual(
      companionStill('content', outfit, { body: 'man', hairStyle: 'spiky' }),
    );
    expect(companionBody({ body: 'woman' }).hair.id).toBe(BODY_SHAPES.woman.defaultHair);
    expect(companionBody({ hairStyle: 'mohawk' }).hair.id).toBe(BODY_SHAPES.man.defaultHair);
  });

  it('draws every hair style on both bodies in every frame of every animation, standing on the ground', () => {
    const outfit: CompanionOutfit = { loadout: {}, weapon: { classId: 'knight', upgraded: true } };
    for (const body of COMPANION_BODIES) {
      for (const style of HAIR_STYLES) {
        const look = { body, hairStyle: style.id };
        for (const animation of ANIMATIONS) {
          for (const frame of COMPANION_ANIMATIONS[animation]) {
            const rows = companionFrame(frame, outfit, look);
            expectGrid(rows);
            expectOnePiece(rows, `${body} ${style.id} ${animation}`);
            expectStanding(rows);
          }
        }
      }
    }
    const styles = HAIR_STYLES.map((style) =>
      companionStill('content', { loadout: {} }, { hairStyle: style.id }).join('\n'),
    );
    expect(new Set(styles).size).toBe(HAIR_STYLES.length);
  });

  it('keeps the long hair and fringe under a helmet but hides the hair volume', () => {
    const helm: CompanionOutfit = { loadout: { head: 'iron_helm' } };
    const hair = companionRole({ material: 'hair', tone: 'base' });
    const count = (rows: string[]) => rows.join('').split(hair).length - 1;
    expect(
      count(companionStill('content', helm, { body: 'woman', hairStyle: 'long' })),
    ).toBeGreaterThan(
      count(companionStill('content', helm, { body: 'woman', hairStyle: 'spiky' })),
    );
  });
});

describe('companion moods and looks', () => {
  it('has a loop of at least two frames per mood, the victory pose and the wave', () => {
    for (const animation of ANIMATIONS) {
      const frames = companionFrames(animation, { loadout: {} });
      expect(new Set(frames.map((rows) => rows.join('\n'))).size).toBeGreaterThan(1);
      for (const rows of frames) expectGrid(rows);
    }
    expect(COMPANION_MOODS.every((mood) => COMPANION_ANIMATIONS[mood].length >= 2)).toBe(true);
  });

  it('outlines the sprite in a dark shade of its own colours, never pure black', () => {
    const colors = companionColors();
    expect(Object.values(colors)).not.toContain('#000000');
    const rows = companionStill('content', { loadout: {} });
    const outline = companionRole({ material: 'hair', tone: 'outline' });
    expect(rows.join('')).toContain(outline);
  });

  it('colours every role for every look, with the chosen skin, hair and outfit', () => {
    for (const tint of COMPANION_TINTS) {
      for (const hair of COMPANION_HAIRS) {
        for (const dye of COMPANION_DYES) {
          const colors = companionColors({ skin: tint.id, hair: hair.id, outfit: dye.id });
          expect(Object.keys(colors).join('')).toBe(allowed);
          expect(colors[companionRole({ material: 'skin', tone: 'base' })]).toBe(tint.ramp[2]);
          expect(colors[companionRole({ material: 'hair', tone: 'base' })]).toBe(hair.ramp[2]);
          expect(colors[companionRole({ material: 'outfit', tone: 'base' })]).toBe(dye.ramp[2]);
        }
      }
    }
    // Unknown ids draw the defaults.
    expect(
      companionColors({ skin: 'plaid' })[companionRole({ material: 'skin', tone: 'base' })],
    ).toBe(COMPANION_TINTS[0].ramp[2]);
  });
});
