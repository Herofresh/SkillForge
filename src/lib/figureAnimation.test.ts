import type { Pose } from './figure';
import {
  animationFrames,
  DEFAULT_STEPS,
  framePoses,
  stillFrame,
  type FigureAnimation,
} from './figureAnimation';
import { rasterizePose } from './figureRaster';

function standing(x: number): Pose {
  return {
    at: { x, y: 19 },
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
}

const A = standing(10);
const B = standing(20);

describe('framePoses', () => {
  it('moves through the keyframes in DEFAULT_STEPS frames each and loops back', () => {
    const poses = framePoses({ props: [], keyframes: [{ pose: A }, { pose: B }] });
    expect(poses).toHaveLength(2 * DEFAULT_STEPS);
    expect(poses[0]).toBe(A);
    expect(poses[DEFAULT_STEPS]).toBe(B);
    // In between, the hip moves from A towards B (eased, so the middle frame is exactly half).
    expect(poses[1].at.x).toBeGreaterThan(10);
    expect(poses[1].at.x).toBeLessThan(15);
    // And on the way back to A.
    expect(poses[DEFAULT_STEPS + 1].at.x).toBeLessThan(20);
  });

  it('repeats a keyframe for its hold and uses its own steps for the next move', () => {
    const poses = framePoses({
      props: [],
      steps: 2,
      keyframes: [{ pose: A, hold: 2, steps: 5 }, { pose: B }],
    });
    // A × 3, 4 in-betweens to B, B, 1 in-between back.
    expect(poses).toHaveLength(3 + 4 + 1 + 1);
    expect(poses.slice(0, 3)).toEqual([A, A, A]);
    expect(poses[7]).toBe(B);
  });

  it('gives one frame (plus holds) for a single keyframe', () => {
    expect(framePoses({ props: [], keyframes: [{ pose: A }] })).toEqual([A]);
    expect(framePoses({ props: [], keyframes: [{ pose: A, hold: 1 }] })).toEqual([A, A]);
  });
});

describe('animationFrames and stillFrame', () => {
  const animation: FigureAnimation = {
    props: [{ kind: 'floor' }],
    still: 1,
    keyframes: [{ pose: A }, { pose: B }],
  };

  it('rasterizes every frame with the props', () => {
    const frames = animationFrames(animation);
    expect(frames).toHaveLength(framePoses(animation).length);
    expect(frames[0]).toEqual(rasterizePose(A, animation.props));
  });

  it('shows the chosen keyframe as the still, the first by default', () => {
    expect(stillFrame(animation)).toEqual(rasterizePose(B, animation.props));
    expect(stillFrame({ ...animation, still: undefined })).toEqual(
      rasterizePose(A, animation.props),
    );
  });
});
