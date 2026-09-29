import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { defaultTrialResults } from '@/domain/assessment';
import type { ExerciseNode } from '@/domain/types';

import { TrialSetsPanel } from './trial/TrialParts';

const node = (id: string): ExerciseNode => ALL_NODES.find((entry) => entry.id === id)!;

const handlers = () => ({
  onStep: jest.fn(),
  onStartTimer: jest.fn(),
  onStopTimer: jest.fn(),
  onPauseTimer: jest.fn(),
  onResumeTimer: jest.fn(),
  onResetTimer: jest.fn(),
});

describe('TrialSetsPanel timers (PLAN 5.4)', () => {
  it('gives every set of a hold Trial its own timer', async () => {
    const user = userEvent.setup();
    const hang = node('dead_hang');
    const actions = handlers();
    const results = defaultTrialResults(hang);
    const stoppedAt = Date.now();
    await render(
      <TrialSetsPanel
        node={hang}
        results={results}
        timers={[undefined, { startedAt: stoppedAt - 34_000, stoppedAt }]}
        {...actions}
      />,
    );
    expect(screen.getByTestId('trial-timer-0-start')).toHaveTextContent('Start hold');
    expect(screen.getByTestId('trial-timer-1-clock')).toHaveTextContent('0:31');
    expect(screen.getByTestId(`trial-timer-${results.length - 1}-start`)).toBeOnTheScreen();
    await user.press(screen.getByTestId('trial-timer-0-start'));
    expect(actions.onStartTimer).toHaveBeenCalledWith(0);
    await user.press(screen.getByTestId('trial-timer-1-reset'));
    expect(actions.onResetTimer).toHaveBeenCalledWith(1);
  });

  it('pauses and resumes the timer of one set (PLAN 5.8)', async () => {
    const user = userEvent.setup();
    const hang = node('dead_hang');
    const actions = handlers();
    const now = Date.now();
    await render(
      <TrialSetsPanel
        node={hang}
        results={defaultTrialResults(hang)}
        timers={[{ startedAt: now - 10_000 }, { startedAt: now - 20_000, pausedAt: now - 5_000 }]}
        {...actions}
      />,
    );
    await user.press(screen.getByTestId('trial-timer-0-pause'));
    expect(actions.onPauseTimer).toHaveBeenCalledWith(0);
    expect(screen.getByText('Paused')).toBeOnTheScreen();
    await user.press(screen.getByTestId('trial-timer-1-resume'));
    expect(actions.onResumeTimer).toHaveBeenCalledWith(1);
  });

  it('has no timer for a rep Trial', async () => {
    const pullUp = node('pull_up');
    await render(
      <TrialSetsPanel node={pullUp} results={defaultTrialResults(pullUp)} {...handlers()} />,
    );
    expect(screen.getByTestId('trial-set-0')).toBeOnTheScreen();
    expect(screen.queryByTestId('trial-timer-0-start')).toBeNull();
  });
});
