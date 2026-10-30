import { render, screen, userEvent, within } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { defaultTrialResults } from '@/domain/assessment';
import { goalProgress } from '@/domain/characterView';
import type { SessionResult } from '@/domain/recompute';
import type { ExerciseNode } from '@/domain/types';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import { END_OF_PATH_TEXT, stillNeedsText } from './character/NextGoalPicker';
import { GOALS_KEPT_TEXT, GoalReachedPanel } from './character/GoalReachedPanel';
import { GoalProgressCard } from './character/GoalProgressCard';
import { NextGoalSheet } from './character/NextGoalSheet';
import { TrialOutcome } from './trial/TrialParts';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const NOW = 1_790_000_000_000;
const node = (id: string): ExerciseNode => ALL_NODES.find((entry) => entry.id === id)!;

let test: TestDatabase;
let store: AppStore;
beforeEach(async () => {
  test = await openTestDatabase();
  store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
  store.getState().loadAll();
  setAppStore(store);
});
afterEach(() => test.close());

/** Passes `id`'s Trial through the store (a test-out) and returns the result. */
const passTrial = (id: string): SessionResult =>
  store.getState().logTrial(id, defaultTrialResults(node(id)));

describe('GoalReachedPanel (PLAN 7.8 FB-9/10/11)', () => {
  it('celebrates a reached goal and puts the picked option in its place', async () => {
    store.getState().setGoals(['squat', 'pull_up']);
    const user = userEvent.setup();
    const onOpenNode = jest.fn();
    await render(
      <GoalReachedPanel goalIds={['pull_up']} celebrate playKey="s1" onOpenNode={onOpenNode} />,
    );
    expect(screen.getByText('GOAL REACHED!')).toBeOnTheScreen();
    expect(screen.getByTestId('summary-goal-pull_up-text')).toHaveTextContent(
      'Pull-up is yours: its Trial is passed and its whole path is proficient.',
    );
    // The options build on the goal; the first is the easiest of its own branch.
    const first = screen.getByTestId('summary-goal-pull_up-next-l_pull_up');
    expect(within(first).getByText(/Builds on Pull-up\. Open to train now\./)).toBeOnTheScreen();
    expect(screen.getByTestId('summary-goal-pull_up-next-pick')).toBeDisabled();

    // The "i" shows the option without picking it.
    await user.press(screen.getByTestId('summary-goal-pull_up-next-l_pull_up-info'));
    expect(screen.getByTestId('summary-goal-pull_up-next-info-description')).toHaveTextContent(
      node('l_pull_up').description,
    );
    await user.press(screen.getByTestId('summary-goal-pull_up-next-info-open'));
    expect(onOpenNode).toHaveBeenCalledWith('l_pull_up');
    expect(store.getState().goals).toEqual(['squat', 'pull_up']);

    await user.press(first);
    expect(first).toBeChecked();
    await user.press(screen.getByTestId('summary-goal-pull_up-next-pick'));
    expect(store.getState().goals).toEqual(['squat', 'l_pull_up']);
    expect(screen.getByTestId('summary-goal-pull_up-picked')).toHaveTextContent(
      'Next goal: L-sit pull-up',
    );
    expect(screen.queryByTestId('summary-goal-pull_up-next-pick')).toBeNull();
  });

  it('keeps the goals when asked, and says so at the end of a path', async () => {
    store.getState().setGoals(['pull_up', 'one_arm_chin_up']);
    const user = userEvent.setup();
    await render(
      <GoalReachedPanel goalIds={['pull_up', 'one_arm_chin_up']} celebrate={false} playKey="s1" />,
    );
    expect(screen.queryByText('GOAL REACHED!')).toBeNull();
    expect(screen.getByText('Goal reached: Pull-up')).toBeOnTheScreen();
    await user.press(screen.getByTestId('summary-goal-pull_up-next-keep'));
    expect(screen.getByTestId('summary-goal-pull_up-kept')).toHaveTextContent(GOALS_KEPT_TEXT);
    expect(screen.getByTestId('summary-goal-one_arm_chin_up-next-end')).toHaveTextContent(
      END_OF_PATH_TEXT,
    );
    expect(store.getState().goals).toEqual(['pull_up', 'one_arm_chin_up']);
  });

  it('renders nothing when no goal was reached', async () => {
    await render(<GoalReachedPanel goalIds={[]} celebrate playKey="s1" />);
    expect(screen.queryByText(/Goal reached/)).toBeNull();
  });

  it('words what an option still needs', () => {
    expect(stillNeedsText(['Dead hang'])).toBe('Still needs Dead hang');
    expect(stillNeedsText(['A', 'B', 'C'])).toBe('Still needs A, B and C');
  });
});

describe('TrialOutcome shows the goal it reached (PLAN 7.8 FB-9)', () => {
  it('after a passed Trial of a goal; not after another skill', async () => {
    store.getState().setGoals(['pull_up']);
    const outcome = passTrial('pull_up');
    await render(<TrialOutcome node={node('pull_up')} outcome={outcome} standard="3 × 8 reps" />);
    expect(screen.getByTestId('trial-passed')).toBeOnTheScreen();
    expect(screen.getByTestId('trial-goal-pull_up')).toBeOnTheScreen();
    expect(screen.getByTestId('trial-goal-pull_up-next-l_pull_up')).toBeOnTheScreen();
  });

  it('stays quiet when the passed Trial is no goal', async () => {
    store.getState().setGoals(['pull_up']);
    const outcome = passTrial('dead_hang');
    await render(<TrialOutcome node={node('dead_hang')} outcome={outcome} standard="3 × 30 s" />);
    expect(screen.queryByTestId('trial-goal-dead_hang')).toBeNull();
  });
});

describe('Character tab: a reached goal offers the next one (PLAN 7.8 FB-9)', () => {
  it('the card has no "Pick the next goal" while the goal is open', async () => {
    const [open] = goalProgress(ALL_NODES, {}, ['pull_up']);
    await render(<GoalProgressCard goal={open} onOpen={jest.fn()} onPickNext={jest.fn()} />);
    expect(screen.queryByText('Pick the next goal')).toBeNull();
  });

  it('the card offers it once the goal is reached', async () => {
    store.getState().setGoals(['pull_up']);
    passTrial('pull_up');
    const [reached] = goalProgress(ALL_NODES, store.getState().engine.progress, ['pull_up']);
    expect(reached.next).toBeUndefined();
    const user = userEvent.setup();
    const onPickNext = jest.fn();
    await render(
      <GoalProgressCard goal={reached} onOpen={jest.fn()} onPickNext={onPickNext} testID="goal" />,
    );
    await user.press(screen.getByTestId('goal-pick-next'));
    expect(onPickNext).toHaveBeenCalledWith('pull_up');
  });

  it('the sheet replaces the goal with the picked option and closes', async () => {
    store.getState().setGoals(['pull_up']);
    passTrial('pull_up');
    const user = userEvent.setup();
    const onClose = jest.fn();
    await render(<NextGoalSheet goalId="pull_up" onClose={onClose} onOpenNode={jest.fn()} />);
    expect(
      within(screen.getByTestId('next-goal-sheet')).getByText('After Pull-up'),
    ).toBeOnTheScreen();
    await user.press(screen.getByTestId('next-goal-sheet-next-chest_to_bar_pull_up'));
    await user.press(screen.getByTestId('next-goal-sheet-next-pick'));
    expect(store.getState().goals).toEqual(['chest_to_bar_pull_up']);
    expect(onClose).toHaveBeenCalled();
  });
});
