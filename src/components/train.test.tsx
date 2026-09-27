import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { sessionPlan, startSession } from '@/domain/train';
import { blockViews, liveView } from '@/domain/trainView';
import type { SafeguardWarning, WorkoutPlan } from '@/domain/types';

import { ExerciseCard } from './train/ExerciseCard';
import { SetLogger } from './train/SetLogger';
import { TrainWarningList } from './train/TrainWarningList';

const LOOKUP = new Map(ALL_NODES.map((node) => [node.id, node]));

const WORKOUT: WorkoutPlan = {
  blocks: [
    {
      kind: 'skill',
      exercises: [
        {
          nodeId: 'tuck_planche',
          sets: 3,
          target: { value: 30 },
          metric: 'hold_s',
          restSec: 180,
          isTrial: true,
        },
      ],
    },
    {
      kind: 'strength',
      exercises: [
        { nodeId: 'pull_up', sets: 3, target: { value: 5 }, metric: 'reps', restSec: 90 },
      ],
    },
  ],
  estimatedMinutes: 10,
  warnings: [],
  notes: [],
};

describe('ExerciseCard', () => {
  it('shows the prescription, rest and markers', async () => {
    const [skill] = blockViews(sessionPlan(WORKOUT, 'home', 30).exercises, LOOKUP);
    await render(<ExerciseCard exercise={skill.exercises[0]} testID="card" />);
    expect(screen.getByTestId('card-prescription')).toHaveTextContent('3 × 30 s · 3 min rest');
    expect(screen.getByText('Trial')).toBeOnTheScreen();
    expect(screen.getByText('Straight-arm')).toBeOnTheScreen();
  });
});

describe('SetLogger', () => {
  it('steps from the target and logs with a mark', async () => {
    const user = userEvent.setup();
    const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    const current = liveView({ ...session, currentKey: 'e1' }, LOOKUP).current!;
    const onLog = jest.fn();
    await render(<SetLogger node={LOOKUP.get('pull_up')!} current={current} onLog={onLog} />);
    expect(screen.getByTestId('set-label')).toHaveTextContent('Set 1 of 3');
    await user.press(screen.getByTestId('set-stepper-plus'));
    expect(screen.getByTestId('set-stepper-value')).toHaveTextContent('6 reps');
    await user.press(screen.getByTestId('log-set-partial'));
    expect(onLog).toHaveBeenCalledWith({ value: 6 }, 'partial');
  });

  it('waits for the warnings to be acknowledged', async () => {
    const user = userEvent.setup();
    const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    const current = liveView(session, LOOKUP).current!;
    const onLog = jest.fn();
    await render(
      <SetLogger
        node={LOOKUP.get('tuck_planche')!}
        current={current}
        onLog={onLog}
        pendingNote="Acknowledge first"
      />,
    );
    expect(screen.getByText('Acknowledge first')).toBeOnTheScreen();
    await user.press(screen.getByTestId('log-set'));
    expect(onLog).not.toHaveBeenCalled();
  });
});

describe('TrainWarningList', () => {
  it('acknowledges by warning key', async () => {
    const user = userEvent.setup();
    const warnings: SafeguardWarning[] = [
      { code: 'straight_arm_rest', message: 'Rest 48 h', severity: 'warning' },
      { code: 'prerequisites_unmet', nodeId: 'x', message: 'Build up', severity: 'info' },
    ];
    const onAcknowledge = jest.fn();
    await render(
      <TrainWarningList
        warnings={warnings}
        acknowledged={['straight_arm_rest:']}
        onAcknowledge={onAcknowledge}
        testIDPrefix="w"
      />,
    );
    expect(screen.getByTestId('w-0-acknowledged')).toBeOnTheScreen();
    await user.press(screen.getByTestId('w-1-acknowledge'));
    expect(onAcknowledge).toHaveBeenCalledWith('prerequisites_unmet:x');
  });
});
