import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { PROFICIENT_LEVEL, xpForLevel } from '@/domain/progression';
import { branchColumn, nodeDetail, nodeHistory } from '@/domain/treeView';
import type { NodeProgress } from '@/domain/types';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import { NodeHistoryList } from './node/NodeHistoryList';
import { PrerequisiteList } from './node/PrerequisiteList';
import { UnlockSheet } from './node/UnlockSheet';
import { NodeTile } from './tree/NodeTile';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const NOW = 1_790_000_000_000;
/** The chains are decorative (hidden from screen readers), so queries must include hidden views. */
const HIDDEN = { includeHiddenElements: true };

const proficient = (nodeId: string): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, 0),
  level: PROFICIENT_LEVEL,
  trialPassed: true,
  firstTrainedAt: 1,
});

const tile = (branch: 'v_pull' | 'front_lever', id: string, progress = {}, goals: string[] = []) =>
  branchColumn(ALL_NODES, branch, progress, goals).find((entry) => entry.node.id === id)!;

describe('NodeTile', () => {
  it('shows a locked node dimmed with a lock and an unmet chain', async () => {
    await render(<NodeTile tile={tile('v_pull', 'scapular_pull')} onOpen={jest.fn()} />);
    expect(screen.getByTestId('tile-state-scapular_pull')).toHaveTextContent('Locked');
    expect(screen.getByTestId('chain-unmet', HIDDEN)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Scapular pull, Locked/ })).toBeOnTheScreen();
  });

  it('marks goals, lights the chain and shows the XP bar once trained', async () => {
    const progress = {
      dead_hang: proficient('dead_hang'),
      scapular_pull: { ...proficient('scapular_pull'), trialPassed: false, level: 2, xp: 25 },
    };
    await render(
      <NodeTile
        tile={tile('v_pull', 'scapular_pull', progress, ['scapular_pull'])}
        onOpen={jest.fn()}
      />,
    );
    expect(screen.getByTestId('tile-goal-scapular_pull')).toBeOnTheScreen();
    expect(screen.getByTestId('chain-met', HIDDEN)).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'LV 2 · Training' })).toBeOnTheScreen();
  });

  it('shows a locked legendary node as a silhouette', async () => {
    await render(<NodeTile tile={tile('v_pull', 'one_arm_chin_up')} onOpen={jest.fn()} />);
    expect(screen.getByTestId('tile-state-one_arm_chin_up')).toHaveTextContent('Legendary');
  });

  it('opens the node or a linked cross-branch prerequisite', async () => {
    const onOpen = jest.fn();
    const user = userEvent.setup();
    await render(<NodeTile tile={tile('front_lever', 'tuck_front_lever')} onOpen={onOpen} />);
    expect(screen.queryByTestId('chain-unmet', HIDDEN)).toBeNull();
    await user.press(screen.getByTestId('tile-link-tuck_front_lever-hollow_hold'));
    expect(onOpen).toHaveBeenLastCalledWith('hollow_hold');
    expect(
      screen.getByRole('link', {
        name: 'Needs Hollow body hold proficient, from Core and compression, not met',
      }),
    ).toBeOnTheScreen();
    await user.press(screen.getByTestId('tile-tuck_front_lever'));
    expect(onOpen).toHaveBeenLastCalledWith('tuck_front_lever');
  });
});

describe('PrerequisiteList', () => {
  it('lists ✓/✗ with alternatives and what met the prerequisite', async () => {
    const progress = { straight_bar_dip: proficient('straight_bar_dip') };
    const detail = nodeDetail(ALL_NODES, 'tuck_human_flag', progress, [], [])!;
    await render(<PrerequisiteList prerequisites={detail.prerequisites} onOpen={jest.fn()} />);
    expect(screen.getByTestId('prereq-parallel_bar_dip')).toHaveTextContent(/Met · proficient/);
    expect(screen.getByText('Also met by Straight bar dip')).toBeOnTheScreen();
    expect(screen.getByText('Met through Straight bar dip')).toBeOnTheScreen();
    expect(screen.getByTestId('prereq-pull_up')).toHaveTextContent(/Not met · proficient/);
  });

  it('says when a node has none', async () => {
    await render(<PrerequisiteList prerequisites={[]} onOpen={jest.fn()} />);
    expect(screen.getByTestId('prereq-none')).toBeOnTheScreen();
  });
});

describe('UnlockSheet', () => {
  let test: TestDatabase;
  let store: AppStore;
  beforeEach(async () => {
    test = await openTestDatabase();
    store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
    store.getState().loadAll();
    setAppStore(store);
  });
  afterEach(() => test.close());

  it('self-unlocks only after the prerequisites note is acknowledged', async () => {
    const onUnlocked = jest.fn();
    const user = userEvent.setup();
    const node = ALL_NODES.find((entry) => entry.id === 'scapular_pull')!;
    await render(<UnlockSheet node={node} onClose={jest.fn()} onUnlocked={onUnlocked} />);
    const confirm = screen.getByTestId('unlock-confirm');
    expect(screen.getByRole('button', { name: 'Unlock anyway' })).toBeDisabled();
    await user.press(screen.getByTestId('unlock-warning-0-acknowledge'));
    expect(screen.getByRole('button', { name: 'Unlock anyway' })).toBeEnabled();
    await user.press(confirm);
    expect(onUnlocked).toHaveBeenCalledTimes(1);
    expect(store.getState().userActions.map((action) => action.nodeId)).toEqual(['scapular_pull']);
    expect(store.getState().engine.progress.scapular_pull?.selfUnlockedAt).toBe(NOW);
  });
});

describe('NodeHistoryList', () => {
  it('opens the past session from each row, onboarding Trials too (PLAN 5.10)', async () => {
    const test = await openTestDatabase();
    const store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
    store.getState().loadAll();
    store.getState().logTrial('dead_hang', [{ value: 30 }, { value: 30 }, { value: 30 }]);
    const history = nodeHistory(store.getState().sessions, 'dead_hang');
    const onOpenSession = jest.fn();
    const user = userEvent.setup();
    await render(
      <NodeHistoryList history={history} metric="hold_s" onOpenSession={onOpenSession} />,
    );
    await user.press(screen.getByRole('button', { name: /, Trial: 30 s · 30 s · 30 s$/ }));
    expect(onOpenSession).toHaveBeenCalledWith(history[0].sessionId);
    test.close();
  });

  it('says when nothing is logged', async () => {
    await render(<NodeHistoryList history={[]} metric="reps" onOpenSession={jest.fn()} />);
    expect(screen.getByTestId('history-empty')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
