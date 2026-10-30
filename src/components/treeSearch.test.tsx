import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import TreeScreen from '../../app/(tabs)/tree';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const NOW = 1_790_000_000_000;

let test: TestDatabase;
let store: AppStore;
beforeEach(async () => {
  test = await openTestDatabase();
  store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
  store.getState().loadAll();
  store.getState().setTreeMode('columns');
  setAppStore(store);
  mockPush.mockClear();
});
afterEach(() => test.close());

describe('Tree search in the columns view (PLAN 7.8 FB-17)', () => {
  it('shows matching skills of every branch while typing, opens one, and clears back to the column', async () => {
    const user = userEvent.setup();
    await render(<TreeScreen />);
    expect(screen.getByTestId('tree-branch-title')).toBeOnTheScreen();

    await user.type(screen.getByTestId('tree-search'), 'dip');
    expect(screen.getByTestId('tree-search-summary')).toHaveTextContent(
      /skills match, from every branch/,
    );
    expect(screen.queryByTestId('tree-branch-title')).toBeNull();
    const dip = screen.getByTestId('tree-result-parallel_bar_dip');
    expect(dip).toBeOnTheScreen();
    // The "i" works on a result too, without opening it.
    await user.press(screen.getByTestId('tree-result-parallel_bar_dip-info'));
    expect(screen.getByTestId('exercise-info')).toBeOnTheScreen();
    await user.press(screen.getByTestId('exercise-info-close'));
    expect(mockPush).not.toHaveBeenCalled();

    await user.press(dip);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/node/[nodeId]',
      params: { nodeId: 'parallel_bar_dip' },
    });

    await user.clear(screen.getByTestId('tree-search'));
    expect(screen.getByTestId('tree-branch-title')).toBeOnTheScreen();
    expect(screen.queryByTestId('tree-result-parallel_bar_dip')).toBeNull();
  });

  it('says when nothing matches', async () => {
    const user = userEvent.setup();
    await render(<TreeScreen />);
    await user.type(screen.getByTestId('tree-search'), 'zzzz');
    expect(screen.getByTestId('tree-search-summary')).toHaveTextContent('No skill matches zzzz.');
  });
});
