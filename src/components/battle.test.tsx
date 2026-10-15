import { render, screen, userEvent, within } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { getActiveSession } from '@/db/activeSessionRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { exerciseSets } from '@/domain/train';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import LiveSessionScreen from '../../app/train/session';
import { TrainingViewPanel } from './settings/TrainingViewPanel';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  Stack: { Screen: () => null },
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  }),
}));

const NOW = 1_790_000_000_000;

let test: TestDatabase;
let store: AppStore;
let ids = 0;
const storeOn = (db: TestDatabase['db']) =>
  createAppStore({ db, baseNodes: ALL_NODES, now: () => NOW, newId: () => `id-${++ids}` });
beforeEach(async () => {
  test = await openTestDatabase();
  store = storeOn(test.db);
  store.getState().loadAll();
  setAppStore(store);
  store.getState().planTraining('home', 30);
  store.getState().startTraining();
});
afterEach(() => {
  jest.useRealTimers();
  test.close();
});

const session = () => {
  const active = store.getState().activeSession;
  if (!active) throw new Error('expected a live session');
  return active;
};
/** The first exercise that is logged by taps (not a hold). */
const tapExercise = () => {
  const exercise = session().exercises.find((entry) => entry.metric !== 'hold_s');
  if (!exercise) throw new Error('expected a non-hold exercise');
  return exercise;
};

describe('Training view setting (PLAN 7.9)', () => {
  it('starts as Classic, switches in Settings and is remembered', async () => {
    const user = userEvent.setup();
    expect(store.getState().trainingView).toBe('classic');
    await render(<TrainingViewPanel />);
    expect(screen.getByTestId('training-view-classic')).toBeSelected();
    await user.press(screen.getByTestId('training-view-battle'));
    expect(store.getState().trainingView).toBe('battle');
    expect(screen.getByTestId('training-view-text')).toHaveTextContent(/tap to beat it/);

    const reopened = storeOn(test.db);
    reopened.getState().loadAll();
    expect(reopened.getState().trainingView).toBe('battle');
  });
});

describe('Classic view with monsters (PLAN 7.9)', () => {
  it("shows the current exercise's sets as foes that take the logged set", async () => {
    const user = userEvent.setup();
    await render(<LiveSessionScreen />);
    expect(screen.queryByTestId('battle-board')).not.toBeOnTheScreen();
    const [first] = session().exercises;
    expect(screen.getByTestId('current-foes-foe-0')).toHaveProp(
      'accessibilityLabel',
      expect.stringContaining('not fought yet'),
    );
    if (first.metric === 'hold_s') return;
    await user.press(screen.getByTestId('log-set'));
    expect(exerciseSets(session(), first.key)).toHaveLength(1);
  });
});

describe('Battle view (PLAN 7.9)', () => {
  beforeEach(() => store.getState().setTrainingView('battle'));

  it('shows every exercise as a row of foes, each with its "i"', async () => {
    const user = userEvent.setup();
    await render(<LiveSessionScreen />);
    expect(screen.getByTestId('battle-board')).toBeOnTheScreen();
    expect(screen.queryByTestId('current-exercise')).not.toBeOnTheScreen();
    for (const exercise of session().exercises) {
      expect(
        screen.getByTestId(`battle-${exercise.key}-foes-foe-${exercise.sets - 1}`),
      ).toBeOnTheScreen();
    }
    const [first] = session().exercises;
    await user.press(screen.getByTestId(`battle-${first.key}-info`));
    expect(screen.getByTestId('exercise-info')).toBeOnTheScreen();
  });

  it('logs the target with a tap, one rep fewer with the next, and saves the draft', async () => {
    const user = userEvent.setup();
    const exercise = tapExercise();
    await render(<LiveSessionScreen />);
    const foe = `battle-${exercise.key}-foes-foe-0`;
    await user.press(screen.getByTestId(foe));
    expect(exerciseSets(session(), exercise.key).map((set) => set.actual)).toEqual([
      exercise.target,
    ]);
    expect(screen.getByTestId(foe)).toHaveProp(
      'accessibilityLabel',
      expect.stringContaining('defeated'),
    );
    await user.press(screen.getByTestId(foe));
    expect(screen.getByTestId(foe)).toHaveProp(
      'accessibilityLabel',
      expect.stringContaining('wounded'),
    );
    expect(getActiveSession(test.db)).toEqual(session());
  });

  it('shows the rest as a bar under the board, so the monsters never move', async () => {
    // The countdown reads the clock; pin it to the store's time.
    jest.useFakeTimers({ now: NOW });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const exercise = tapExercise();
    await render(<LiveSessionScreen />);
    expect(screen.queryByTestId('rest-panel')).not.toBeOnTheScreen();
    await user.press(screen.getByTestId(`battle-${exercise.key}-foes-foe-0`));
    expect(screen.getByTestId('rest-panel')).toBeOnTheScreen();
    expect(within(screen.getByTestId('live-session')).queryByTestId('rest-panel')).toBeNull();
    expect(screen.getByTestId('skip-rest')).toHaveTextContent('Skip');
  });

  it('adds an extra set with the ghost', async () => {
    const user = userEvent.setup();
    const exercise = tapExercise();
    await render(<LiveSessionScreen />);
    for (let set = 0; set <= exercise.sets; set++) {
      await user.press(screen.getByTestId(`battle-${exercise.key}-foes-add`));
    }
    expect(exerciseSets(session(), exercise.key)).toHaveLength(exercise.sets + 1);
    expect(screen.getByTestId(`battle-${exercise.key}-foes-foe-${exercise.sets}`)).toHaveProp(
      'accessibilityLabel',
      expect.stringContaining('Extra set'),
    );
  });

  it('enters an exact number with a long press on a fresh foe, and edits a logged one', async () => {
    const user = userEvent.setup();
    const exercise = tapExercise();
    await render(<LiveSessionScreen />);
    await user.longPress(screen.getByTestId(`battle-${exercise.key}-foes-foe-0`));
    expect(screen.getByTestId('log-set-sheet')).toBeOnTheScreen();
    await user.press(screen.getByTestId('log-set-sheet-stepper-plus'));
    await user.press(screen.getByTestId('log-set-sheet-log'));
    const [set] = exerciseSets(session(), exercise.key);
    expect(set.actual).not.toEqual(exercise.target);
    expect(screen.queryByTestId('log-set-sheet')).not.toBeOnTheScreen();

    await user.longPress(screen.getByTestId(`battle-${exercise.key}-foes-foe-0`));
    expect(screen.getByTestId('edit-set-sheet')).toBeOnTheScreen();
  });
});
