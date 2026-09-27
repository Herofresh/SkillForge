import { makeChain } from '@/data/testFixtures';

import {
  HERO_NAME_MAX_LENGTH,
  MAX_GOALS,
  normalizeHeroName,
  onboardingStepNumber,
  onboardingSummary,
  toggleGoal,
} from './onboarding';
import { emptyProgress } from './progression';

describe('normalizeHeroName', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeHeroName('  Aria   the  Bold ')).toBe('Aria the Bold');
  });

  it('is undefined for an empty or blank name', () => {
    expect(normalizeHeroName('')).toBeUndefined();
    expect(normalizeHeroName('   \n ')).toBeUndefined();
  });

  it('cuts long names to the maximum length', () => {
    expect(normalizeHeroName('x'.repeat(40))).toHaveLength(HERO_NAME_MAX_LENGTH);
  });

  it('does not leave a trailing space after cutting', () => {
    const raw = `${'a'.repeat(HERO_NAME_MAX_LENGTH - 1)} b`;
    expect(normalizeHeroName(raw)).toBe('a'.repeat(HERO_NAME_MAX_LENGTH - 1));
  });
});

describe('toggleGoal', () => {
  it('adds a goal at the end and removes it again', () => {
    const added = toggleGoal(['a'], 'b');
    expect(added).toEqual({ goals: ['a', 'b'], changed: true });
    expect(toggleGoal(added.goals, 'a')).toEqual({ goals: ['b'], changed: true });
  });

  it('does not add past the maximum but still removes', () => {
    const full = Array.from({ length: MAX_GOALS }, (_, index) => `g${index}`);
    expect(toggleGoal(full, 'extra')).toEqual({ goals: full, changed: false });
    expect(toggleGoal(full, 'g0').goals).toHaveLength(MAX_GOALS - 1);
  });
});

describe('onboardingStepNumber', () => {
  it('numbers the steps from 1', () => {
    expect(onboardingStepNumber('hero')).toBe(1);
    expect(onboardingStepNumber('summary')).toBe(5);
  });
});

describe('onboardingSummary', () => {
  it('lists the goals in order and the tested-out nodes easiest first', () => {
    const nodes = makeChain();
    const progress = {
      pull_up: { ...emptyProgress('pull_up'), xp: 100, level: 5, trialPassed: true },
      dead_hang: { ...emptyProgress('dead_hang'), xp: 20, level: 5, trialPassed: true },
    };
    const summary = onboardingSummary(nodes, progress, 250, ['pull_up', 'missing']);
    expect(summary.goals.map((node) => node.id)).toEqual(['pull_up']);
    expect(summary.testedOut.map((node) => node.id)).toEqual(['dead_hang', 'pull_up']);
    expect(summary.character.level).toBe(3);
  });
});
