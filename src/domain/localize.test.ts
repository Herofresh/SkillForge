import { makeNode } from '@/data/testFixtures';

import { localizeNode, localizeNodes } from './localize';
import type { LocaleTranslations } from './types';

const pullUp = makeNode({
  id: 'pull_up',
  name: 'Pull-up',
  description: 'Hanging from a bar, you pull up.',
  cues: ['Start from a dead hang.', 'Chin over the bar.'],
  prerequisites: [
    { nodeId: 'dead_hang', minLevel: 5, kind: 'hard' },
    { nodeId: 'hollow_hold', minLevel: 5, kind: 'recommended', note: 'Helps the body line.' },
  ],
});
const own = makeNode({ id: 'user_towel', name: 'Towel hang', source: 'user' });

const DE: LocaleTranslations = {
  pull_up: {
    name: 'Klimmzug',
    description: 'An einer Stange hängend ziehst du dich hoch.',
    cues: ['Starte aus dem Dead Hang.', 'Kinn über die Stange.'],
    prerequisiteNotes: { hollow_hold: 'Hilft der Körperlinie.', dead_hang: 'ignored: no note' },
  },
  user_towel: { name: 'nie', description: 'nie' },
};

describe('localizeNode (PLAN 7.8 FB-8)', () => {
  it('replaces name, description, cues and the prerequisite notes that exist', () => {
    const de = localizeNode(pullUp, DE.pull_up);
    expect(de).toMatchObject({
      id: 'pull_up',
      name: 'Klimmzug',
      description: 'An einer Stange hängend ziehst du dich hoch.',
      cues: ['Starte aus dem Dead Hang.', 'Kinn über die Stange.'],
    });
    expect(de.prerequisites).toEqual([
      { nodeId: 'dead_hang', minLevel: 5, kind: 'hard' },
      { nodeId: 'hollow_hold', minLevel: 5, kind: 'recommended', note: 'Hilft der Körperlinie.' },
    ]);
    // Everything else is untouched.
    expect({
      ...de,
      name: pullUp.name,
      description: pullUp.description,
      cues: pullUp.cues,
      prerequisites: pullUp.prerequisites,
    }).toEqual(pullUp);
  });

  it('keeps the English cues when the count differs', () => {
    const de = localizeNode(pullUp, { ...DE.pull_up, cues: ['nur einer'] });
    expect(de.cues).toEqual(pullUp.cues);
  });
});

describe('localizeNodes', () => {
  it('translates built-in nodes only, and returns the same array without translations', () => {
    const nodes = [pullUp, own];
    const de = localizeNodes(nodes, DE);
    expect(de.map((node) => node.name)).toEqual(['Klimmzug', 'Towel hang']);
    expect(localizeNodes(nodes, undefined)).toBe(nodes);
    expect(localizeNodes(nodes, {})[0]).toBe(pullUp);
  });
});
