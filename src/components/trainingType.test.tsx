import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import TrainScreen from '../../app/(tabs)/train';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}));

const NOW = 1_790_000_000_000;

let test: TestDatabase;
let store: AppStore;
beforeEach(async () => {
  test = await openTestDatabase();
  store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
  store.getState().loadAll();
  setAppStore(store);
});
afterEach(() => test.close());

describe('Train tab: training type (PLAN 7.8 FB-5)', () => {
  it('starts on Standard and plans the chosen type', async () => {
    const user = userEvent.setup();
    await render(<TrainScreen />);
    expect(screen.getByTestId('training-type-standard')).toBeSelected();
    await user.press(screen.getByTestId('training-type-recovery'));
    expect(screen.getByTestId('training-type-text')).toHaveTextContent(/No hard strength/);
    await user.press(screen.getByTestId('train-now'));
    const plan = store.getState().trainPlan;
    expect(plan?.notes[0]).toMatch(/^Recovery session/);
    expect(plan?.exercises.some((exercise) => exercise.block === 'strength')).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/train/preview');
  });

  it('plans a standard session without a type note', () => {
    const plan = store.getState().planTraining('home', 30);
    expect(plan.notes.some((note) => /^(Recovery|Challenging) session/.test(note))).toBe(false);
    const hard = store.getState().planTraining('home', 30, 'challenging');
    expect(hard.notes[0]).toMatch(/^Challenging session/);
  });
});
