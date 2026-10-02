import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { PATTERNS } from '@/domain/types';
import { BONES, FIGURE_GRID, JOINTS, jointsOf } from '@/lib/figure';
import { framePoses, MAX_KEYFRAMES, type FigureAnimation } from '@/lib/figureAnimation';
import { FLOOR_Y } from '@/lib/figureRaster';

import {
  ANIMATION_CATALOGUE,
  animationFor,
  FALLBACK_PATTERN,
  NODE_ANIMATIONS,
  PATTERN_ANIMATIONS,
} from '.';

/** Nodes PLAN 6.4a animates on their own besides the whole v_pull branch. */
const ICONIC_IDS = ['push_up', 'squat', 'freestanding_handstand', 'front_lever', 'full_planche'];
/** Branches PLAN 6.4b-2 animates node by node (the iconic nodes among them stay in iconic.ts). */
const PUSH_LEGS_BRANCHES = ['h_push', 'v_push', 'planche', 'handstand', 'legs'];
/** How far (cells) a gripping hand may sit from the centre of its bar or ring. */
const GRIP_TOLERANCE = 1.5;
/** Joints may poke this far into the floor's top row (feet and hands rest on it). */
const FLOOR_SLACK = 0.5;

describe('exercise animation data (PLAN 6.4a)', () => {
  it('only animates nodes that exist', () => {
    for (const id of Object.keys(NODE_ANIMATIONS)) expect(NODE_BY_ID.has(id)).toBe(true);
  });

  it('animates every vertical pull node and the iconic skills on their own', () => {
    const vPull = ALL_NODES.filter((node) => node.branch === 'v_pull');
    expect(vPull.length).toBeGreaterThanOrEqual(10);
    for (const node of vPull) expect(animationFor(node).source).toBe('node');
    for (const id of ICONIC_IDS) expect(NODE_ANIMATIONS[id]).toBeDefined();
  });

  it.each(PUSH_LEGS_BRANCHES)('animates every %s node on its own (6.4b-2)', (branch) => {
    const nodes = ALL_NODES.filter((node) => node.branch === branch);
    expect(nodes.length).toBeGreaterThanOrEqual(10);
    for (const node of nodes) expect(animationFor(node).source).toBe('node');
  });

  it('animates every node of the bar branches on its own (PLAN 6.4b-1)', () => {
    const branches = ['h_pull', 'front_lever', 'back_lever', 'dynamic', 'core'];
    const nodes = ALL_NODES.filter((node) => branches.includes(node.branch));
    expect(nodes.length).toBeGreaterThanOrEqual(50);
    for (const node of nodes) {
      expect([node.id, animationFor(node).source]).toEqual([node.id, 'node']);
    }
  });

  it.each(['flexibility', 'mobility', 'acrobatics'])(
    'animates every %s node on its own (PLAN 6.4b-3)',
    (branch) => {
      const nodes = ALL_NODES.filter((node) => node.branch === branch);
      expect(nodes.length).toBeGreaterThanOrEqual(10);
      for (const node of nodes) expect(animationFor(node).source).toBe('node');
    },
  );

  it('resolves every built-in node to an animation, its pattern when it has none', () => {
    for (const node of ALL_NODES) {
      const resolved = animationFor(node);
      if (resolved.source === 'pattern') {
        expect(resolved.animation).toBe(PATTERN_ANIMATIONS[node.patterns[0]]);
        expect(resolved.key).toBe(`pattern:${node.patterns[0]}`);
      } else {
        expect(resolved.key).toBe(`node:${node.id}`);
      }
    }
  });

  it("resolves the user's own nodes by pattern, and one without patterns to the fallback", () => {
    expect(animationFor({ id: 'user_abc', patterns: ['squat'] }).key).toBe('pattern:squat');
    expect(animationFor({ id: 'user_abc', patterns: [] }).key).toBe(`pattern:${FALLBACK_PATTERN}`);
    // Object keys like "constructor" are not animations.
    expect(animationFor({ id: 'constructor', patterns: ['core'] }).source).toBe('pattern');
  });

  it('has a generic animation for every pattern', () => {
    for (const pattern of PATTERNS) expect(PATTERN_ANIMATIONS[pattern]).toBeDefined();
  });

  it('lists every animation once in the Style Guide catalogue', () => {
    const keys = ANIMATION_CATALOGUE.map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(Object.keys(NODE_ANIMATIONS).length + PATTERNS.length);
  });

  describe.each(ANIMATION_CATALOGUE.map((entry) => [entry.label, entry.animation] as const))(
    '%s',
    (_label, animation: FigureAnimation) => {
      it('has 1–4 keyframes and a valid still', () => {
        expect(animation.keyframes.length).toBeGreaterThanOrEqual(1);
        expect(animation.keyframes.length).toBeLessThanOrEqual(MAX_KEYFRAMES);
        expect(animation.keyframes[animation.still ?? 0]).toBeDefined();
      });

      it('keeps the figure inside the frame and above the floor in every frame', () => {
        const hasFloor = animation.props.some((prop) => prop.kind === 'floor');
        for (const pose of framePoses(animation)) {
          const j = jointsOf(pose);
          for (const joint of JOINTS) {
            expect(j[joint].x).toBeGreaterThanOrEqual(0);
            expect(j[joint].x).toBeLessThanOrEqual(FIGURE_GRID);
            expect(j[joint].y).toBeGreaterThanOrEqual(0);
            if (hasFloor) expect(j[joint].y).toBeLessThanOrEqual(FLOOR_Y + FLOOR_SLACK);
          }
          expect(j.head.y - BONES.headRadius).toBeGreaterThanOrEqual(0);
        }
      });

      it('keeps pinned hands on the bar or ring they hold', () => {
        const grips = animation.props.flatMap((prop) =>
          prop.kind === 'bar' || prop.kind === 'rings' ? [{ x: prop.x, y: prop.y }] : [],
        );
        if (grips.length === 0) return;
        for (const pose of framePoses(animation)) {
          if (pose.anchor !== 'hand') continue;
          const hand = jointsOf(pose).hand;
          const nearest = Math.min(...grips.map((g) => Math.hypot(g.x - hand.x, g.y - hand.y)));
          expect(nearest).toBeLessThanOrEqual(GRIP_TOLERANCE);
        }
      });
    },
  );
});
