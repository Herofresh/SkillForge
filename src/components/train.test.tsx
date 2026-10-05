import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Vibration } from 'react-native';

import { ALL_NODES } from '@/data/skills';
import { sessionPlan, startSession } from '@/domain/train';
import { blockViews, liveView, type SummaryView } from '@/domain/trainView';
import type { SafeguardWarning, WorkoutPlan } from '@/domain/types';

import { SetTimerPanel } from './timer/SetTimerPanel';
import { CUE_VIBRATIONS } from './timer/vibration';
import { ExerciseCard } from './train/ExerciseCard';
import { RestPanel } from './train/RestPanel';
import { SessionResultPanels } from './train/SessionResultPanels';
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
  restPace: 1,
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

const timerHandlers = () => ({
  onStartTimer: jest.fn(),
  onStopTimer: jest.fn(() => undefined),
  onPauseTimer: jest.fn(),
  onResumeTimer: jest.fn(),
  onResetTimer: jest.fn(),
});

describe('SetLogger', () => {
  it('steps from the target and logs with a mark', async () => {
    const user = userEvent.setup();
    const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    const current = liveView({ ...session, currentKey: 'e1' }, LOOKUP).current!;
    const onLog = jest.fn();
    await render(
      <SetLogger
        node={LOOKUP.get('pull_up')!}
        current={current}
        onLog={onLog}
        {...timerHandlers()}
      />,
    );
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
        {...timerHandlers()}
      />,
    );
    expect(screen.getByText('Acknowledge first')).toBeOnTheScreen();
    await user.press(screen.getByTestId('log-set'));
    expect(onLog).not.toHaveBeenCalled();
  });
  it('starts the timer, and a stopped hold fills the stepper with the seconds held', async () => {
    const user = userEvent.setup();
    const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    const current = liveView(session, LOOKUP).current!;
    const handlers = { ...timerHandlers(), onStopTimer: jest.fn(() => 37) };
    const props = { node: LOOKUP.get('tuck_planche')!, current, onLog: jest.fn(), ...handlers };
    const view = await render(<SetLogger {...props} />);
    expect(screen.getByTestId('set-timer-start')).toHaveTextContent('Start hold');
    await user.press(screen.getByTestId('set-timer-start'));
    expect(handlers.onStartTimer).toHaveBeenCalled();

    // 3 s get ready + 30 s target + 12 s over.
    const startedAt = Date.now() - 45_000;
    await view.rerender(<SetLogger {...props} timer={{ startedAt }} />);
    expect(screen.getByTestId('set-timer-clock')).toHaveTextContent('+12 s');
    await user.press(screen.getByTestId('set-timer-stop'));
    expect(handlers.onStopTimer).toHaveBeenCalled();
    expect(screen.getByTestId('set-stepper-value')).toHaveTextContent('37 s');
  });

  it('shows the logged sets with their time', async () => {
    const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    const withSet = {
      ...session,
      currentKey: 'e1',
      sets: [
        {
          sessionId: 's',
          nodeId: 'pull_up',
          setIndex: 0,
          metric: 'reps' as const,
          prescribed: { value: 5 },
          actual: { value: 8 },
          isTrial: false,
          timestamp: 1,
          exerciseKey: 'e1',
          durationSec: 42,
        },
      ],
    };
    const current = liveView(withSet, LOOKUP).current!;
    await render(
      <SetLogger
        node={LOOKUP.get('pull_up')!}
        current={current}
        onLog={jest.fn()}
        {...timerHandlers()}
      />,
    );
    expect(screen.getByTestId('logged-set-0')).toHaveTextContent('Set 1: 8 reps · 0:42');
    expect(screen.getByTestId('set-timer-start')).toHaveTextContent('Start set');
  });
});

describe('SetTimerPanel', () => {
  const NOW = 1_790_000_000_000;
  const handlers = () => ({
    onStart: jest.fn(),
    onStop: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onReset: jest.fn(),
  });
  /** Lets the screen clock tick once a second, like on a phone. */
  const tick = async (seconds: number) => {
    for (let i = 0; i < seconds; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(1_000);
      });
    }
  };
  let vibrate: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    vibrate = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  });
  afterEach(() => {
    vibrate.mockRestore();
    jest.useRealTimers();
  });

  it('gets ready, buzzes at go, counts the hold down, buzzes at the target and counts on', async () => {
    await render(
      <SetTimerPanel
        metric="hold_s"
        targetSec={10}
        timer={{ startedAt: NOW }}
        testID="t"
        {...handlers()}
      />,
    );
    expect(screen.getByTestId('t-clock')).toHaveTextContent('3');
    expect(screen.getByText('Get ready')).toBeOnTheScreen();
    expect(screen.queryByTestId('t-stop')).toBeNull();
    expect(screen.getByTestId('t-pause')).toHaveTextContent('Pause');

    await tick(2);
    expect(vibrate).not.toHaveBeenCalled();
    await tick(1);
    expect(screen.getByText('Hold')).toBeOnTheScreen();
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenLastCalledWith(CUE_VIBRATIONS.go);

    await tick(2);
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:08');
    expect(screen.getByTestId('t-stop')).toHaveTextContent('Stop');
    expect(vibrate).toHaveBeenCalledTimes(1);

    await tick(8);
    expect(screen.getByText('Target reached')).toBeOnTheScreen();
    expect(screen.getByTestId('t-clock')).toHaveTextContent('+0 s');
    expect(vibrate).toHaveBeenCalledTimes(2);
    expect(vibrate).toHaveBeenLastCalledWith(CUE_VIBRATIONS.target);

    await tick(7);
    expect(screen.getByTestId('t-clock')).toHaveTextContent('+7 s');
    expect(vibrate).toHaveBeenCalledTimes(2);
  });

  it('does not buzz for a moment that passed while the screen was away', async () => {
    await render(
      <SetTimerPanel
        metric="hold_s"
        targetSec={10}
        timer={{ startedAt: NOW }}
        testID="t"
        {...handlers()}
      />,
    );
    // One long gap (the app in the background) jumps past "go" and the target.
    await act(async () => {
      jest.setSystemTime(NOW + 20_000);
      jest.advanceTimersByTime(1_000);
    });
    expect(screen.getByText('Target reached')).toBeOnTheScreen();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('pauses: the clock stands still, Resume shows, and a resumed timer runs on', async () => {
    const actions = handlers();
    const view = await render(
      <SetTimerPanel
        metric="hold_s"
        targetSec={30}
        timer={{ startedAt: NOW - 13_000 }}
        testID="t"
        {...actions}
      />,
    );
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:20');
    await fireEvent.press(screen.getByTestId('t-pause'));
    expect(actions.onPause).toHaveBeenCalled();

    await view.rerender(
      <SetTimerPanel
        metric="hold_s"
        targetSec={30}
        timer={{ startedAt: NOW - 13_000, pausedAt: NOW }}
        testID="t"
        {...actions}
      />,
    );
    await tick(5);
    expect(screen.getByText('Paused')).toBeOnTheScreen();
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:20');
    expect(screen.getByTestId('t-stop')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('t-resume'));
    expect(actions.onResume).toHaveBeenCalled();

    await view.rerender(
      <SetTimerPanel
        metric="hold_s"
        targetSec={30}
        timer={{ startedAt: NOW - 13_000, pausedMs: 5_000 }}
        testID="t"
        {...actions}
      />,
    );
    expect(screen.getByText('Hold')).toBeOnTheScreen();
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:20');
    await tick(2);
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:18');
    expect(screen.getByTestId('t-pause')).toBeOnTheScreen();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('runs a stopwatch with Done and Cancel', async () => {
    const actions = handlers();
    await render(
      <SetTimerPanel
        metric="reps"
        targetSec={8}
        timer={{ startedAt: NOW - 42_000 }}
        testID="t"
        {...actions}
      />,
    );
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:42');
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:43');
    expect(screen.getByTestId('t-stop')).toHaveTextContent('Done');
    expect(screen.getByTestId('t-reset')).toHaveTextContent('Cancel');
    await fireEvent.press(screen.getByTestId('t-stop'));
    expect(actions.onStop).toHaveBeenCalled();
  });

  it('shows what a stopped timer measured, with a reset', async () => {
    await render(
      <SetTimerPanel
        metric="hold_s"
        targetSec={30}
        timer={{ startedAt: NOW - 60_000, stoppedAt: NOW - 20_000 }}
        testID="t"
        {...handlers()}
      />,
    );
    expect(screen.getByText('Held')).toBeOnTheScreen();
    expect(screen.getByTestId('t-clock')).toHaveTextContent('0:37');
    expect(screen.getByTestId('t-reset')).toHaveTextContent('Reset timer');
  });
});

describe('RestPanel', () => {
  const NOW = 1_790_000_000_000;
  const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', NOW);

  beforeEach(() => jest.useFakeTimers({ now: NOW }));
  afterEach(() => jest.useRealTimers());

  it('buzzes once when the rest countdown reaches zero on screen (PLAN 5.8)', async () => {
    const vibrate = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
    await render(
      <RestPanel session={{ ...session, restEndsAt: NOW + 2_000 }} onSkip={jest.fn()} />,
    );
    expect(screen.getByTestId('rest-countdown')).toBeOnTheScreen();
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(vibrate).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(screen.queryByTestId('rest-panel')).toBeNull();
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenLastCalledWith(CUE_VIBRATIONS.rest_end);
    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });
    expect(vibrate).toHaveBeenCalledTimes(1);
    vibrate.mockRestore();
  });

  it('stays quiet for a rest that was over before the screen opened', async () => {
    const vibrate = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
    await render(
      <RestPanel session={{ ...session, restEndsAt: NOW - 5_000 }} onSkip={jest.fn()} />,
    );
    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    expect(screen.queryByTestId('rest-panel')).toBeNull();
    expect(vibrate).not.toHaveBeenCalled();
    vibrate.mockRestore();
  });
});

describe('SessionResultPanels', () => {
  it('shows the session time and the time per exercise', async () => {
    const view: SummaryView = {
      totalXp: 10,
      exerciseXp: 8,
      completionBonus: 1,
      streakBonus: 1,
      challengeBonus: 0,
      streak: 1,
      exercises: [
        {
          nodeId: 'pull_up',
          name: 'Pull-up',
          outcome: 'success',
          outcomeLabel: 'Success',
          xp: 8,
          trialAttempted: false,
          trialPassed: false,
          time: '1:24',
        },
      ],
      sessionTime: '32:05',
      levelUps: [],
      unlocked: [],
      warnings: [],
    };
    await render(
      <SessionResultPanels
        view={view}
        celebrate={false}
        playKey="s"
        subtitle="Session"
        onOpenNode={jest.fn()}
      />,
    );
    expect(screen.getByTestId('summary-session-time')).toHaveTextContent('Session time 32:05');
    expect(screen.getByText('Success · 1:24')).toBeOnTheScreen();
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
