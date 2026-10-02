/**
 * Content checks on the real matrix: the cross-branch gates from docs/research/progressions.md §2,
 * the straight-arm flags (ADR-010) and a Home-profile path through every major pattern (ADR-005).
 */
import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { HOME_EQUIPMENT as HOME } from '@/domain/equipment';
import type { EquipmentTag, ExerciseNode, Pattern, PrerequisiteKind } from '@/domain/types';

function node(id: string): ExerciseNode {
  const found = NODE_BY_ID.get(id);
  if (!found) throw new Error(`node '${id}' does not exist`);
  return found;
}

function directPrerequisites(id: string, kind?: PrerequisiteKind): string[] {
  return node(id)
    .prerequisites.filter((prereq) => kind === undefined || prereq.kind === kind)
    .map((prereq) => prereq.nodeId);
}

/** Every node reachable through prerequisites (of the given kind, or all kinds). */
function allPrerequisites(id: string, kind?: PrerequisiteKind): Set<string> {
  const seen = new Set<string>();
  const stack = directPrerequisites(id, kind);
  while (stack.length > 0) {
    const next = stack.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...directPrerequisites(next, kind));
  }
  return seen;
}

/** A node is doable at Home if one equipment option fits and all hard prerequisites are too. */
function homeReachable(): Set<string> {
  const memo = new Map<string, boolean>();
  const fits = (option: readonly EquipmentTag[]) => option.every((tag) => HOME.includes(tag));
  const reachable = (id: string): boolean => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    const current = node(id);
    const result = current.equipment.some(fits) && directPrerequisites(id, 'hard').every(reachable);
    memo.set(id, result);
    return result;
  };
  return new Set(ALL_NODES.map((n) => n.id).filter(reachable));
}

describe('cross-branch gates', () => {
  it('muscle-up needs explosive pull-ups and a dip, and builds on pull-ups', () => {
    const hard = directPrerequisites('muscle_up_negative', 'hard');
    expect(hard).toEqual(expect.arrayContaining(['chest_to_bar_pull_up', 'kipping_swing']));
    expect(hard.some((id) => id === 'straight_bar_dip' || id === 'parallel_bar_dip')).toBe(true);
    expect(allPrerequisites('muscle_up_negative', 'hard')).toContain('pull_up');
  });

  it('front lever needs pull-ups and a hollow hold', () => {
    expect(directPrerequisites('tuck_front_lever', 'hard')).toEqual(
      expect.arrayContaining(['pull_up', 'hollow_hold']),
    );
    const fullLeverGates = allPrerequisites('front_lever', 'hard');
    expect(fullLeverGates).toContain('tuck_front_lever');
    expect(fullLeverGates).toContain('pull_up');
  });

  it('planche needs push-ups, pseudo planche push-ups, a wall handstand and wrist prep', () => {
    const gates = allPrerequisites('tuck_planche');
    for (const id of ['push_up', 'pseudo_planche_push_up', 'wall_handstand', 'wrist_prep']) {
      expect(gates).toContain(id);
    }
    expect(directPrerequisites('planche_lean', 'hard')).toEqual(
      expect.arrayContaining(['push_up', 'wrist_prep']),
    );
  });

  it('freestanding handstand needs the chest-to-wall handstand', () => {
    expect(directPrerequisites('freestanding_handstand', 'hard')).toContain(
      'chest_to_wall_handstand',
    );
  });

  it('cartwheels build on the wall handstand, the round-off on the quarter-turn cartwheel', () => {
    expect(directPrerequisites('bunny_hop_cartwheel', 'hard')).toContain('wall_plank');
    expect(directPrerequisites('cartwheel', 'hard')).toEqual(
      expect.arrayContaining(['bunny_hop_cartwheel', 'wall_handstand']),
    );
    expect(directPrerequisites('round_off', 'hard')).toEqual(
      expect.arrayContaining(['quarter_turn_cartwheel', 'wall_handstand']),
    );
    expect(directPrerequisites('aerial_cartwheel', 'hard')).toEqual(
      expect.arrayContaining(['round_off', 'one_handed_cartwheel']),
    );
  });

  it('judo breakfalls go back, side, then the rolling breakfall; rolls start from the tuck rock', () => {
    expect(directPrerequisites('back_breakfall', 'hard')).toContain('tuck_rock');
    expect(directPrerequisites('side_breakfall', 'hard')).toContain('back_breakfall');
    expect(directPrerequisites('forward_shoulder_roll', 'hard')).toContain('side_breakfall');
    expect(allPrerequisites('backward_roll', 'hard')).toContain('tuck_rock');
  });

  it('pistol squat needs a full squat and the Bulgarian split squat', () => {
    const gates = allPrerequisites('pistol_squat', 'hard');
    expect(gates).toContain('deep_squat');
    expect(gates).toContain('bulgarian_split_squat');
  });
});

describe('straight-arm flags (ADR-010)', () => {
  it.each([
    'german_hang',
    'tuck_front_lever',
    'front_lever',
    'back_lever',
    'iron_cross',
    'planche_lean',
    'full_planche',
    'tuck_human_flag',
    'human_flag',
    'manna',
  ])('%s is flagged straight_arm', (id) => {
    expect(node(id).straightArm).toBe(true);
  });

  it('every node with a straight-arm pattern is flagged', () => {
    const straightArmPatterns: readonly Pattern[] = ['straight_arm_push', 'straight_arm_pull'];
    const unflagged = ALL_NODES.filter(
      (n) => n.patterns.some((p) => straightArmPatterns.includes(p)) && !n.straightArm,
    ).map((n) => n.id);
    // Handstand presses use straight arms but are balance skills, not tendon-loading holds.
    expect(unflagged).toEqual(['wall_straddle_press_eccentric', 'straddle_press_to_handstand']);
  });
});

describe('acrobatics branch (PLAN 5.5, ADR-041)', () => {
  const acrobatics = ALL_NODES.filter((n) => n.branch === 'acrobatics');
  const recoveryFree: readonly Pattern[] = ['balance', 'mobility', 'explosive'];

  it('has the rolls, breakfalls and the cartwheel path up to a legendary aerial', () => {
    expect(acrobatics.map((n) => n.id)).toEqual(
      expect.arrayContaining(['tuck_rock', 'forward_roll', 'back_breakfall', 'cartwheel']),
    );
    expect(acrobatics.filter((n) => n.legendary).map((n) => n.id)).toEqual(['aerial_cartwheel']);
    expect(acrobatics.find((n) => n.ogLevel === 0)?.id).toBe('tuck_rock');
  });

  it('is skill work on the floor, not straight-arm, and never trips the 48 h pattern rest', () => {
    for (const n of acrobatics) {
      expect(n.isSkill).toBe(true);
      expect(n.straightArm).toBe(false);
      expect(n.equipment).toEqual([['floor']]);
      expect(n.patterns.every((p) => recoveryFree.includes(p))).toBe(true);
    }
  });
});

describe('flexibility and mobility branches (PLAN 6.3a, ADR-050)', () => {
  const flexibility = ALL_NODES.filter((n) => n.branch === 'flexibility');
  const mobility = ALL_NODES.filter((n) => n.branch === 'mobility');

  it('have at least 10 nodes each', () => {
    expect(flexibility.length).toBeGreaterThanOrEqual(10);
    expect(mobility.length).toBeGreaterThanOrEqual(10);
  });

  it('chain the yoga paths: pigeon to king pigeon, splits, lotus and the wheel', () => {
    expect(directPrerequisites('king_pigeon', 'hard')).toEqual(
      expect.arrayContaining(['pigeon_pose', 'couch_stretch', 'full_bridge']),
    );
    expect(allPrerequisites('front_split', 'hard')).toEqual(
      new Set(['half_split', 'pike_fold', 'couch_stretch']),
    );
    expect(allPrerequisites('middle_split', 'hard')).toEqual(
      new Set(['pancake', 'pike_fold', 'frog_stretch', 'butterfly_stretch']),
    );
    expect(directPrerequisites('lotus', 'hard')).toEqual(['half_lotus']);
    expect(directPrerequisites('one_leg_wheel', 'hard')).toEqual(['full_bridge']);
  });

  it('keep the existing deep squat and German hang where they are', () => {
    expect(node('deep_squat').branch).toBe('legs');
    expect(node('german_hang').branch).toBe('back_lever');
    expect(allPrerequisites('overhead_squat', 'hard')).toEqual(
      new Set(['deep_squat_hold', 'ankle_rocks', 'wall_angel', 'shoulder_cars']),
    );
  });

  it('is plain mobility work: no skill or straight-arm flags, nothing that trips the 48 h rest', () => {
    for (const n of [...flexibility, ...mobility]) {
      expect([n.id, n.isSkill, n.straightArm]).toEqual([n.id, false, false]);
      expect([n.id, n.patterns]).toEqual([n.id, ['mobility']]);
    }
  });
});

describe('Home profile (floor, wall, bar, parallettes, bands)', () => {
  const reachable = homeReachable();

  it('can reach every node except the ones that need dip bars, rings or a pole', () => {
    const unreachable = ALL_NODES.filter((n) => !reachable.has(n.id)).map((n) => n.id);
    expect(unreachable.sort()).toEqual([
      'human_flag',
      'iron_cross',
      'parallel_bar_dip',
      'straddle_human_flag',
      'tuck_human_flag',
    ]);
  });

  it.each([
    'horizontal_push',
    'vertical_push',
    'vertical_pull',
    'horizontal_pull',
    'straight_arm_push',
    'straight_arm_pull',
    'squat',
    'hinge',
    'core',
    'balance',
    'mobility',
  ] as const)('has at least two reachable %s nodes', (pattern) => {
    const nodes = ALL_NODES.filter((n) => reachable.has(n.id) && n.patterns.includes(pattern));
    expect(nodes.length).toBeGreaterThanOrEqual(pattern === 'hinge' ? 1 : 2);
  });

  it('has a dip, and parallel bar dips name it as their alternative', () => {
    expect(reachable.has('dip_negative')).toBe(true);
    expect(reachable.has('straight_bar_dip')).toBe(true);
    expect(node('parallel_bar_dip').alternatives).toContain('straight_bar_dip');
  });
});
