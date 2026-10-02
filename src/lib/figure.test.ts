import {
  BONES,
  ease,
  hipOf,
  interpolatePose,
  jointsOf,
  lerpAngle,
  solveLimb,
  type Point,
  type Pose,
} from './figure';

const STAND: Pose = {
  at: { x: 16, y: 19 },
  torso: -90,
  arms: [
    [90, 90],
    [90, 90],
  ],
  legs: [
    [90, 90],
    [90, 90],
  ],
};

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function expectPoint(actual: Point, expected: Point) {
  expect(actual.x).toBeCloseTo(expected.x, 5);
  expect(actual.y).toBeCloseTo(expected.y, 5);
}

describe('jointsOf', () => {
  it('stacks the bones of a standing figure straight up and down from the hip', () => {
    const j = jointsOf(STAND);
    expectPoint(j.hip, { x: 16, y: 19 });
    expectPoint(j.neck, { x: 16, y: 19 - BONES.torso });
    expectPoint(j.head, { x: 16, y: 19 - BONES.torso - BONES.neck });
    expectPoint(j.knee, { x: 16, y: 19 + BONES.thigh });
    expectPoint(j.ankle, { x: 16, y: 19 + BONES.thigh + BONES.shin });
    expectPoint(j.hand, { x: 16, y: 19 - BONES.torso + BONES.upperArm + BONES.forearm });
  });

  it('flexes the feet forward by default and points them along the shin on request', () => {
    const flexed = jointsOf(STAND);
    expectPoint(flexed.toe, { x: 16 + BONES.foot, y: flexed.ankle.y });
    const pointed = jointsOf({ ...STAND, feet: 'point' });
    expectPoint(pointed.toe, { x: 16, y: pointed.ankle.y + BONES.foot });
  });

  it('places the figure so the anchor joint sits at `at`', () => {
    const hanging: Pose = {
      ...STAND,
      arms: [
        [-90, -90],
        [-90, -90],
      ],
      anchor: 'hand',
      at: { x: 10, y: 4 },
    };
    const j = jointsOf(hanging);
    expectPoint(j.hand, { x: 10, y: 4 });
    expectPoint(hipOf(hanging), j.hip);
    expect(j.hip.y).toBeCloseTo(4 + BONES.forearm + BONES.upperArm + BONES.torso, 5);
  });
});

describe('lerpAngle', () => {
  it('takes the shorter way round', () => {
    expect(lerpAngle(170, -170, 0.5)).toBeCloseTo(180, 5);
    expect(lerpAngle(-90, 180, 0.5)).toBeCloseTo(-135, 5);
    expect(lerpAngle(0, 90, 0.25)).toBeCloseTo(22.5, 5);
  });
});

describe('interpolatePose', () => {
  const top: Pose = {
    ...STAND,
    arms: [
      [30, -80],
      [30, -80],
    ],
    anchor: 'hand',
    at: { x: 16, y: 4 },
  };
  const bottom: Pose = {
    ...STAND,
    arms: [
      [-90, -90],
      [-90, -90],
    ],
    anchor: 'hand',
    at: { x: 16, y: 4 },
  };

  it('returns the end poses at t = 0 and t = 1', () => {
    expect(jointsOf(interpolatePose(top, bottom, 0)).neck.y).toBeCloseTo(jointsOf(top).neck.y, 5);
    expect(jointsOf(interpolatePose(top, bottom, 1)).neck.y).toBeCloseTo(
      jointsOf(bottom).neck.y,
      5,
    );
  });

  it('keeps a shared anchor joint in place on the way (hands stay on the bar)', () => {
    for (const t of [0.25, 0.5, 0.75]) {
      expectPoint(jointsOf(interpolatePose(top, bottom, t)).hand, { x: 16, y: 4 });
    }
  });

  it('moves the hip in a straight line when the anchors differ', () => {
    const standing: Pose = { ...STAND, anchor: 'ankle', at: { x: 16, y: 29 } };
    const mid = interpolatePose(standing, bottom, 0.5);
    const expected = {
      x: (hipOf(standing).x + hipOf(bottom).x) / 2,
      y: (hipOf(standing).y + hipOf(bottom).y) / 2,
    };
    expectPoint(hipOf(mid), expected);
  });
});

describe('ease', () => {
  it('starts and ends still and passes the middle at half', () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBe(0.5);
  });
});

describe('solveLimb', () => {
  const start = { x: 10, y: 10 };

  function endOf(limb: readonly [number, number], upper: number, lower: number): Point {
    const rad = Math.PI / 180;
    const elbow = {
      x: start.x + Math.cos(limb[0] * rad) * upper,
      y: start.y + Math.sin(limb[0] * rad) * upper,
    };
    return {
      x: elbow.x + Math.cos(limb[1] * rad) * lower,
      y: elbow.y + Math.sin(limb[1] * rad) * lower,
    };
  }

  it('reaches a target within range, with the middle joint on the chosen side', () => {
    const target = { x: 10, y: 16 };
    const knee = solveLimb(start, target, 5, 5, -1);
    expectPoint(endOf(knee, 5, 5), target);
    // Straight down with bend -1: the knee goes forward (right).
    expect(Math.cos((knee[0] * Math.PI) / 180)).toBeGreaterThan(0);
    const elbow = solveLimb(start, target, 5, 5, 1);
    expect(Math.cos((elbow[0] * Math.PI) / 180)).toBeLessThan(0);
  });

  it('straightens towards a target out of reach', () => {
    const limb = solveLimb(start, { x: 30, y: 10 }, 4, 3.6, 1);
    expect(limb[0]).toBeCloseTo(0, 5);
    expect(limb[1]).toBeCloseTo(0, 5);
    expect(distance(endOf(limb, 4, 3.6), start)).toBeCloseTo(7.6, 5);
  });
});
