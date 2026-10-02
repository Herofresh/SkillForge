/**
 * Exercise descriptions (PLAN 6.2, ADR-049): the shared info sheet and every place that opens it
 * (Tree tile and map node, plan preview, live session).
 */
import 'react-native-gesture-handler/jestSetup';

import { render, screen, userEvent, within } from '@testing-library/react-native';

import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { NO_DESCRIPTION_TEXT } from '@/domain/format';
import { mapFocus, mapLayout, mapTiles } from '@/domain/treeMap';
import { branchColumn } from '@/domain/treeView';
import type { ExerciseNode } from '@/domain/types';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import PlanPreviewScreen from '../../app/train/preview';
import LiveSessionScreen from '../../app/train/session';

import { ExerciseInfoSheet } from './node/ExerciseInfoSheet';
import { NodeTile } from './tree/NodeTile';
import { TreeMap } from './tree/map/TreeMap';

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

function node(id: string): ExerciseNode {
  const found = NODE_BY_ID.get(id);
  if (!found) throw new Error(`node '${id}' does not exist`);
  return found;
}

describe('ExerciseInfoSheet', () => {
  it('shows the description and the cues; "Open skill" only when asked for', async () => {
    const pullUp = node('pull_up');
    const onClose = jest.fn();
    const onOpenDetail = jest.fn();
    const user = userEvent.setup();
    await render(<ExerciseInfoSheet node={pullUp} onClose={onClose} onOpenDetail={onOpenDetail} />);
    expect(screen.getByText('Pull-up')).toBeOnTheScreen();
    expect(screen.getByTestId('exercise-info-description')).toHaveTextContent(pullUp.description);
    for (const cue of pullUp.cues) expect(screen.getByText(`• ${cue}`)).toBeOnTheScreen();
    await user.press(screen.getByTestId('exercise-info-open'));
    expect(onOpenDetail).toHaveBeenCalled();
    await user.press(screen.getByTestId('exercise-info-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('leaves "Open skill" out in Train and explains a missing description', async () => {
    const old = { ...node('pull_up'), id: 'user_old', source: 'user' as const, description: '' };
    await render(<ExerciseInfoSheet node={old} onClose={jest.fn()} />);
    expect(screen.queryByTestId('exercise-info-open')).toBeNull();
    expect(screen.getByTestId('exercise-info-description')).toHaveTextContent(NO_DESCRIPTION_TEXT);
  });
});

describe('Tree: opening the info sheet', () => {
  const tile = branchColumn(ALL_NODES, 'v_pull', {}, []).find((t) => t.node.id === 'dead_hang')!;

  it('has an "i" on the column tile, and a long press does the same', async () => {
    const onInfo = jest.fn();
    const onOpen = jest.fn();
    const user = userEvent.setup();
    await render(<NodeTile tile={tile} onOpen={onOpen} onInfo={onInfo} />);
    await user.press(screen.getByRole('button', { name: 'About Dead hang' }));
    expect(onInfo).toHaveBeenLastCalledWith('dead_hang');
    await user.longPress(screen.getByTestId('tile-dead_hang'));
    expect(onInfo).toHaveBeenCalledTimes(2);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('shows no "i" where nobody listens (onboarding, editor previews)', async () => {
    await render(<NodeTile tile={tile} onOpen={jest.fn()} />);
    expect(screen.queryByTestId('tile-info-dead_hang')).toBeNull();
  });

  it('opens it with a long press on a map node', async () => {
    const layout = mapLayout(ALL_NODES);
    const state = mapTiles(ALL_NODES, {}, []);
    const onInfo = jest.fn();
    const onOpen = jest.fn();
    const user = userEvent.setup();
    await render(
      <TreeMap
        layout={layout}
        state={state}
        focus={mapFocus(layout, state, [])}
        customized={new Set()}
        onOpen={onOpen}
        onInfo={onInfo}
        onSwitchToList={jest.fn()}
      />,
    );
    await user.longPress(screen.getByTestId('map-node-pull_up'));
    expect(onInfo).toHaveBeenCalledWith('pull_up');
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('Train: the "i" opens the sheet without leaving the plan or session', () => {
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
  });
  afterEach(() => test.close());

  it('in the plan preview, for each exercise', async () => {
    const [first] = store.getState().trainPlan?.exercises ?? [];
    if (!first) throw new Error('expected a planned exercise');
    const user = userEvent.setup();
    await render(<PlanPreviewScreen />);
    await user.press(screen.getByTestId(`plan-${first.key}-info`));
    const sheet = screen.getByTestId('exercise-info');
    expect(within(sheet).getByText(node(first.nodeId).name)).toBeOnTheScreen();
    expect(screen.getByTestId('exercise-info-description')).toHaveTextContent(
      node(first.nodeId).description,
    );
    expect(screen.queryByTestId('exercise-info-open')).toBeNull();
    await user.press(screen.getByTestId('exercise-info-close'));
    expect(screen.queryByTestId('exercise-info')).toBeNull();
    expect(screen.getByTestId('plan-preview')).toBeOnTheScreen();
  });

  it('in the live session, for the current exercise; the session goes on', async () => {
    store.getState().startTraining();
    const current = store.getState().activeSession?.exercises[0];
    if (!current) throw new Error('expected a live session');
    const user = userEvent.setup();
    await render(<LiveSessionScreen />);
    await user.press(screen.getByTestId('current-exercise-info'));
    expect(screen.getByTestId('exercise-info-description')).toHaveTextContent(
      node(current.nodeId).description,
    );
    for (const cue of node(current.nodeId).cues) {
      expect(screen.getByText(`• ${cue}`)).toBeOnTheScreen();
    }
    await user.press(screen.getByTestId('exercise-info-close'));
    expect(screen.queryByTestId('exercise-info')).toBeNull();
    expect(screen.getByTestId('current-exercise')).toBeOnTheScreen();
    expect(store.getState().activeSession).toBeDefined();
  });
});
