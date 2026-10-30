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
 * The texts are translated as they are built (`t`, PLAN 7.8 FB-8), so the guide is built per
 * locale, lazily: `guideEntries()` memoises it by the current locale.
 *
 * Optional reading: nothing in the app opens the guide on its own (ADR-023 spirit).
 */
import { HERO_CLASSES, STARTING_CLASS_ID } from '@/data/classes';
import { ACCESSORIES } from '@/data/companion/accessories';
import { CLASS_WEAPONS, UPGRADED_WEAPON_TIER } from '@/data/companion/weapons';
import { DATA_STORAGE_NOTE, HEALTH_DISCLAIMER, STORE_SWITCH_NOTE } from '@/data/notices';
import { BRANCH_NAMES } from '@/data/skills/branches';
import { getLocale, k, t, type Locale } from '@/i18n';
import { MS_PER_HOUR } from '@/lib/time';

import {
  ATTRIBUTE_MIN_LEVEL,
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
  LIGHT_WORK_XP_SHARE,
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
  /** Share of XP warm-up and cool-down work earns (ADR-078). */
  lightWorkXpShare: number;
  characterXpBase: number;
  characterXpGrowth: number;
  characterMaxLevel: number;
  maxNodeLevel: number;
  proficientLevel: number;
  minWeeksAtLevel: number;
  straightArmBudgetS: number;
  straightArmRestHours: number;
  attributeCount: number;
  /** A skill counts for its attributes from this level on (ADR-078). */
  attributeMinLevel: number;
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
  /** The starting class's weapon, named as the data names it (translated when shown). */
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

/** The attributes as the guide names them (the domain names them, the text words them). */
const ATTRIBUTE_NAMES: Readonly<Record<Attribute, string>> = {
  push: k('Push'),
  pull: k('Pull'),
  core: k('Core'),
  legs: k('Legs'),
  balance: k('Balance'),
  mobility: k('Mobility'),
};

/** The rank titles as the guide names them. */
const RANK_NAMES: Readonly<Record<RankTitle, string>> = {
  Novice: k('Novice'),
  Apprentice: k('Apprentice'),
  Adept: k('Adept'),
  Master: k('Master'),
  Legend: k('Legend'),
};

/** The rest-exempt movement patterns, worded mid-sentence ("balance and mobility work"). */
const PATTERN_WORDS: Readonly<Partial<Record<string, string>>> = {
  balance: k('balance'),
  mobility: k('mobility'),
};

/**
 * A name from the data (a weapon, a mood) as English writes it mid-sentence: in lower case.
 * German keeps the capital of its nouns.
 */
function midSentence(name: string): string {
  return getLocale() === 'en' ? name.toLowerCase() : name;
}

/** "a, b and c". */
function list(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return t('{init} and {last}', {
    init: items.slice(0, -1).join(', '),
    last: items[items.length - 1],
  });
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
    lightWorkXpShare: LIGHT_WORK_XP_SHARE,
    characterXpBase: CHARACTER_XP_BASE,
    characterXpGrowth: CHARACTER_XP_GROWTH,
    characterMaxLevel: CHARACTER_MAX_LEVEL,
    maxNodeLevel: MAX_NODE_LEVEL,
    proficientLevel: PROFICIENT_LEVEL,
    minWeeksAtLevel: MIN_WEEKS_AT_LEVEL,
    straightArmBudgetS: STRAIGHT_ARM_SESSION_BUDGET_S,
    straightArmRestHours: STRAIGHT_ARM_REST_HOURS,
    attributeCount: ATTRIBUTES.length,
    attributeMinLevel: ATTRIBUTE_MIN_LEVEL,
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
    startingWeapon: startingWeapon?.name ?? k('Training sword'),
    sessionMinutes: [...SESSION_MINUTES],
    paceSessions: PACE_SESSIONS,
    maxWorkingSets: MAX_WORKING_SETS,
    maxGoals: MAX_GOALS,
    patternRestHours: PATTERN_REST_HOURS,
    restExemptPatterns: [...RECOVERY_EXEMPT_PATTERNS],
    widgetTopAttributes: WIDGET_TOP_ATTRIBUTES,
  };
}

/**
 * Builds the entries from `facts` in the current locale: formatting only, every number comes
 * from `facts`.
 */
export function buildGuide(facts: GuideFacts): GuideEntry[] {
  const n = guideNumber;
  const attributeNames = list(ATTRIBUTES.map((attribute) => t(ATTRIBUTE_NAMES[attribute])));
  const difficulty = t('{base} + {perLevel} × its tier', {
    base: n(facts.difficultyBase),
    perLevel: n(facts.difficultyPerOgLevel),
  });
  const example = facts.classExample;
  const nonRankBranches = list(facts.nonRankBranches.map((branch) => t(branch)));
  const entries: Record<GuideTopic, Omit<GuideEntry, 'id'>> = {
    xp: {
      title: t('XP and levels'),
      summary: t(
        'Every set you log earns XP. Reps, hold time and slow lowerings all count, and harder skills pay more for the same work. All your XP adds up to your character level (up to level {max}).',
        { max: n(facts.characterMaxLevel) },
      ),
      more: [
        t(
          'One unit of work is one rep, {holdS} s of hold or {eccentricS} s of slow lowering. Each unit pays XP by the skill’s tier: {difficulty}.',
          {
            holdS: n(facts.holdSecondsPerUnit),
            eccentricS: n(facts.eccentricSecondsPerUnit),
            difficulty,
          },
        ),
        t(
          'An exercise where every set met its target pays in full. Reaching at least {partialMin} % of the target pays {partial} %, less than that still pays {failed} %. A hard day is never wasted.',
          {
            partialMin: percent(facts.partialMinRatio),
            partial: percent(facts.partialMult),
            failed: percent(facts.failedMult),
          },
        ),
        t(
          'A session where you skip no set adds +{bonus} %, and your streak adds its bonus on top (see Streak). The XP goes to the skills you trained and to your character.',
          { bonus: percent(facts.completionBonusRatio) },
        ),
        t(
          'Warm-up sets (a single set of a skill) and mobility work next to your main work (the cool-down) pay {share} % of their XP, so they don’t outgrow what you actually train. A session that is mostly mobility, like Recovery, pays in full.',
          { share: percent(facts.lightWorkXpShare) },
        ),
        t(
          'Your first character level-up takes {xp} XP; each one after that takes {growth} % more.',
          { xp: n(facts.characterXpBase), growth: percent(facts.characterXpGrowth - 1) },
        ),
      ],
    },
    skills: {
      title: t('Skill levels and Trials'),
      summary: t(
        'Each skill has {max} levels and its own XP. At level {proficient} it waits for its Trial: meet the Trial standard to become proficient and open the skills that build on it.',
        { max: n(facts.maxNodeLevel), proficient: n(facts.proficientLevel) },
      ),
      more: [
        t(
          'XP you earn past level {proficient} before the Trial is banked, not lost: it counts the moment you pass.',
          { proficient: n(facts.proficientLevel) },
        ),
        t(
          'Test-out: you can attempt any skill’s Trial at any time, even a locked one. Passing makes the skill proficient at once (at least level {proficient}), so you can skip what you already master.',
          { proficient: n(facts.proficientLevel) },
        ),
        t(
          'A passed Trial also counts for the skills it builds on: every earlier skill it needs becomes proficient too, as if you had passed its Trial.',
        ),
        t(
          'Unlock anyway: a locked skill can be opened by hand from its page. The app lists what it would normally need, you acknowledge it, and the choice is yours.',
        ),
        t(
          'A skill unlocks on its own when the skills it builds on (or one of their alternatives) reach the level it asks for. Recommended prerequisites never lock anything; they are good preparation.',
        ),
        t('Level {max} with the Trial passed is Mastered.', { max: n(facts.maxNodeLevel) }),
      ],
    },
    safeguards: {
      title: t('Straight-arm safeguards'),
      summary: t(
        'Straight-arm skills (planche, levers, cross) load tendons, and tendons adapt far slower than muscle. The app recommends limits for them and warns you when you go past one, but it never stops you.',
      ),
      more: [
        t('A straight-arm Trial is recommended after {weeks} weeks of training that skill.', {
          weeks: n(facts.minWeeksAtLevel),
        }),
        t(
          'A session holds at most {budget} s of straight-arm work. The sets of one straight-arm Trial don’t count against it (Trial day).',
          { budget: n(facts.straightArmBudgetS) },
        ),
        t('Straight-arm sessions are at least {hours} h apart.', {
          hours: n(facts.straightArmRestHours),
        }),
        t(
          'A warning asks you to acknowledge it. That only confirms you read it; the decision stays with you. The workouts the app suggests always keep to these limits.',
        ),
        t(HEALTH_DISCLAIMER),
      ],
    },
    attributes: {
      title: t('Attributes'),
      summary: t(
        '{count} attributes ({names}) show what your training builds. Every skill you train adds to the attributes it works, more for harder skills and higher levels. The radar shows their balance.',
        { count: n(facts.attributeCount), names: attributeNames },
      ),
      more: [
        t(
          'A skill adds ({difficulty}) times its level, from level {minLevel} on: a skill touched once in a warm-up or cool-down adds nothing yet. Until its Trial is passed, its level counts at most {proficient}.',
          {
            difficulty,
            minLevel: n(facts.attributeMinLevel),
            proficient: n(facts.proficientLevel),
          },
        ),
        t(
          'Straight-arm skills also train the core: planche counts as push and core, front lever as pull and core.',
        ),
        t(
          'The radar is scaled to your strongest attribute, so it shows the shape of your training rather than the size.',
        ),
        t(
          'A note appears when your best push and pull skills are more than {gap} tiers apart. It is a hint for balance, nothing more.',
          { gap: n(facts.pushPullMaxGap) },
        ),
      ],
    },
    ranks: {
      title: t('Ranks'),
      summary: t(
        'Your rank shows how far you have come across the whole tree: the median of your best proficient skill in each of the {count} rank branches. {branches} don’t count towards it.',
        { count: n(facts.rankBranchCount), branches: nonRankBranches },
      ),
      more: [
        t('The ranks by branch median tier: {ranks}.', {
          ranks: facts.ranks.map(({ rank, min }) => `${t(RANK_NAMES[rank])} ${n(min)}`).join(', '),
        }),
        t(
          'A rank is certain once {needed} of the {count} branches reach its level (more than half). A high middle branch can sometimes make up for one less.',
          {
            needed: n(branchesForMedian(facts.rankBranchCount)),
            count: n(facts.rankBranchCount),
          },
        ),
        t(
          '{branches} are optional side paths, so leaving them out never holds your rank back. They still grow your attributes.',
          { branches: nonRankBranches },
        ),
        t('Tap the rank crest on the Character tab to see every rank and what the next one needs.'),
      ],
    },
    streak: {
      title: t('Streak'),
      summary: t(
        'Your streak counts sessions in a row that are at most {hours} h apart, so rest days don’t break it. Each session in a row after the first adds +{perSession} % to a session’s XP, up to +{max} %.',
        {
          hours: n(facts.streakMaxGapHours),
          perSession: percent(facts.streakBonusPerSession),
          max: percent(facts.streakBonusMax),
        },
      ),
      more: [
        t('A longer break only starts a new streak with your next session; nothing else is lost.'),
        t('Your best streak earns companion auras at {counts} sessions, and they stay earned.', {
          counts: list(facts.streakAccessories.map((count) => n(count))),
        }),
      ],
    },
    classes: {
      title: t('Classes and tiers'),
      summary: t(
        'Classes are titles your training unlocks: {count} of them, most with {tiers} tiers. Wear any class you have unlocked; it is cosmetic and never changes XP, workouts or the safeguards.',
        { count: n(facts.classCount), tiers: n(facts.classTierCount) },
      ),
      more: [
        t(
          'Every hero starts as a {startingClass}. The other classes need flat thresholds, mostly attribute points, e.g. {name}: {attribute} {points}.',
          {
            startingClass: t(facts.startingClass),
            name: t(example.name),
            attribute: t(ATTRIBUTE_NAMES[example.attribute]),
            points: example.points.map((points) => n(points)).join(' / '),
          },
        ),
        t(
          'The numbers only grow with training, so specialising never locks a class away, and a reached tier stays yours forever.',
        ),
        t(
          'Tap the class banner on the Character tab to see every class, what each tier needs, and to choose the one you wear.',
        ),
      ],
    },
    challenge: {
      title: t('Weekly challenge'),
      summary: t(
        'The class you wear offers one optional goal per week, Monday to Sunday. Completing it pays +{xp} XP once that week and earns a badge; missing it costs nothing.',
        { xp: n(facts.challengeBonusXp) },
      ),
      more: [
        t(
          'The first session of a week fixes that week’s challenge to the class you wear then. Switching classes changes it from next Monday.',
        ),
        t('Straight-arm sets never count, so a challenge never adds tendon load.'),
        t('Higher class tiers ask a little more, but never more than a normal training week.'),
      ],
    },
    companion: {
      title: t('Companion'),
      summary: t(
        'Your hero as a small pixel companion. It is {happy} on a training day, {content} for {contentDays} days after, {waiting} up to day {waitingDays}, and then it misses you; one session cheers it up. It never gets sick and never loses anything.',
        {
          happy: midSentence(t(MOOD_TITLES.happy)),
          content: midSentence(t(MOOD_TITLES.content)),
          contentDays: n(facts.contentMaxDays),
          waiting: midSentence(t(MOOD_TITLES.waiting)),
          waitingDays: n(facts.waitingMaxDays),
        },
      ),
      more: [
        t(
          'It can earn {count} accessories: rank gear, gear at character levels {levels}, milestones and class tiers. Earned ones are kept forever.',
          {
            count: n(facts.accessoryCount),
            levels: list(facts.levelAccessories.map((level) => n(level))),
          },
        ),
        t(
          'Choose what it wears, its body (man or woman), hair style and its skin, hair and outfit colours with Customize.',
        ),
        t(
          'It carries the weapon of the class you wear, upgraded from tier {tier}. A {className} carries a {weapon}.',
          {
            tier: tierNumeral(facts.upgradedWeaponTier),
            className: t(facts.startingClass),
            weapon: midSentence(t(facts.startingWeapon)),
          },
        ),
      ],
    },
    generator: {
      title: t('Workout generator'),
      summary: t(
        'Train builds a session for the place and time you pick ({min} to {max} min). It is a suggestion: swap, remove or add anything before you start.',
        {
          min: n(Math.min(...facts.sessionMinutes)),
          max: n(Math.max(...facts.sessionMinutes)),
        },
      ),
      more: [
        t(
          'It leads towards your goals first (up to {max}), then favours movements you haven’t trained lately and the weaker side of push and pull.',
          { max: n(facts.maxGoals) },
        ),
        t('Movements trained in the last {hours} h get a rest; {patterns} work is always fine.', {
          hours: n(facts.patternRestHours),
          patterns: list(
            facts.restExemptPatterns.map((pattern) => t(PATTERN_WORDS[pattern] ?? pattern)),
          ),
        }),
        t(
          'Double progression: hit every set and the next target goes up; reach the top of the range and it suggests the Trial.',
        ),
        t(
          'It only uses the equipment of the profile you picked; when a skill needs something else, a skill of the same movement stands in.',
        ),
        t(
          'It plans at your pace: if your last {n} sessions show you rest less (or more) than suggested, the time estimate counts that. The suggested rest stays.',
          { n: n(facts.paceSessions) },
        ),
        t(
          'More time buys a cool-down, then more sets (up to {max} per exercise), then extra exercises.',
          { max: n(facts.maxWorkingSets) },
        ),
        t('Its suggestions always keep to the straight-arm safeguards.'),
        t(
          'Pick the kind of session: Standard, Recovery (mobility and light practice, no hard strength) or Challenging (more sets, harder targets, a due Trial). Every kind keeps the safeguards and the {hours} h rest.',
          { hours: n(facts.patternRestHours) },
        ),
        t(
          'In the session every set is a monster of the exercise’s branch; logging the set beats it. Settings → Training view picks Classic (one exercise at a time) or Battle (every exercise at once: tap a monster to log the target, tap again for one rep fewer, long press for an exact number).',
        ),
      ],
    },
    widgets: {
      title: t('Home-screen widgets'),
      summary: t(
        'Two Android widgets: a small one with whether you trained today, your streak and level and, as space allows, your rank and up to {n} top attributes, and a large one with your companion. Tapping either opens Train.',
        { n: n(facts.widgetTopAttributes) },
      ),
      more: [
        t(
          'Add them from your home screen: long-press an empty spot, choose Widgets and look for SkillForge.',
        ),
        t(
          'Resize them as you like: the text and the companion grow with the widget, and a bigger small widget shows more.',
        ),
        t(
          'They show what the app last saved on this phone. They update after every session and refresh on their own regularly, so shortly after midnight “trained today” is about the new day.',
        ),
      ],
    },
    data: {
      title: t('Backups and your data'),
      summary: t(
        '{note} Export a backup in Settings and keep it somewhere safe; importing one replaces all your data.',
        { note: t(DATA_STORAGE_NOTE) },
      ),
      more: [
        t('No ads and no analytics.'),
        t(
          'Before an import replaces anything, the app checks the whole file and keeps a copy of your current data, so you can undo the last import.',
        ),
        t(
          'Levels, ranks, classes and accessories are worked out again from your logged sessions, so a backup restores all of them.',
        ),
        t(
          'Uninstalling the app removes its data from the phone. Android may bring it back from its device backup when you reinstall, but don’t count on it: export a backup first.',
        ),
        t(STORE_SWITCH_NOTE),
        t(
          'Settings → Delete all my data erases everything SkillForge stored on this phone and starts the app fresh.',
        ),
        t(
          'Settings → Health Connect (optional) adds every finished workout to Health Connect on this phone, with a note of what you did. SkillForge reads nothing from it; workouts it added stay there until you delete them in Health Connect.',
        ),
      ],
    },
  };
  return GUIDE_TOPICS.map((id) => ({ id, ...entries[id] }));
}

let cached: { locale: Locale; entries: readonly GuideEntry[] } | undefined;

/** The guide with the app's real numbers, in the current locale (built once per locale). */
export function guideEntries(): readonly GuideEntry[] {
  const locale = getLocale();
  if (cached?.locale !== locale) cached = { locale, entries: buildGuide(guideFacts()) };
  return cached.entries;
}

export function guideEntry(id: GuideTopic): GuideEntry {
  // Every topic has an entry (built from GUIDE_TOPICS, in their order).
  return guideEntries()[GUIDE_TOPICS.indexOf(id)];
}

export function isGuideTopic(value: unknown): value is GuideTopic {
  return typeof value === 'string' && (GUIDE_TOPICS as readonly string[]).includes(value);
}
