/**
 * The real dataset: every YAML file in content/progressions/ must be valid, and the committed
 * generated files must match the YAML. If this fails after editing YAML, run
 * `npm run progressions:build` and commit the result.
 */
import { formatIssue } from '@/data/validate';
import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { BRANCHES } from '@/domain/types';

import { buildFromDisk, readRepoFile } from '../../../scripts/progressionSources';

const { result, outputs } = buildFromDisk();

describe('progression dataset', () => {
  it('has no problems in content/progressions/*.yaml', () => {
    expect(result.issues.map(formatIssue)).toEqual([]);
  });

  it.each(outputs.map((output) => [output.path, output]))(
    '%s is up to date (run `npm run progressions:build`)',
    (_path, output) => {
      expect(readRepoFile(output.path)).toBe(output.expected);
    },
  );

  it('exports every node from the generated module', () => {
    expect(ALL_NODES).toEqual(result.nodes);
    expect(NODE_BY_ID.size).toBe(ALL_NODES.length);
  });

  it('describes every node in 1-3 sentences that are not a copy of its cues (PLAN 6.2)', () => {
    const MAX_SENTENCES = 3;
    for (const node of ALL_NODES) {
      const sentences = node.description.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect([node.id, sentences.length <= MAX_SENTENCES]).toEqual([node.id, true]);
      expect([node.id, node.description.trim().length > 0]).toEqual([node.id, true]);
      for (const cue of node.cues) expect(node.description).not.toContain(cue);
    }
  });

  it('has at least one node in every branch', () => {
    for (const branch of BRANCHES) {
      expect(ALL_NODES.some((node) => node.branch === branch)).toBe(true);
    }
  });
});
