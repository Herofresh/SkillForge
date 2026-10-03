import { HERO_CLASS_BY_ID, HERO_CLASSES } from '@/data/classes';
import { COMPANION_MOODS } from '@/domain/companion';
import { COMPANION_SLOTS } from '@/domain/types';
import { parsePixelGrid } from '@/lib/pixelGrid';

import {
  ACCESSORIES,
  ACCESSORY_ART,
  CLASS_WEAPONS,
  COMPANION_ANIMATIONS,
  COMPANION_DYES,
  COMPANION_HAIRS,
  COMPANION_ROLE_CHARS,
  COMPANION_TINTS,
  companionColors,
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

  it('draws every accessory in every pose with known roles, and it changes the picture', () => {
    for (const item of ACCESSORIES) {
      for (const animation of ANIMATIONS) {
        const outfit: CompanionOutfit = { loadout: { [item.slot]: item.id } };
        const rows = companionStill(animation, outfit);
        expectGrid(rows);
        expect(rows).not.toEqual(companionStill(animation, { loadout: {} }));
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
      for (const mood of COMPANION_MOODS) {
        const rows = companionStill(mood, base);
        expectGrid(rows);
        expect(rows).not.toEqual(companionStill(mood, { loadout: {} }));
      }
      if (weapon.classId !== 'recruit') {
        expect(companionStill('content', upgraded)).not.toEqual(companionStill('content', base));
      }
    }
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
