/**
 * The exercise animations (PLAN 6.4, ADR-053): one source of truth, as typed data in this folder.
 * A node with its own animation shows it; any other node (built-in or the user's own) shows the
 * generic animation of its first movement pattern.
 */
import { PATTERNS, type ExerciseNode, type Pattern } from '@/domain/types';
import type { FigureAnimation } from '@/lib/figureAnimation';

import { PATTERN_ANIMATIONS } from './generic';
import { ICONIC_ANIMATIONS } from './iconic';
import { V_PULL_ANIMATIONS } from './v_pull';

export { PATTERN_ANIMATIONS };

/** Per-node animations by node id. */
export const NODE_ANIMATIONS: Readonly<Record<string, FigureAnimation>> = {
  ...V_PULL_ANIMATIONS,
  ...ICONIC_ANIMATIONS,
};

/** Used when a (user) node lists no pattern at all. */
export const FALLBACK_PATTERN: Pattern = 'core';

export interface ResolvedAnimation {
  /** Stable cache key: `node:<id>` or `pattern:<pattern>`. */
  key: string;
  animation: FigureAnimation;
  /** Whether the node has its own animation or shows its pattern's. */
  source: 'node' | 'pattern';
}

/** The animation `node` shows: its own, else its first pattern's. */
export function animationFor(node: Pick<ExerciseNode, 'id' | 'patterns'>): ResolvedAnimation {
  const own = Object.prototype.hasOwnProperty.call(NODE_ANIMATIONS, node.id)
    ? NODE_ANIMATIONS[node.id]
    : undefined;
  if (own) return { key: `node:${node.id}`, animation: own, source: 'node' };
  const pattern = node.patterns[0] ?? FALLBACK_PATTERN;
  return { key: `pattern:${pattern}`, animation: PATTERN_ANIMATIONS[pattern], source: 'pattern' };
}

/** Every animation, per-node ones first, then the pattern ones: the dev Style Guide's preview. */
export const ANIMATION_CATALOGUE: readonly (ResolvedAnimation & { label: string })[] = [
  ...Object.entries(NODE_ANIMATIONS).map(([id, animation]) => ({
    label: id,
    key: `node:${id}`,
    animation,
    source: 'node' as const,
  })),
  ...PATTERNS.map((pattern) => ({
    label: `${pattern} (generic)`,
    key: `pattern:${pattern}`,
    animation: PATTERN_ANIMATIONS[pattern],
    source: 'pattern' as const,
  })),
];
