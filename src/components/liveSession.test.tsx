import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { getActiveSession } from '@/db/activeSessionRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import LiveSessionScreen from '../../app/train/session';

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
beforeEach(async () => {
  test = await openTestDatabase();
  store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    newId: () => `id-${++ids}`,
  });
  store.getState().loadAll();
  setAppStore(store);
  store.getState().planTraining('home', 30);
  store.getState().startTraining();
});
afterEach(() => test.close());

const session = () => {
  const active = store.getState().activeSession;
  if (!active) throw new Error('expected a live session');
  return active;
};

/** Logs one set of the first exercise as prescribed and shows that exercise again. */
function logFirstSet(): string {
  const [first] = session().exercises;
  store.getState().logTrainingSet(first.key, first.target);
  store.getState().selectTrainingExercise(first.key);
  return first.key;
}

describe('Live session: edit or delete a logged set (PLAN 5.9)', () => {
  it('edits a logged set with the stepper and a mark, and saves the draft', async () => {
    const user = userEvent.setup();
    logFirstSet();
    const logged = session().sets[0];
    await render(<LiveSessionScreen />);

    await user.press(screen.getByTestId('logged-set-0'));
    expect(screen.getByTestId('edit-set-sheet')).toBeOnTheScreen();
    await user.press(screen.getByTestId('edit-set-stepper-plus'));
    await user.press(screen.getByTestId('edit-set-save'));

    expect(screen.queryByTestId('edit-set-sheet')).not.toBeOnTheScreen();
    expect(session().sets[0].actual.value).toBeGreaterThan(logged.actual.value);
    expect(getActiveSession(test.db)).toEqual(session());

    await user.press(screen.getByTestId('logged-set-0'));
    await user.press(screen.getByTestId('edit-set-failed'));
    expect(session().sets[0]).toEqual({ ...logged, actual: { ...logged.actual, value: 0 } });
  });

  it('deletes a logged set only after the confirm', async () => {
    const user = userEvent.setup();
    logFirstSet();
    await render(<LiveSessionScreen />);

    await user.press(screen.getByTestId('logged-set-0'));
    await user.press(screen.getByTestId('edit-set-delete'));
    await user.press(screen.getByTestId('edit-set-keep'));
    expect(session().sets).toHaveLength(1);

    await user.press(screen.getByTestId('edit-set-delete'));
    await user.press(screen.getByTestId('edit-set-delete-confirm'));
    expect(session().sets).toEqual([]);
    expect(getActiveSession(test.db)?.sets).toEqual([]);
    expect(screen.queryByTestId('logged-set-0')).not.toBeOnTheScreen();
  });
});

describe('Live session: reorder exercises (PLAN 5.9)', () => {
  it('moves an exercise with Up / Down while reordering', async () => {
    const user = userEvent.setup();
    const [first] = session().exercises;
    await render(<LiveSessionScreen />);
    expect(screen.queryByTestId(`move-up-${first.key}`)).not.toBeOnTheScreen();

    await user.press(screen.getByTestId('session-reorder'));
    expect(screen.getByTestId(`move-up-${first.key}`)).toBeDisabled();
    await user.press(screen.getByTestId(`move-down-${first.key}`));
    expect(session().exercises[0].key).not.toBe(first.key);
    expect(getActiveSession(test.db)?.exercises).toEqual(session().exercises);
    expect(screen.getByTestId(`move-up-${first.key}`)).toBeEnabled();

    await user.press(screen.getByTestId('session-reorder'));
    expect(screen.queryByTestId(`move-up-${first.key}`)).not.toBeOnTheScreen();
  });
});
