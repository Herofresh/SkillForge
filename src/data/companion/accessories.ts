/**
 * The companion's accessories (PLAN 6.10, ADR-059): one source of truth, as typed data. Each one
 * has a slot, a flavour line and a flat unlock rule over values that only grow with training
 * (rank, character level, class tiers, sessions, best streak, Trials), so once earned it stays
 * earned; the store keeps the unlocks forever anyway. Cosmetic only.
 *
 * The list is the one shown to the user (2026-10-03): rank gear, level gear, milestones, and one
 * item for tier I and one for tier III of every class; 14 milestone items were added on the
 * user's OK (2026-10-30, FB-14, ADR-079) to fill the gaps between the early items and 50 sessions. Within a slot the order runs from humble
 * to grand: a slot the hero never picked for shows the last earned item in this order.
 *
 * Ids are snake_case and stable forever. The pixel art for each id is in `art.ts`.
 */
import type { AccessoryDefinition } from '@/domain/types';
import { k } from '@/i18n';

export interface Accessory extends AccessoryDefinition {
  /** One short line of flavour for the customize sheet. */
  flavor: string;
}

const classItem = (classId: string, tier: number) => ({ kind: 'class' as const, classId, tier });

export const ACCESSORIES: readonly Accessory[] = [
  // Head
  {
    id: 'rope_headband',
    name: k('Rope headband'),
    slot: 'head',
    rule: { kind: 'rank', rank: 'Novice' },
    flavor: k('Keeps the sweat out of a novice’s eyes.'),
  },
  {
    id: 'wool_cap',
    name: k('Wool cap'),
    slot: 'head',
    rule: { kind: 'sessions', count: 5 },
    flavor: k('Five sessions in: a cap for the walk to the bar.'),
  },
  {
    id: 'iron_circlet',
    name: k('Iron circlet'),
    slot: 'head',
    rule: { kind: 'rank', rank: 'Adept' },
    flavor: k('A plain band with one rune-stone: the mark of an adept.'),
  },
  {
    id: 'laurel_wreath',
    name: k('Laurel wreath'),
    slot: 'head',
    rule: { kind: 'trials', count: 5 },
    flavor: k('Five Trials passed: the old sign of a champion.'),
  },
  {
    id: 'iron_helm',
    name: k('Iron helm'),
    slot: 'head',
    rule: classItem('warrior', 1),
    flavor: k('Dented, honest steel for a Warrior.'),
  },
  {
    id: 'green_hood',
    name: k('Green hood'),
    slot: 'head',
    rule: classItem('ranger', 1),
    flavor: k('A Ranger’s hood, the colour of the canopy.'),
  },
  {
    id: 'shadow_mask',
    name: k('Shadow mask'),
    slot: 'head',
    rule: classItem('rogue', 1),
    flavor: k('Nobody saw who did that handstand.'),
  },
  {
    id: 'antler_wreath',
    name: k('Antler wreath'),
    slot: 'head',
    rule: classItem('druid', 1),
    flavor: k('Shed antlers bound with ivy: a Druid’s crown.'),
  },
  {
    id: 'hachimaki',
    name: k('Hachimaki'),
    slot: 'head',
    rule: classItem('samurai', 1),
    flavor: k('A headband tied tight before the hardest hold.'),
  },
  {
    id: 'feathered_cap',
    name: k('Feathered cap'),
    slot: 'head',
    rule: classItem('bard', 1),
    flavor: k('A Bard’s cap with a plume worth a ballad.'),
  },
  {
    id: 'crested_helm',
    name: k('Crested helm'),
    slot: 'head',
    rule: classItem('knight', 1),
    flavor: k('A closed helm with a plume in your colours.'),
  },
  {
    id: 'pointed_hat',
    name: k('Pointed hat'),
    slot: 'head',
    rule: classItem('sorcerer', 1),
    flavor: k('Every Sorcerer needs one. The stars are optional.'),
  },
  {
    id: 'star_circlet',
    name: k('Star circlet'),
    slot: 'head',
    rule: { kind: 'level', level: 30 },
    flavor: k('An iron band with one golden star for level 30.'),
  },
  {
    id: 'warlord_helm',
    name: k('Horned warlord helm'),
    slot: 'head',
    rule: classItem('warrior', 3),
    flavor: k('Blackened steel and two great horns: the helm of a Warlord.'),
  },
  {
    id: 'bone_crown',
    name: k('Bone crown'),
    slot: 'head',
    rule: classItem('barbarian', 3),
    flavor: k('Fangs of the beasts a Chieftain outlasted.'),
  },
  {
    id: 'nightblade_cowl',
    name: k('Nightblade cowl'),
    slot: 'head',
    rule: classItem('rogue', 3),
    flavor: k('Only the glint of one eye gives a Nightblade away.'),
  },
  {
    id: 'leaf_crown',
    name: k('Living crown of leaves'),
    slot: 'head',
    rule: classItem('druid', 3),
    flavor: k('It still grows, and blooms after every session.'),
  },
  {
    id: 'kabuto',
    name: k('Kabuto helm'),
    slot: 'head',
    rule: classItem('samurai', 3),
    flavor: k('Lacquered red with a golden crest, fit for a Shogun.'),
  },
  {
    id: 'mitre',
    name: k('Mitre'),
    slot: 'head',
    rule: classItem('cleric', 3),
    flavor: k('The tall hat of a High Priest, stitched with gold.'),
  },
  {
    id: 'golden_crown',
    name: k('Golden crown'),
    slot: 'head',
    rule: { kind: 'rank', rank: 'Legend' },
    flavor: k('Three points, two runes and a ruby. Only a Legend wears it.'),
  },

  // Cloak and back
  {
    id: 'travel_scarf',
    name: k('Travel scarf'),
    slot: 'cloak',
    rule: { kind: 'sessions', count: 10 },
    flavor: k('Ten sessions: a red scarf against the morning wind.'),
  },
  {
    id: 'hooded_cloak',
    name: k('Hooded cloak'),
    slot: 'cloak',
    rule: { kind: 'level', level: 10 },
    flavor: k('Wool against the wind on the road to the bar.'),
  },
  {
    id: 'fur_pelt',
    name: k('Fur pelt'),
    slot: 'cloak',
    rule: classItem('barbarian', 1),
    flavor: k('A Barbarian’s pelt, warm and a little smelly.'),
  },
  {
    id: 'storm_cloak',
    name: k('Storm cloak'),
    slot: 'cloak',
    rule: { kind: 'streak', count: 14 },
    flavor: k('Two weeks without a miss: the night-blue cloak of a storm chaser.'),
  },
  {
    id: 'veterans_scarf',
    name: k('Veteran’s scarf'),
    slot: 'cloak',
    rule: { kind: 'sessions', count: 50 },
    flavor: k('Fifty sessions in, it flies behind you like a flag.'),
  },
  {
    id: 'knights_mantle',
    name: k('Knight’s mantle'),
    slot: 'cloak',
    rule: { kind: 'rank', rank: 'Master' },
    flavor: k('Gold-hemmed and fastened with a golden collar: a Master’s mantle.'),
  },
  {
    id: 'warden_cloak',
    name: k('Leaf-woven warden cloak'),
    slot: 'cloak',
    rule: classItem('ranger', 3),
    flavor: k('Woven from living leaves; a Warden vanishes into any wood.'),
  },
  {
    id: 'templar_cape',
    name: k('Grand templar cape'),
    slot: 'cloak',
    rule: classItem('templar', 3),
    flavor: k('White wool and a red cross, carried by a Grand Templar.'),
  },
  {
    id: 'high_lord_cape',
    name: k('High lord cape'),
    slot: 'cloak',
    rule: classItem('knight', 3),
    flavor: k('Long, heavy and trimmed with ermine: a High Lord’s cape.'),
  },
  {
    id: 'champions_cape',
    name: k('Champion’s cape'),
    slot: 'cloak',
    rule: { kind: 'sessions', count: 200 },
    flavor: k('Two hundred sessions: orchid silk with a golden hem.'),
  },
  {
    id: 'phoenix_cloak',
    name: k('Phoenix cloak'),
    slot: 'cloak',
    rule: { kind: 'level', level: 75 },
    flavor: k('Its hem burns and never burns out.'),
  },

  // Body
  {
    id: 'travelers_tunic',
    name: k('Traveler’s tunic'),
    slot: 'body',
    rule: { kind: 'level', level: 5 },
    flavor: k('Sturdy cloth and a belt with a brass buckle.'),
  },
  {
    id: 'iron_pendant',
    name: k('Iron pendant'),
    slot: 'body',
    rule: { kind: 'trials', count: 3 },
    flavor: k('A plain iron disc on a cord, one notch per Trial.'),
  },
  {
    id: 'prayer_beads',
    name: k('Prayer beads'),
    slot: 'body',
    rule: classItem('monk', 1),
    flavor: k('One bead per breath in a long hollow hold.'),
  },
  {
    id: 'holy_symbol',
    name: k('Holy symbol'),
    slot: 'body',
    rule: classItem('cleric', 1),
    flavor: k('A golden sun on a chain, warm to the touch.'),
  },
  {
    id: 'templar_tabard',
    name: k('Templar tabard'),
    slot: 'body',
    rule: classItem('templar', 1),
    flavor: k('The red cross of the Templars over a white tabard.'),
  },
  {
    id: 'studded_belt',
    name: k('Studded belt'),
    slot: 'body',
    rule: { kind: 'level', level: 15 },
    flavor: k('Iron studs on a wide belt for level 15.'),
  },
  {
    id: 'chainmail_vest',
    name: k('Chainmail vest'),
    slot: 'body',
    rule: { kind: 'level', level: 20 },
    flavor: k('Ten thousand rings, each one a rep.'),
  },
  {
    id: 'fur_vest',
    name: k('Fur-lined vest'),
    slot: 'body',
    rule: { kind: 'sessions', count: 30 },
    flavor: k('Thirty sessions: warm enough for a winter park.'),
  },
  {
    id: 'grandmaster_robe',
    name: k('Grandmaster robe'),
    slot: 'body',
    rule: classItem('monk', 3),
    flavor: k('Saffron robes of a Grandmaster of the hollow body.'),
  },
  {
    id: 'dragonscale_armour',
    name: k('Dragonscale armour'),
    slot: 'body',
    rule: { kind: 'level', level: 50 },
    flavor: k('Green scales and a golden belt. Nobody asks where it came from.'),
  },

  // Hands and arms
  {
    id: 'chalk_hands',
    name: k('Chalked hands'),
    slot: 'hands',
    rule: { kind: 'streak', count: 3 },
    flavor: k('Three sessions in a row: time to chalk up.'),
  },
  {
    id: 'leather_bracers',
    name: k('Leather bracers'),
    slot: 'hands',
    rule: { kind: 'rank', rank: 'Apprentice' },
    flavor: k('Laced forearm guards for an apprentice’s first holds.'),
  },
  {
    id: 'shield_emblem',
    name: k('Paladin shield'),
    slot: 'hands',
    rule: classItem('paladin', 1),
    flavor: k('A heater shield with the Paladin’s golden sun.'),
  },
  {
    id: 'iron_bracers',
    name: k('Iron bracers'),
    slot: 'hands',
    rule: { kind: 'sessions', count: 25 },
    flavor: k('Twenty-five sessions: forearm guards of plain iron.'),
  },
  {
    id: 'runed_gauntlets',
    name: k('Runed gauntlets'),
    slot: 'hands',
    rule: { kind: 'level', level: 35 },
    flavor: k('Iron gauntlets with runes that glow under load.'),
  },
  {
    id: 'golden_gauntlets',
    name: k('Golden gauntlets'),
    slot: 'hands',
    rule: { kind: 'trials', count: 10 },
    flavor: k('Ten Trials passed: gauntlets that catch the light.'),
  },
  {
    id: 'skull_pauldrons',
    name: k('Skull pauldrons'),
    slot: 'hands',
    rule: classItem('berserker', 3),
    flavor: k('Shoulder guards that grin. A Warchief’s trophy.'),
  },

  // Aura and emblem
  {
    id: 'trial_medallion',
    name: k('Trial medallion'),
    slot: 'aura',
    rule: { kind: 'trials', count: 1 },
    flavor: k('Struck for your first passed Trial.'),
  },
  {
    id: 'spark_aura',
    name: k('Spark aura'),
    slot: 'aura',
    rule: { kind: 'sessions', count: 15 },
    flavor: k('Fifteen sessions: the first sparks fly.'),
  },
  {
    id: 'war_paint',
    name: k('War paint'),
    slot: 'aura',
    rule: classItem('berserker', 1),
    flavor: k('Red stripes for a Berserker who never skips a session.'),
  },
  {
    id: 'ember_aura',
    name: k('Ember aura'),
    slot: 'aura',
    rule: { kind: 'streak', count: 7 },
    flavor: k('A seven-session streak leaves you smouldering.'),
  },
  {
    id: 'lute_emblem',
    name: k('Lute'),
    slot: 'aura',
    rule: classItem('bard', 3),
    flavor: k('A Virtuoso carries the song of every session on their back.'),
  },
  {
    id: 'war_banner',
    name: k('War banner'),
    slot: 'aura',
    rule: { kind: 'sessions', count: 100 },
    flavor: k('A hundred sessions: raise your banner.'),
  },
  {
    id: 'lightbringer_halo',
    name: k('Lightbringer halo'),
    slot: 'aura',
    rule: classItem('paladin', 3),
    flavor: k('A Lightbringer shines a little brighter than the rest.'),
  },
  {
    id: 'arcane_aura',
    name: k('Arcane aura'),
    slot: 'aura',
    rule: classItem('sorcerer', 3),
    flavor: k('Violet sparks that answer to an Ascendant.'),
  },
  {
    id: 'flame_aura',
    name: k('Flame aura'),
    slot: 'aura',
    rule: { kind: 'streak', count: 30 },
    flavor: k('Thirty sessions in a row: you are on fire.'),
  },
  {
    id: 'blaze_aura',
    name: k('Blaze aura'),
    slot: 'aura',
    rule: { kind: 'streak', count: 60 },
    flavor: k('Sixty sessions in a row. You are the fire now.'),
  },
  {
    id: 'starforged_halo',
    name: k('Star-forged halo'),
    slot: 'aura',
    rule: { kind: 'eliteTrial' },
    flavor: k('Forged when you passed the Trial of a legendary skill.'),
  },
  {
    id: 'golden_aura',
    name: k('Golden aura'),
    slot: 'aura',
    rule: { kind: 'rank', rank: 'Legend' },
    flavor: k('The light of a Legend.'),
  },
];

export const ACCESSORY_BY_ID: ReadonlyMap<string, Accessory> = new Map(
  ACCESSORIES.map((accessory) => [accessory.id, accessory]),
);
