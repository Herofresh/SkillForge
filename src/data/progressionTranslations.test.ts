import { makeNode } from '@/data/testFixtures';
import { formatIssue } from '@/data/validate';

import {
  buildTranslations,
  parseTranslationFile,
  renderTranslationsModule,
  translationFilePath,
} from './progressionTranslations';

const nodes = [
  makeNode({
    id: 'dead_hang',
    branch: 'v_pull',
    name: 'Dead hang',
    cues: ['Full grip.'],
  }),
  makeNode({
    id: 'pull_up',
    branch: 'v_pull',
    name: 'Pull-up',
    chainOrder: 20,
    cues: ['Start from a dead hang.', 'Chin over the bar.'],
    prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard', note: 'Grip first.' }],
  }),
];

const GOOD = `branch: v_pull
nodes:
  - id: dead_hang
    name: "Dead Hang"
    description: "Einfach hängen."
    cues:
      - "Voller Griff."
  - id: pull_up
    name: "Klimmzug"
    description: "Zieh dich hoch."
    cues:
      - "Starte aus dem Dead Hang."
      - "Kinn über die Stange."
    prerequisite_notes:
      dead_hang: "Erst der Griff."
`;

describe('parseTranslationFile (PLAN 7.8 FB-8)', () => {
  it('reads names, descriptions, cues and notes', () => {
    const parsed = parseTranslationFile(GOOD, 'de/v_pull.yaml');
    expect(parsed.issues).toEqual([]);
    expect(parsed.branch).toBe('v_pull');
    expect(parsed.nodes.get('pull_up')).toEqual({
      name: 'Klimmzug',
      description: 'Zieh dich hoch.',
      cues: ['Starte aus dem Dead Hang.', 'Kinn über die Stange.'],
      prerequisiteNotes: { dead_hang: 'Erst der Griff.' },
    });
    expect(parsed.nodes.get('dead_hang')?.prerequisiteNotes).toBeUndefined();
  });

  it('reports empty texts, unknown fields, over-long texts and syntax errors in plain words', () => {
    const bad = `branch: v_pull
nodes:
  - id: dead_hang
    name: ""
    description: "${'x'.repeat(301)}"
    og_level: 3
    cues:
      - "${'y'.repeat(121)}"
`;
    const { issues } = parseTranslationFile(bad, 'de/v_pull.yaml');
    const messages = issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining("unknown field 'og_level'"),
        'name must be a non-empty text',
        expect.stringContaining('description is 301 characters'),
        expect.stringContaining('cue #1 is 121 characters'),
      ]),
    );
    expect(parseTranslationFile('nodes: [', 'de/v_pull.yaml').issues[0].message).toMatch(
      /YAML syntax/,
    );
    expect(parseTranslationFile('branch: v_pull\n', 'de/v_pull.yaml').issues[0].message).toMatch(
      /needs 'branch: <id>' and a 'nodes:' list/,
    );
  });
});

describe('buildTranslations', () => {
  const files = (text: string) => [{ path: translationFilePath('de', 'v_pull'), text }];

  it('accepts a complete branch file and lists every other branch as missing', () => {
    const { translations, issues } = buildTranslations(files(GOOD), nodes);
    expect(translations.de?.pull_up?.name).toBe('Klimmzug');
    expect(issues.every((issue) => issue.message === 'file is missing')).toBe(true);
    expect(issues.map((issue) => issue.file)).not.toContain(translationFilePath('de', 'v_pull'));
  });

  it('checks ids, cue counts and prerequisite notes against the English nodes', () => {
    const text = `branch: v_pull
nodes:
  - id: dead_hang
    name: "Dead Hang"
    description: "Hängen."
  - id: pull_up
    name: "Klimmzug"
    description: "Hoch."
    cues:
      - "Nur ein Hinweis."
    prerequisite_notes:
      hollow_hold: "Gibt es nicht."
  - id: nope
    name: "Nein"
    description: "Nein."
`;
    const { issues } = buildTranslations(files(text), nodes);
    const ours = issues
      .filter((issue) => issue.message !== 'file is missing')
      .map((issue) => formatIssue(issue));
    expect(ours).toEqual([
      expect.stringContaining('dead_hang: has 0 cues but the English node has 1'),
      expect.stringContaining('pull_up: has 1 cues but the English node has 2'),
      expect.stringContaining("pull_up: has a note for 'hollow_hold'"),
      expect.stringContaining("pull_up: is missing the note for its prerequisite 'dead_hang'"),
      expect.stringContaining('nope: is not a node of the v_pull branch'),
    ]);
  });

  it('renders a stable module, nodes sorted by id', () => {
    const { translations } = buildTranslations(files(GOOD), nodes);
    const text = renderTranslationsModule(translations);
    expect(text).toContain('GENERATED FILE');
    expect(text.indexOf('"dead_hang"')).toBeLessThan(text.indexOf('"pull_up"'));
    expect(text).toContain('"name": "Klimmzug"');
  });
});
