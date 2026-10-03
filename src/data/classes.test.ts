import { Palette } from '@/components/palette';
import { Colors } from '@/components/theme';
import { ALL_NODES } from '@/data/skills';
import { nodeAttributes } from '@/domain/character';
import { isStartingClass } from '@/domain/classes';
import { MAX_NODE_LEVEL } from '@/domain/progression';
import { ATTRIBUTES, RANK_TITLES, type Attribute, type ClassRule } from '@/domain/types';
import { difficultyMult } from '@/domain/xp';
import { contrastRatio, MIN_TEXT_CONTRAST } from '@/lib/contrast';
import { parsePixelGrid } from '@/lib/pixelGrid';

import { HERO_CLASS_BY_ID, HERO_CLASSES, STARTING_CLASS_ID } from './classes';

/** Each class above the starting one escalates over this many tiers (user decision, PLAN 6.9). */
const TIERS_PER_CLASS = 3;
const EMBLEM_CELLS = 12;
const EMBLEM_ROLES = '#+*o';

/** Points an attribute has with every node that trains it at the highest level: the hard ceiling. */
const attributeCeiling = (attribute: Attribute): number =>
  ALL_NODES.filter((node) => nodeAttributes(node).includes(attribute)).reduce(
    (sum, node) => sum + difficultyMult(node.ogLevel) * MAX_NODE_LEVEL,
    0,
  );

/** A number per rule that must rise from tier to tier, with a key that must stay the same. */
function measure(rule: ClassRule): { key: string; values: number[] } {
  switch (rule.kind) {
    case 'stats': {
      const keys = ATTRIBUTES.filter((attribute) => rule.points[attribute] !== undefined);
      return { key: `stats:${keys.join('+')}`, values: keys.map((key) => rule.points[key]!) };
    }
    case 'sessions':
      return { key: 'sessions', values: [rule.count] };
    case 'rank':
      return { key: 'rank', values: [RANK_TITLES.indexOf(rule.rank)] };
    case 'start':
      return { key: 'start', values: [0] };
  }
}

describe('HERO_CLASSES', () => {
  it('has unique snake_case ids and names', () => {
    const ids = HERO_CLASSES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
    const titles = HERO_CLASSES.flatMap((entry) => entry.tiers.map((tier) => tier.name));
    expect(new Set(titles).size).toBe(titles.length);
    expect(HERO_CLASS_BY_ID.size).toBe(ids.length);
  });

  it('starts every hero as the one starting class', () => {
    const starting = HERO_CLASSES.filter(isStartingClass);
    expect(starting.map((entry) => entry.id)).toEqual([STARTING_CLASS_ID]);
    expect(HERO_CLASSES[0].id).toBe(STARTING_CLASS_ID);
    expect(starting[0].tiers).toHaveLength(1);
  });

  it.each(
    HERO_CLASSES.filter((entry) => !isStartingClass(entry)).map((entry) => [entry.id, entry]),
  )('%s escalates over three tiers of the same requirement', (_id, heroClass) => {
    expect(heroClass.tiers).toHaveLength(TIERS_PER_CLASS);
    expect(heroClass.tiers[0].name).toBe(heroClass.name);
    const measures = heroClass.tiers.map((tier) => measure(tier.rule));
    for (let index = 1; index < measures.length; index++) {
      expect(measures[index].key).toBe(measures[0].key);
      measures[index].values.forEach((value, part) =>
        expect(value).toBeGreaterThan(measures[index - 1].values[part]),
      );
    }
    expect(measures[0].key).not.toBe('start');
  });

  it('only asks for attribute points the tree can give (below the all-mastered ceiling)', () => {
    for (const heroClass of HERO_CLASSES) {
      for (const tier of heroClass.tiers) {
        if (tier.rule.kind !== 'stats') continue;
        for (const attribute of ATTRIBUTES) {
          const points = tier.rule.points[attribute];
          if (points !== undefined) expect(points).toBeLessThan(attributeCeiling(attribute));
        }
      }
    }
  });

  it('prefers attributes: most classes are built on one or two attributes', () => {
    const attributeClasses = HERO_CLASSES.filter((entry) => entry.tiers[0].rule.kind === 'stats');
    expect(attributeClasses.length).toBeGreaterThanOrEqual(HERO_CLASSES.length - 3);
    // Every attribute has a class of its own.
    for (const attribute of ATTRIBUTES) {
      expect(
        attributeClasses.some((entry) => {
          const rule = entry.tiers[0].rule;
          return rule.kind === 'stats' && Object.keys(rule.points).join() === attribute;
        }),
      ).toBe(true);
    }
  });

  it.each(HERO_CLASSES.map((entry) => [entry.id, entry]))(
    '%s has a 12 × 12 emblem with a color for every role it uses',
    (_id, heroClass) => {
      expect(heroClass.emblem).toHaveLength(EMBLEM_CELLS);
      const grid = parsePixelGrid(heroClass.emblem, EMBLEM_ROLES);
      expect(grid.width).toBe(EMBLEM_CELLS);
      for (const run of grid.runs) {
        expect(heroClass.emblemColors[run.role as '#']).toBeDefined();
      }
    },
  );

  it.each(HERO_CLASSES.map((entry) => [entry.id, entry.color]))(
    '%s title color is legible on the panels (>= 4.5:1)',
    (_id, color) => {
      for (const surface of [Colors.surface, Colors.surfaceRaised]) {
        expect(contrastRatio(Palette[color], surface)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
    },
  );
});
