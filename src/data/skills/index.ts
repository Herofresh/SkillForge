/**
 * The built-in progression matrix as the app sees it. Content is edited in
 * `content/progressions/*.yaml` and compiled into `progressions.generated.ts` by
 * `npm run progressions:build` (ADR-016); nothing parses YAML at runtime.
 */
import type { ExerciseNode } from '@/domain/types';

import { GENERATED_NODES } from './progressions.generated';

/** Every built-in node, sorted by branch, then chainOrder. */
export const ALL_NODES: readonly ExerciseNode[] = GENERATED_NODES;

export const NODE_BY_ID: ReadonlyMap<string, ExerciseNode> = new Map(
  ALL_NODES.map((node) => [node.id, node]),
);
