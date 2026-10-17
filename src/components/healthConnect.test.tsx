import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import {
  createAppStore,
  type AppStore,
  type HealthConnectAccess,
  type HealthConnectStatus,
} from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import SessionSummaryScreen from '../../app/train/summary';
import { HealthConnectPanel } from './settings/HealthConnectPanel';

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
    dismissAll: jest.fn(),
    canDismiss: () => false,
    canGoBack: () => true,
  }),
}));

const NOW = 1_790_000_000_000;

const health = (status: HealthConnectStatus, grant = true): HealthConnectAccess => ({
  status: jest.fn(async () => status),
  requestWrite: jest.fn(async () => grant),
  hasWrite: jest.fn(async () => grant),
  writeWorkout: jest.fn(async () => undefined),
  openSettings: jest.fn(),
});

let test: TestDatabase;
let ids = 0;
const storeWith = (access?: HealthConnectAccess): AppStore => {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    newId: () => `id-${++ids}`,
    ...(access ? { health: access } : {}),
  });
  store.getState().loadAll();
  setAppStore(store);
  return store;
};

beforeEach(async () => {
  test = await openTestDatabase();
});
afterEach(() => test.close());

describe('Settings → Health Connect (PLAN 7.10)', () => {
  it('turns on with the permission and offers Health Connect and turning off', async () => {
    const user = userEvent.setup();
    const access = health('available');
    const store = storeWith(access);
    await render(<HealthConnectPanel />);
    await user.press(await screen.findByTestId('health-connect-on-button'));
    expect(access.requestWrite).toHaveBeenCalled();
    expect(store.getState().healthConnectEnabled).toBe(true);
    expect(screen.getByTestId('health-connect-on')).toBeOnTheScreen();
    await user.press(screen.getByTestId('health-connect-open'));
    expect(access.openSettings).toHaveBeenCalled();
    await user.press(screen.getByTestId('health-connect-off'));
    expect(store.getState().healthConnectEnabled).toBe(false);
  });

  it('explains a denied permission', async () => {
    const user = userEvent.setup();
    storeWith(health('available', false));
    await render(<HealthConnectPanel />);
    await user.press(await screen.findByTestId('health-connect-on-button'));
    expect(screen.getByTestId('health-connect-note')).toHaveTextContent(/wasn’t allowed/);
  });

  it('offers the install when Health Connect is missing', async () => {
    storeWith(health('not_installed'));
    await render(<HealthConnectPanel />);
    expect(await screen.findByTestId('health-connect-install')).toHaveTextContent(
      'Get Health Connect',
    );
    expect(screen.queryByTestId('health-connect-on-button')).toBeNull();
  });

  it('explains that this build has no Health Connect', async () => {
    storeWith();
    await render(<HealthConnectPanel />);
    expect(await screen.findByTestId('health-connect-status')).toHaveTextContent(
      /isn’t available in this version/,
    );
    expect(screen.queryByTestId('health-connect-on-button')).toBeNull();
  });
});

describe('Session summary with Health Connect', () => {
  it('says the workout was added', async () => {
    const store = storeWith(health('available'));
    await store.getState().enableHealthConnect();
    store.getState().planTraining('home', 30);
    const [first] = store.getState().startTraining().exercises;
    store.getState().logTrainingSet(first.key, first.target);
    store.getState().finishTraining();
    // Let the background write settle.
    await new Promise((resolve) => setImmediate(resolve));
    expect(store.getState().healthWrite?.state).toBe('added');
    await render(<SessionSummaryScreen />);
    const line = await screen.findByTestId('summary-health-connect', {
      includeHiddenElements: true,
    });
    expect(line).toHaveTextContent('Added to Health Connect.');
  });
});
