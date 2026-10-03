/**
 * The companion's accessories (PLAN 6.10, ADR-059): one source of truth, as typed data. Each one
 * has a slot, a flavour line and a flat unlock rule over values that only grow with training
 * (rank, character level, class tiers, sessions, best streak, Trials), so once earned it stays
 * earned; the store keeps the unlocks forever anyway. Cosmetic only.
 *
 * The list is the one shown to the user (2026-10-03): rank gear, level gear, milestones, and one
 * item for tier I and one for tier III of every class. Within a slot the order runs from humble
 * to grand: a slot the hero never picked for shows the last earned item in this order.
 *
 * Ids are snake_case and stable forever. The pixel art for each id is in `art.ts`.
 */
import type { AccessoryDefinition } from '@/domain/types';

export interface Accessory extends AccessoryDefinition {
  /** One short line of flavour for the customize sheet. */
  flavor: string;
}

const classItem = (classId: string, tier: number) => ({ kind: 'class' as const, classId, tier });

export const ACCESSORIES: readonly Accessory[] = [
  // Head
  {
    id: 'rope_headband',
    name: 'Rope headband',
    slot: 'head',
    rule: { kind: 'rank', rank: 'Novice' },
    flavor: 'Keeps the sweat out of a novice’s eyes.',
  },
  {
    id: 'iron_circlet',
    name: 'Iron circlet',
    slot: 'head',
    rule: { kind: 'rank', rank: 'Adept' },
    flavor: 'A plain band with one rune-stone: the mark of an adept.',
  },
  {
    id: 'iron_helm',
    name: 'Iron helm',
    slot: 'head',
    rule: classItem('warrior', 1),
    flavor: 'Dented, honest steel for a Warrior.',
  },
  {
    id: 'green_hood',
    name: 'Green hood',
    slot: 'head',
    rule: classItem('ranger', 1),
    flavor: 'A Ranger’s hood, the colour of the canopy.',
  },
  {
    id: 'shadow_mask',
    name: 'Shadow mask',
    slot: 'head',
    rule: classItem('rogue', 1),
    flavor: 'Nobody saw who did that handstand.',
  },
  {
    id: 'antler_wreath',
    name: 'Antler wreath',
    slot: 'head',
    rule: classItem('druid', 1),
    flavor: 'Shed antlers bound with ivy: a Druid’s crown.',
  },
  {
    id: 'hachimaki',
    name: 'Hachimaki',
    slot: 'head',
    rule: classItem('samurai', 1),
    flavor: 'A headband tied tight before the hardest hold.',
  },
  {
    id: 'feathered_cap',
    name: 'Feathered cap',
    slot: 'head',
    rule: classItem('bard', 1),
    flavor: 'A Bard’s cap with a plume worth a ballad.',
  },
  {
    id: 'crested_helm',
    name: 'Crested helm',
    slot: 'head',
    rule: classItem('knight', 1),
    flavor: 'A closed helm with a plume in your colours.',
  },
  {
    id: 'pointed_hat',
    name: 'Pointed hat',
    slot: 'head',
    rule: classItem('sorcerer', 1),
    flavor: 'Every Sorcerer needs one. The stars are optional.',
  },
  {
    id: 'warlord_helm',
    name: 'Horned warlord helm',
    slot: 'head',
    rule: classItem('warrior', 3),
    flavor: 'Blackened steel and two great horns: the helm of a Warlord.',
  },
  {
    id: 'bone_crown',
    name: 'Bone crown',
    slot: 'head',
    rule: classItem('barbarian', 3),
    flavor: 'Fangs of the beasts a Chieftain outlasted.',
  },
  {
    id: 'nightblade_cowl',
    name: 'Nightblade cowl',
    slot: 'head',
    rule: classItem('rogue', 3),
    flavor: 'Only the glint of one eye gives a Nightblade away.',
  },
  {
    id: 'leaf_crown',
    name: 'Living crown of leaves',
    slot: 'head',
    rule: classItem('druid', 3),
    flavor: 'It still grows, and blooms after every session.',
  },
  {
    id: 'kabuto',
    name: 'Kabuto helm',
    slot: 'head',
    rule: classItem('samurai', 3),
    flavor: 'Lacquered red with a golden crest, fit for a Shogun.',
  },
  {
    id: 'mitre',
    name: 'Mitre',
    slot: 'head',
    rule: classItem('cleric', 3),
    flavor: 'The tall hat of a High Priest, stitched with gold.',
  },
  {
    id: 'golden_crown',
    name: 'Golden crown',
    slot: 'head',
    rule: { kind: 'rank', rank: 'Legend' },
    flavor: 'Three points, two runes and a ruby. Only a Legend wears it.',
  },

  // Cloak and back
  {
    id: 'hooded_cloak',
    name: 'Hooded cloak',
    slot: 'cloak',
    rule: { kind: 'level', level: 10 },
    flavor: 'Wool against the wind on the road to the bar.',
  },
  {
    id: 'fur_pelt',
    name: 'Fur pelt',
    slot: 'cloak',
    rule: classItem('barbarian', 1),
    flavor: 'A Barbarian’s pelt, warm and a little smelly.',
  },
  {
    id: 'veterans_scarf',
    name: 'Veteran’s scarf',
    slot: 'cloak',
    rule: { kind: 'sessions', count: 50 },
    flavor: 'Fifty sessions in, it flies behind you like a flag.',
  },
  {
    id: 'knights_mantle',
    name: 'Knight’s mantle',
    slot: 'cloak',
    rule: { kind: 'rank', rank: 'Master' },
    flavor: 'Gold-hemmed and fastened with a golden collar: a Master’s mantle.',
  },
  {
    id: 'warden_cloak',
    name: 'Leaf-woven warden cloak',
    slot: 'cloak',
    rule: classItem('ranger', 3),
    flavor: 'Woven from living leaves; a Warden vanishes into any wood.',
  },
  {
    id: 'templar_cape',
    name: 'Grand templar cape',
    slot: 'cloak',
    rule: classItem('templar', 3),
    flavor: 'White wool and a red cross, carried by a Grand Templar.',
  },
  {
    id: 'high_lord_cape',
    name: 'High lord cape',
    slot: 'cloak',
    rule: classItem('knight', 3),
    flavor: 'Long, heavy and trimmed with ermine: a High Lord’s cape.',
  },
  {
    id: 'phoenix_cloak',
    name: 'Phoenix cloak',
    slot: 'cloak',
    rule: { kind: 'level', level: 75 },
    flavor: 'Its hem burns and never burns out.',
  },

  // Body
  {
    id: 'travelers_tunic',
    name: 'Traveler’s tunic',
    slot: 'body',
    rule: { kind: 'level', level: 5 },
    flavor: 'Sturdy cloth and a belt with a brass buckle.',
  },
  {
    id: 'prayer_beads',
    name: 'Prayer beads',
    slot: 'body',
    rule: classItem('monk', 1),
    flavor: 'One bead per breath in a long hollow hold.',
  },
  {
    id: 'holy_symbol',
    name: 'Holy symbol',
    slot: 'body',
    rule: classItem('cleric', 1),
    flavor: 'A golden sun on a chain, warm to the touch.',
  },
  {
    id: 'templar_tabard',
    name: 'Templar tabard',
    slot: 'body',
    rule: classItem('templar', 1),
    flavor: 'The red cross of the Templars over a white tabard.',
  },
  {
    id: 'chainmail_vest',
    name: 'Chainmail vest',
    slot: 'body',
    rule: { kind: 'level', level: 20 },
    flavor: 'Ten thousand rings, each one a rep.',
  },
  {
    id: 'grandmaster_robe',
    name: 'Grandmaster robe',
    slot: 'body',
    rule: classItem('monk', 3),
    flavor: 'Saffron robes of a Grandmaster of the hollow body.',
  },
  {
    id: 'dragonscale_armour',
    name: 'Dragonscale armour',
    slot: 'body',
    rule: { kind: 'level', level: 50 },
    flavor: 'Green scales and a golden belt. Nobody asks where it came from.',
  },

  // Hands and arms
  {
    id: 'leather_bracers',
    name: 'Leather bracers',
    slot: 'hands',
    rule: { kind: 'rank', rank: 'Apprentice' },
    flavor: 'Laced forearm guards for an apprentice’s first holds.',
  },
  {
    id: 'shield_emblem',
    name: 'Paladin shield',
    slot: 'hands',
    rule: classItem('paladin', 1),
    flavor: 'A heater shield with the Paladin’s golden sun.',
  },
  {
    id: 'runed_gauntlets',
    name: 'Runed gauntlets',
    slot: 'hands',
    rule: { kind: 'level', level: 35 },
    flavor: 'Iron gauntlets with runes that glow under load.',
  },
  {
    id: 'skull_pauldrons',
    name: 'Skull pauldrons',
    slot: 'hands',
    rule: classItem('berserker', 3),
    flavor: 'Shoulder guards that grin. A Warchief’s trophy.',
  },

  // Aura and emblem
  {
    id: 'trial_medallion',
    name: 'Trial medallion',
    slot: 'aura',
    rule: { kind: 'trials', count: 1 },
    flavor: 'Struck for your first passed Trial.',
  },
  {
    id: 'war_paint',
    name: 'War paint',
    slot: 'aura',
    rule: classItem('berserker', 1),
    flavor: 'Red stripes for a Berserker who never skips a session.',
  },
  {
    id: 'ember_aura',
    name: 'Ember aura',
    slot: 'aura',
    rule: { kind: 'streak', count: 7 },
    flavor: 'A seven-session streak leaves you smouldering.',
  },
  {
    id: 'lute_emblem',
    name: 'Lute',
    slot: 'aura',
    rule: classItem('bard', 3),
    flavor: 'A Virtuoso carries the song of every session on their back.',
  },
  {
    id: 'war_banner',
    name: 'War banner',
    slot: 'aura',
    rule: { kind: 'sessions', count: 100 },
    flavor: 'A hundred sessions: raise your banner.',
  },
  {
    id: 'lightbringer_halo',
    name: 'Lightbringer halo',
    slot: 'aura',
    rule: classItem('paladin', 3),
    flavor: 'A Lightbringer shines a little brighter than the rest.',
  },
  {
    id: 'arcane_aura',
    name: 'Arcane aura',
    slot: 'aura',
    rule: classItem('sorcerer', 3),
    flavor: 'Violet sparks that answer to an Ascendant.',
  },
  {
    id: 'flame_aura',
    name: 'Flame aura',
    slot: 'aura',
    rule: { kind: 'streak', count: 30 },
    flavor: 'Thirty sessions in a row: you are on fire.',
  },
  {
    id: 'starforged_halo',
    name: 'Star-forged halo',
    slot: 'aura',
    rule: { kind: 'eliteTrial' },
    flavor: 'Forged when you passed the Trial of a legendary skill.',
  },
  {
    id: 'golden_aura',
    name: 'Golden aura',
    slot: 'aura',
    rule: { kind: 'rank', rank: 'Legend' },
    flavor: 'The light of a Legend.',
  },
];

export const ACCESSORY_BY_ID: ReadonlyMap<string, Accessory> = new Map(
  ACCESSORIES.map((accessory) => [accessory.id, accessory]),
);
