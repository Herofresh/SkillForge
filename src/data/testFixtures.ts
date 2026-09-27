/** Synthetic nodes and history for unit tests (validator, format, overlay, engine). Not app code. */
import type {
  ExerciseNode,
  LoggedSession,
  LoggedSet,
  Metric,
  SetPerformance,
} from '@/domain/types';

export const FIXTURE_SOURCE_URL = 'https://example.org/source';

/** A valid core node; override any field. */
export function makeNode(overrides: Partial<ExerciseNode> & { id: string }): ExerciseNode {
  return {
    name: overrides.id,
    branch: 'v_pull',
    chainOrder: 10,
    ogLevel: 1,
    metric: 'reps',
    workingRange: { min: 5, max: 8 },
    trial: { sets: 3, target: 8 },
    prerequisites: [],
    straightArm: false,
    isSkill: false,
    patterns: ['vertical_pull'],
    equipment: [['bar']],
    alternatives: [],
    cues: [],
    sourceUrls: [FIXTURE_SOURCE_URL],
    source: 'core',
    review: { status: 'draft' },
    ...overrides,
  };
}

/** A valid three-node chain: dead_hang -> negative -> pull_up. */
export function makeChain(): ExerciseNode[] {
  return [
    makeNode({ id: 'dead_hang', chainOrder: 10, ogLevel: 0 }),
    makeNode({
      id: 'pull_up_negative',
      chainOrder: 20,
      ogLevel: 2,
      prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard' }],
    }),
    makeNode({
      id: 'pull_up',
      chainOrder: 30,
      ogLevel: 2,
      prerequisites: [{ nodeId: 'pull_up_negative', minLevel: 5, kind: 'hard' }],
      regressionId: 'pull_up_negative',
    }),
  ];
}

/** A logged set that exactly meets an 8-rep prescription; override any field. */
export function makeSet(overrides: Partial<LoggedSet> & { nodeId: string }): LoggedSet {
  return {
    sessionId: 's1',
    setIndex: 0,
    metric: 'reps',
    prescribed: { value: 8 },
    actual: { value: 8 },
    isTrial: false,
    timestamp: 0,
    ...overrides,
  };
}

/**
 * A session at `startedAt` with `count` sets of `nodeId`, each prescribed and performed as given.
 * Set timestamps are `startedAt + setIndex` ms, set ids follow the session id.
 */
export function makeSession(
  id: string,
  startedAt: number,
  groups: {
    nodeId: string;
    count: number;
    metric?: Metric;
    prescribed?: SetPerformance;
    actual?: SetPerformance;
    isTrial?: boolean;
  }[],
): LoggedSession {
  const sets: LoggedSet[] = [];
  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      const setIndex = sets.length;
      sets.push(
        makeSet({
          sessionId: id,
          nodeId: group.nodeId,
          setIndex,
          timestamp: startedAt + setIndex,
          ...(group.metric ? { metric: group.metric } : {}),
          ...(group.prescribed ? { prescribed: group.prescribed } : {}),
          ...(group.actual ? { actual: group.actual } : {}),
          isTrial: group.isTrial ?? false,
        }),
      );
    }
  }
  return { id, startedAt, sets };
}
