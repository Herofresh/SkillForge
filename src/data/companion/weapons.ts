/**
 * The class weapons (PLAN 6.10, user decision 2026-10-03): the companion carries the weapon of the
 * class the hero wears, so the weapon tells the class at a glance. It is not chosen in the
 * customize sheet: wearing another class changes it. Tiers I–II show the base weapon, tier III an
 * upgraded (glowing or ornate) one. The Recruit carries a wooden training sword. The pixel art is
 * in `art.ts` (`WEAPON_ART`, by class id).
 */
import { k } from '@/i18n';

export interface ClassWeapon {
  classId: string;
  name: string;
  /** The tier III version's name. */
  upgradedName: string;
}

/** From this class tier on, the weapon shows its upgraded look. */
export const UPGRADED_WEAPON_TIER = 3;

export const CLASS_WEAPONS: readonly ClassWeapon[] = [
  {
    classId: 'recruit',
    name: k('Wooden training sword'),
    upgradedName: k('Wooden training sword'),
  },
  { classId: 'warrior', name: k('Longsword'), upgradedName: k('Runeblade') },
  { classId: 'ranger', name: k('Longbow'), upgradedName: k('Leafsong bow') },
  { classId: 'monk', name: k('Quarterstaff'), upgradedName: k('Ember-tipped staff') },
  { classId: 'barbarian', name: k('Greataxe'), upgradedName: k('Bone greataxe') },
  { classId: 'rogue', name: k('Twin daggers'), upgradedName: k('Shadowfang daggers') },
  { classId: 'druid', name: k('Gnarled staff'), upgradedName: k('Blossoming staff') },
  { classId: 'paladin', name: k('Warhammer'), upgradedName: k('Sunforged hammer') },
  { classId: 'samurai', name: k('Katana'), upgradedName: k('Moonlit katana') },
  { classId: 'templar', name: k('Mace'), upgradedName: k('Golden mace') },
  { classId: 'bard', name: k('Lute'), upgradedName: k('Gilded lute') },
  { classId: 'cleric', name: k('Holy mace'), upgradedName: k('Radiant mace') },
  { classId: 'knight', name: k('Sword and shield'), upgradedName: k('Gilded sword and shield') },
  { classId: 'berserker', name: k('Twin axes'), upgradedName: k('Blood axes') },
  { classId: 'sorcerer', name: k('Wand'), upgradedName: k('Starlit wand') },
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
