/**
 * The class weapons (PLAN 6.10, user decision 2026-10-03): the companion carries the weapon of the
 * class the hero wears, so the weapon tells the class at a glance. It is not chosen in the
 * customize sheet: wearing another class changes it. Tiers I–II show the base weapon, tier III an
 * upgraded (glowing or ornate) one. The Recruit carries a wooden training sword. The pixel art is
 * in `art.ts` (`WEAPON_ART`, by class id).
 */
export interface ClassWeapon {
  classId: string;
  name: string;
  /** The tier III version's name. */
  upgradedName: string;
}

/** From this class tier on, the weapon shows its upgraded look. */
export const UPGRADED_WEAPON_TIER = 3;

export const CLASS_WEAPONS: readonly ClassWeapon[] = [
  { classId: 'recruit', name: 'Wooden training sword', upgradedName: 'Wooden training sword' },
  { classId: 'warrior', name: 'Longsword', upgradedName: 'Runeblade' },
  { classId: 'ranger', name: 'Longbow', upgradedName: 'Leafsong bow' },
  { classId: 'monk', name: 'Quarterstaff', upgradedName: 'Ember-tipped staff' },
  { classId: 'barbarian', name: 'Greataxe', upgradedName: 'Bone greataxe' },
  { classId: 'rogue', name: 'Twin daggers', upgradedName: 'Shadowfang daggers' },
  { classId: 'druid', name: 'Gnarled staff', upgradedName: 'Blossoming staff' },
  { classId: 'paladin', name: 'Warhammer', upgradedName: 'Sunforged hammer' },
  { classId: 'samurai', name: 'Katana', upgradedName: 'Moonlit katana' },
  { classId: 'templar', name: 'Mace', upgradedName: 'Golden mace' },
  { classId: 'bard', name: 'Lute', upgradedName: 'Gilded lute' },
  { classId: 'cleric', name: 'Holy mace', upgradedName: 'Radiant mace' },
  { classId: 'knight', name: 'Sword and shield', upgradedName: 'Gilded sword and shield' },
  { classId: 'berserker', name: 'Twin axes', upgradedName: 'Blood axes' },
  { classId: 'sorcerer', name: 'Wand', upgradedName: 'Starlit wand' },
];

/** The weapon of the worn class at its tier: its name and whether it shows the upgraded look. */
export function weaponFor(
  classId: string,
  tier: number,
): { classId: string; name: string; upgraded: boolean } {
  const weapon = CLASS_WEAPONS.find((entry) => entry.classId === classId) ?? CLASS_WEAPONS[0];
  const upgraded = tier >= UPGRADED_WEAPON_TIER;
  return {
    classId: weapon.classId,
    name: upgraded ? weapon.upgradedName : weapon.name,
    upgraded,
  };
}
