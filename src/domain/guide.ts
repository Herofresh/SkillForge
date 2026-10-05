/**
 * "How SkillForge works" (PLAN 6.10c, ADR-060): one plain-language entry per game system, for the
 * "i" buttons where each system appears and the guide screen in Settings. Pure.
 *
 * No number is written into the text by hand. `guideFacts()` collects every number the text uses
 * from the module that owns it (XP, levels, safeguards, ranks, classes, the companion, the
 * generator, the widget), and `buildGuide(facts)` only formats them. So the guide can never drift
 * from the rules: change a constant and the text follows. `guide.test.ts` builds the guide with
 * every fact changed and fails if any number in the text stays the same (a hand-written one).
 *
 * Optional reading: nothing in the app opens the guide on its own (ADR-023 spirit).
 */
import { HERO_CLASSES, STARTING_CLASS_ID } from '@/data/classes';
import { ACCESSORIES } from '@/data/companion/accessories';
import { CLASS_WEAPONS, UPGRADED_WEAPON_TIER } from '@/data/companion/weapons';
import { DATA_STORAGE_NOTE, HEALTH_DISCLAIMER } from '@/data/notices';
import { BRANCH_NAMES } from '@/data/skills/branches';
import { MS_PER_HOUR } from '@/lib/time';

import {
  CHARACTER_MAX_LEVEL,
  CHARACTER_XP_BASE,
  CHARACTER_XP_GROWTH,
  NON_RANK_BRANCHES,
  PUSH_PULL_MAX_GAP,
  RANK_BRANCHES,
  RANK_MIN_MEDIAN_OG_LEVEL,
} from './character';
import { tierNumeral } from './classes';
import { CONTENT_MAX_DAYS, MOOD_TITLES, WAITING_MAX_DAYS } from './companion';
import { MAX_WORKING_SETS, PATTERN_REST_HOURS, RECOVERY_EXEMPT_PATTERNS } from './generator';
import { MAX_GOALS } from './onboarding';
import { MAX_NODE_LEVEL, PROFICIENT_LEVEL } from './progression';
import { branchesForMedian } from './rankLadder';
import {
  MIN_WEEKS_AT_LEVEL,
  STRAIGHT_ARM_REST_HOURS,
  STRAIGHT_ARM_SESSION_BUDGET_S,
} from './safeguards';
import { PACE_SESSIONS } from './sessionTime';
import { SESSION_MINUTES } from './train';
import { ATTRIBUTES, type Attribute, type RankTitle } from './types';
import { WIDGET_TOP_ATTRIBUTES } from './widget';
import {
  CLASS_CHALLENGE_BONUS_XP,
  COMPLETION_BONUS_RATIO,
  DIFFICULTY_BASE,
  DIFFICULTY_PER_OG_LEVEL,
  ECCENTRIC_SECONDS_PER_UNIT,
  HOLD_SECONDS_PER_UNIT,
  OUTCOME_MULT,
  PARTIAL_MIN_RATIO,
  STREAK_BONUS_MAX,
  STREAK_BONUS_PER_SESSION,
  STREAK_MAX_GAP_MS,
} from './xp';

/** The guide's entries, in reading order. Ids are stable (routes and "i" buttons use them). */
export const GUIDE_TOPICS = [
  'xp',
  'skills',
  'safeguards',
  'attributes',
  'ranks',
  'streak',
  'classes',
  'challenge',
  'companion',
  'generator',
  'widgets',
  'data',
] as const;
export type GuideTopic = (typeof GUIDE_TOPICS)[number];

export interface GuideEntry {
  id: GuideTopic;
  title: string;
  /** 1–3 sentences: what the "i" sheet shows. */
  summary: string;
  /** The details on the entry's guide page, one paragraph each (may be empty). */
  more: string[];
}

/** An example class for the classes entry: its name and the points each tier needs. */
interface ClassExample {
  name: string;
  attribute: Attribute;
  points: number[];
}

/**
 * Every number the guide's text uses, plus the names it needs. Built from the owning modules by
 * {@link guideFacts}; only numbers go in here so the test can change them all.
 */
export interface GuideFacts {
  holdSecondsPerUnit: number;
  eccentricSecondsPerUnit: number;
  difficultyBase: number;
  difficultyPerOgLevel: number;
  partialMinRatio: number;
  partialMult: number;
  failedMult: number;
  completionBonusRatio: number;
  characterXpBase: number;
  characterXpGrowth: number;
  characterMaxLevel: number;
  maxNodeLevel: number;
  proficientLevel: number;
  minWeeksAtLevel: number;
  straightArmBudgetS: number;
  straightArmRestHours: number;
  attributeCount: number;
  pushPullMaxGap: number;
  rankBranchCount: number;
  ranks: { rank: RankTitle; min: number }[];
  nonRankBranches: string[];
  streakMaxGapHours: number;
  streakBonusPerSession: number;
  streakBonusMax: number;
  /** The best-streak counts that earn a companion accessory, lowest first. */
  streakAccessories: number[];
  classCount: number;
  classTierCount: number;
  startingClass: string;
  classExample: ClassExample;
  challengeBonusXp: number;
  contentMaxDays: number;
  waitingMaxDays: number;
  accessoryCount: number;
  /** The character levels that earn a companion accessory, lowest first. */
  levelAccessories: number[];
  upgradedWeaponTier: number;
  startingWeapon: string;
  sessionMinutes: number[];
  /** Sessions the rest pace is measured over, and the most sets a longer session grows to. */
  paceSessions: number;
  maxWorkingSets: number;
  maxGoals: number;
  patternRestHours: number;
  /** Movement patterns that need no rest day (balance, mobility). */
  restExemptPatterns: string[];
  widgetTopAttributes: number;
}

/** A number for the text: at most two decimals, no trailing zeros (0.25, 10, 2.5). */
export function guideNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** A ratio as a percentage number (0.05 → "5"). */
const percent = (ratio: number): string => guideNumber(ratio * 100);

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/** "a, b and c". */
function list(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** The first class whose every tier needs points in one and the same attribute (Warrior). */
function classExample(): ClassExample {
  for (const heroClass of HERO_CLASSES) {
    const points: number[] = [];
    let attribute: Attribute | undefined;
    for (const tier of heroClass.tiers) {
      if (tier.rule.kind !== 'stats') break;
      const entries = Object.entries(tier.rule.points) as [Attribute, number][];
      if (entries.length !== 1 || (attribute && entries[0][0] !== attribute)) break;
      attribute = entries[0][0];
      points.push(entries[0][1]);
    }
    if (attribute && points.length === heroClass.tiers.length) {
      return { name: heroClass.name, attribute, points };
    }
  }
  throw new Error('guide: no class with single-attribute tiers to use as an example');
}

const ruleCounts = (kind: 'level' | 'streak'): number[] =>
  ACCESSORIES.flatMap(({ rule }) => {
    if (kind === 'level' && rule.kind === 'level') return [rule.level];
    if (kind === 'streak' && rule.kind === 'streak') return [rule.count];
    return [];
  }).sort((a, b) => a - b);

/** The facts from the modules that own them. */
export function guideFacts(): GuideFacts {
  const starting = HERO_CLASSES.find((heroClass) => heroClass.id === STARTING_CLASS_ID);
  const startingWeapon = CLASS_WEAPONS.find((weapon) => weapon.classId === STARTING_CLASS_ID);
  return {
    holdSecondsPerUnit: HOLD_SECONDS_PER_UNIT,
    eccentricSecondsPerUnit: ECCENTRIC_SECONDS_PER_UNIT,
    difficultyBase: DIFFICULTY_BASE,
    difficultyPerOgLevel: DIFFICULTY_PER_OG_LEVEL,
    partialMinRatio: PARTIAL_MIN_RATIO,
    partialMult: OUTCOME_MULT.partial,
    failedMult: OUTCOME_MULT.failed,
    completionBonusRatio: COMPLETION_BONUS_RATIO,
    characterXpBase: CHARACTER_XP_BASE,
    characterXpGrowth: CHARACTER_XP_GROWTH,
    characterMaxLevel: CHARACTER_MAX_LEVEL,
    maxNodeLevel: MAX_NODE_LEVEL,
    proficientLevel: PROFICIENT_LEVEL,
    minWeeksAtLevel: MIN_WEEKS_AT_LEVEL,
    straightArmBudgetS: STRAIGHT_ARM_SESSION_BUDGET_S,
    straightArmRestHours: STRAIGHT_ARM_REST_HOURS,
    attributeCount: ATTRIBUTES.length,
    pushPullMaxGap: PUSH_PULL_MAX_GAP,
    rankBranchCount: RANK_BRANCHES.length,
    // Lowest rank first, the way the guide lists them.
    ranks: [...RANK_MIN_MEDIAN_OG_LEVEL].reverse().map((entry) => ({ ...entry })),
    nonRankBranches: NON_RANK_BRANCHES.map((branch) => BRANCH_NAMES[branch]),
    streakMaxGapHours: STREAK_MAX_GAP_MS / MS_PER_HOUR,
    streakBonusPerSession: STREAK_BONUS_PER_SESSION,
    streakBonusMax: STREAK_BONUS_MAX,
    streakAccessories: ruleCounts('streak'),
    classCount: HERO_CLASSES.length,
    classTierCount: Math.max(...HERO_CLASSES.map((heroClass) => heroClass.tiers.length)),
    startingClass: starting?.name ?? STARTING_CLASS_ID,
    classExample: classExample(),
    challengeBonusXp: CLASS_CHALLENGE_BONUS_XP,
    contentMaxDays: CONTENT_MAX_DAYS,
    waitingMaxDays: WAITING_MAX_DAYS,
    accessoryCount: ACCESSORIES.length,
    levelAccessories: ruleCounts('level'),
    upgradedWeaponTier: UPGRADED_WEAPON_TIER,
    startingWeapon: (startingWeapon?.name ?? 'training sword').toLowerCase(),
    sessionMinutes: [...SESSION_MINUTES],
    paceSessions: PACE_SESSIONS,
    maxWorkingSets: MAX_WORKING_SETS,
    maxGoals: MAX_GOALS,
    patternRestHours: PATTERN_REST_HOURS,
    restExemptPatterns: [...RECOVERY_EXEMPT_PATTERNS],
    widgetTopAttributes: WIDGET_TOP_ATTRIBUTES,
  };
}

/** Builds the entries from `facts`: formatting only, every number comes from `facts`. */
export function buildGuide(facts: GuideFacts): GuideEntry[] {
  const n = guideNumber;
  const attributeNames = list(ATTRIBUTES.map(capitalize));
  const difficulty = `${n(facts.difficultyBase)} + ${n(facts.difficultyPerOgLevel)} × its tier`;
  const example = facts.classExample;
  const entries: Record<GuideTopic, Omit<GuideEntry, 'id'>> = {
    xp: {
      title: 'XP and levels',
      summary:
        'Every set you log earns XP. Reps, hold time and slow lowerings all count, and harder ' +
        `skills pay more for the same work. All your XP adds up to your character level (up to ` +
        `level ${n(facts.characterMaxLevel)}).`,
      more: [
        `One unit of work is one rep, ${n(facts.holdSecondsPerUnit)} s of hold or ` +
          `${n(facts.eccentricSecondsPerUnit)} s of slow lowering. Each unit pays XP by the ` +
          `skill’s tier: ${difficulty}.`,
        `An exercise where every set met its target pays in full. Reaching at least ` +
          `${percent(facts.partialMinRatio)} % of the target pays ${percent(facts.partialMult)} %, ` +
          `less than that still pays ${percent(facts.failedMult)} %. A hard day is never wasted.`,
        `A session where you skip no set adds +${percent(facts.completionBonusRatio)} %, and your ` +
          'streak adds its bonus on top (see Streak). The XP goes to the skills you trained and ' +
          'to your character.',
        `Your first character level-up takes ${n(facts.characterXpBase)} XP; each one after ` +
          `that takes ${percent(facts.characterXpGrowth - 1)} % more.`,
      ],
    },
    skills: {
      title: 'Skill levels and Trials',
      summary:
        `Each skill has ${n(facts.maxNodeLevel)} levels and its own XP. At level ` +
        `${n(facts.proficientLevel)} it waits for its Trial: meet the Trial standard to become ` +
        'proficient and open the skills that build on it.',
      more: [
        `XP you earn past level ${n(facts.proficientLevel)} before the Trial is banked, not ` +
          'lost: it counts the moment you pass.',
        'Test-out: you can attempt any skill’s Trial at any time, even a locked one. Passing ' +
          `makes the skill proficient at once (at least level ${n(facts.proficientLevel)}), so ` +
          'you can skip what you already master.',
        'Unlock anyway: a locked skill can be opened by hand from its page. The app lists what ' +
          'it would normally need, you acknowledge it, and the choice is yours.',
        'A skill unlocks on its own when the skills it builds on (or one of their ' +
          'alternatives) reach the level it asks for. Recommended prerequisites never lock ' +
          'anything; they are good preparation.',
        `Level ${n(facts.maxNodeLevel)} with the Trial passed is Mastered.`,
      ],
    },
    safeguards: {
      title: 'Straight-arm safeguards',
      summary:
        'Straight-arm skills (planche, levers, cross) load tendons, and tendons adapt far ' +
        'slower than muscle. The app recommends limits for them and warns you when you go ' +
        'past one, but it never stops you.',
      more: [
        `A straight-arm Trial is recommended after ${n(facts.minWeeksAtLevel)} weeks of ` +
          'training that skill.',
        `A session holds at most ${n(facts.straightArmBudgetS)} s of straight-arm work. The ` +
          'sets of one straight-arm Trial don’t count against it (Trial day).',
        `Straight-arm sessions are at least ${n(facts.straightArmRestHours)} h apart.`,
        'A warning asks you to acknowledge it. That only confirms you read it; the decision ' +
          'stays with you. The workouts the app suggests always keep to these limits.',
        HEALTH_DISCLAIMER,
      ],
    },
    attributes: {
      title: 'Attributes',
      summary:
        `${n(facts.attributeCount)} attributes (${attributeNames}) show what your training ` +
        'builds. Every skill you train adds to the attributes it works, more for harder skills ' +
        'and higher levels. The radar shows their balance.',
      more: [
        `A skill adds (${difficulty}) times its level. Until its Trial is ` +
          `passed, its level counts at most ${n(facts.proficientLevel)}.`,
        'Straight-arm skills also train the core: planche counts as push and core, front ' +
          'lever as pull and core.',
        'The radar is scaled to your strongest attribute, so it shows the shape of your ' +
          'training rather than the size.',
        'A note appears when your best push and pull skills are more than ' +
          `${n(facts.pushPullMaxGap)} tiers apart. It is a hint for balance, nothing more.`,
      ],
    },
    ranks: {
      title: 'Ranks',
      summary:
        'Your rank shows how far you have come across the whole tree: the median of your best ' +
        `proficient skill in each of the ${n(facts.rankBranchCount)} rank branches. ` +
        `${list(facts.nonRankBranches)} don’t count towards it.`,
      more: [
        `The ranks by branch median tier: ${facts.ranks
          .map(({ rank, min }) => `${rank} ${n(min)}`)
          .join(', ')}.`,
        `A rank is certain once ${n(branchesForMedian(facts.rankBranchCount))} of the ` +
          `${n(facts.rankBranchCount)} branches reach its level (more than half). A high middle ` +
          'branch can sometimes make up for one less.',
        `${list(facts.nonRankBranches)} are optional side paths, so leaving them out never ` +
          'holds your rank back. They still grow your attributes.',
        'Tap the rank crest on the Character tab to see every rank and what the next one ' +
          'needs.',
      ],
    },
    streak: {
      title: 'Streak',
      summary:
        'Your streak counts sessions in a row that are at most ' +
        `${n(facts.streakMaxGapHours)} h apart, so rest days don’t break it. Each session in a ` +
        `row after the first adds +${percent(facts.streakBonusPerSession)} % to a session’s XP, ` +
        `up to +${percent(facts.streakBonusMax)} %.`,
      more: [
        'A longer break only starts a new streak with your next session; nothing else is lost.',
        `Your best streak earns companion auras at ${list(
          facts.streakAccessories.map((count) => n(count)),
        )} sessions, and they stay earned.`,
      ],
    },
    classes: {
      title: 'Classes and tiers',
      summary:
        `Classes are titles your training unlocks: ${n(facts.classCount)} of them, most with ` +
        `${n(facts.classTierCount)} tiers. Wear any class you have unlocked; it is cosmetic ` +
        'and never changes XP, workouts or the safeguards.',
      more: [
        `Every hero starts as a ${facts.startingClass}. The other classes need flat ` +
          `thresholds, mostly attribute points, e.g. ${example.name}: ` +
          `${capitalize(example.attribute)} ${example.points.map((points) => n(points)).join(' / ')}.`,
        'The numbers only grow with training, so specialising never locks a class away, and a ' +
          'reached tier stays yours forever.',
        'Tap the class banner on the Character tab to see every class, what each tier needs, ' +
          'and to choose the one you wear.',
      ],
    },
    challenge: {
      title: 'Weekly challenge',
      summary:
        'The class you wear offers one optional goal per week, Monday to Sunday. Completing it ' +
        `pays +${n(facts.challengeBonusXp)} XP once that week and earns a badge; missing it ` +
        'costs nothing.',
      more: [
        'The first session of a week fixes that week’s challenge to the class you wear then. ' +
          'Switching classes changes it from next Monday.',
        'Straight-arm sets never count, so a challenge never adds tendon load.',
        'Higher class tiers ask a little more, but never more than a normal training week.',
      ],
    },
    companion: {
      title: 'Companion',
      summary:
        `Your hero as a small pixel companion. It is ${MOOD_TITLES.happy.toLowerCase()} on a ` +
        `training day, ${MOOD_TITLES.content.toLowerCase()} for ${n(facts.contentMaxDays)} days ` +
        `after, ${MOOD_TITLES.waiting.toLowerCase()} up to day ${n(facts.waitingMaxDays)}, and ` +
        'then it misses you; one session cheers it up. It never gets sick and never loses anything.',
      more: [
        `It can earn ${n(facts.accessoryCount)} accessories: rank gear, gear at character ` +
          `levels ${list(facts.levelAccessories.map((level) => n(level)))}, milestones and ` +
          'class tiers. Earned ones are kept forever.',
        'Choose what it wears, its body (man or woman), hair style and its skin, hair and ' +
          'outfit colours with Customize.',
        'It carries the weapon of the class you wear, upgraded from tier ' +
          `${tierNumeral(facts.upgradedWeaponTier)}. A ${facts.startingClass} carries a ` +
          `${facts.startingWeapon}.`,
      ],
    },
    generator: {
      title: 'Workout generator',
      summary:
        'Train builds a session for the place and time you pick ' +
        `(${n(Math.min(...facts.sessionMinutes))} to ${n(Math.max(...facts.sessionMinutes))} min). ` +
        'It is a suggestion: swap, remove or add anything before you start.',
      more: [
        `It leads towards your goals first (up to ${n(facts.maxGoals)}), then favours ` +
          'movements you haven’t trained lately and the weaker side of push and pull.',
        `Movements trained in the last ${n(facts.patternRestHours)} h get a rest; ` +
          `${list(facts.restExemptPatterns)} work is always fine.`,
        'Double progression: hit every set and the next target goes up; reach the top of the ' +
          'range and it suggests the Trial.',
        'It only uses the equipment of the profile you picked; when a skill needs something ' +
          'else, a skill of the same movement stands in.',
        `It plans at your pace: if your last ${n(facts.paceSessions)} sessions show you rest ` +
          'less (or more) than suggested, the time estimate counts that. The suggested rest stays.',
        `More time buys a cool-down, then more sets (up to ${n(facts.maxWorkingSets)} per ` +
          'exercise), then extra exercises.',
        'Its suggestions always keep to the straight-arm safeguards.',
      ],
    },
    widgets: {
      title: 'Home-screen widgets',
      summary:
        'Two Android widgets: a small one with whether you trained today, your streak and level ' +
        `and, as space allows, your rank and up to ${n(facts.widgetTopAttributes)} top ` +
        'attributes, and a large one with your companion. Tapping either opens Train.',
      more: [
        'Add them from your home screen: long-press an empty spot, choose Widgets and look ' +
          'for SkillForge.',
        'Resize them as you like: the text and the companion grow with the widget, and a ' +
          'bigger small widget shows more.',
        'They show what the app last saved on this phone. They update after every session and ' +
          'refresh on their own regularly, so shortly after midnight “trained today” is about the ' +
          'new day.',
      ],
    },
    data: {
      title: 'Backups and your data',
      summary:
        `${DATA_STORAGE_NOTE} Export a backup in Settings and keep it somewhere safe; ` +
        'importing one replaces all your data.',
      more: [
        'No ads and no analytics.',
        'Before an import replaces anything, the app checks the whole file and keeps a copy of ' +
          'your current data, so you can undo the last import.',
        'Levels, ranks, classes and accessories are worked out again from your logged sessions, ' +
          'so a backup restores all of them.',
        'Uninstalling the app removes its data from the phone. Android may bring it back from ' +
          'its device backup when you reinstall, but don’t count on it: export a backup first.',
        'Settings → Delete all my data erases everything SkillForge stored on this phone and ' +
          'starts the app fresh.',
      ],
    },
  };
  return GUIDE_TOPICS.map((id) => ({ id, ...entries[id] }));
}

/** The guide with the app's real numbers. */
export const GUIDE: readonly GuideEntry[] = buildGuide(guideFacts());

const GUIDE_BY_ID: ReadonlyMap<GuideTopic, GuideEntry> = new Map(
  GUIDE.map((entry) => [entry.id, entry]),
);

export function guideEntry(id: GuideTopic): GuideEntry {
  // Every topic has an entry (built from GUIDE_TOPICS).
  return GUIDE_BY_ID.get(id) as GuideEntry;
}

export function isGuideTopic(value: unknown): value is GuideTopic {
  return typeof value === 'string' && (GUIDE_TOPICS as readonly string[]).includes(value);
}
