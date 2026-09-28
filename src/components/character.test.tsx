import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase } from '@/db/testing/testDatabase';
import { serializeBackup } from '@/domain/backup';
import { goalProgress, radarAxes, type SessionListItem } from '@/domain/characterView';
import { EMPTY_OVERLAY } from '@/domain/overlay';
import { createAppStore, type AppStore, type BackupFiles } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import { AttributeRadar } from './character/AttributeRadar';
import { GoalProgressCard } from './character/GoalProgressCard';
import { RankCrest } from './character/RankCrest';
import { SessionHistoryRow } from './character/SessionHistoryRow';
import { EquipmentProfileEditor } from './equipment/EquipmentProfileEditor';
import { BackupPanel } from './settings/BackupPanel';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const NOW = 1_790_000_000_000;

async function startStore(files?: BackupFiles): Promise<AppStore> {
  const test = await openTestDatabase();
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    ...(files ? { files } : {}),
  });
  store.getState().loadAll();
  setAppStore(store);
  return store;
}

describe('AttributeRadar', () => {
  it('draws once it knows its width and describes the values', async () => {
    const axes = radarAxes({ push: 12, pull: 6, core: 3, legs: 0, balance: 0, mobility: 1 });
    await render(<AttributeRadar axes={axes} testID="radar" />);
    const radar = screen.getByTestId('radar');
    expect(screen.queryByText('Mobility')).toBeNull();
    await fireEvent(radar, 'layout', { nativeEvent: { layout: { width: 340, height: 300 } } });
    expect(screen.getByText('Mobility')).toBeOnTheScreen();
    expect(screen.getByText('12')).toBeOnTheScreen();
    expect(
      screen.getByRole('image', {
        name: 'Attribute radar: Push 12, Pull 6, Core 3, Legs 0, Balance 0, Mobility 1',
      }),
    ).toBeOnTheScreen();
  });
});

describe('RankCrest', () => {
  it('names the rank and the hint', async () => {
    await render(<RankCrest rank="Adept" hint="Branch median OG 6" />);
    expect(screen.getByText('Adept')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rank: Adept. Branch median OG 6')).toBeOnTheScreen();
  });
});

describe('GoalProgressCard', () => {
  it('opens the goal and its next step', async () => {
    const [goal] = goalProgress(ALL_NODES, {}, ['pull_up']);
    const onOpen = jest.fn();
    const user = userEvent.setup();
    await render(<GoalProgressCard goal={goal} onOpen={onOpen} />);
    await user.press(screen.getByRole('button', { name: /^Goal Pull-up/ }));
    expect(onOpen).toHaveBeenLastCalledWith('pull_up');
    await user.press(screen.getByRole('link', { name: /^Next step:/ }));
    expect(onOpen).toHaveBeenLastCalledWith(goal.next?.nodeId);
  });
});

describe('SessionHistoryRow', () => {
  it('shows the session and opens it', async () => {
    const item: SessionListItem = {
      sessionId: 's1',
      at: NOW,
      title: 'Pull-up, Hollow body hold',
      exercises: 2,
      sets: 6,
      xp: 42,
      trialsPassed: 1,
    };
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<SessionHistoryRow item={item} onPress={onPress} />);
    expect(screen.getByText('+42 XP')).toBeOnTheScreen();
    expect(screen.getByText('6 sets · 1 Trial passed')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /Pull-up, Hollow body hold, 6 sets/ }));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('EquipmentProfileEditor', () => {
  it('adds a profile and hands rename/remove to the screen', async () => {
    const store = await startStore();
    const onRename = jest.fn();
    const onRemove = jest.fn();
    const user = userEvent.setup();
    await render(<EquipmentProfileEditor onRename={onRename} onRemove={onRemove} />);
    await user.type(screen.getByTestId('new-profile-input'), 'Gym');
    await user.press(screen.getByTestId('add-profile'));
    expect(store.getState().equipmentProfiles.map((profile) => profile.name)).toEqual([
      'Home',
      'Park',
      'Gym',
    ]);
    await user.press(screen.getByRole('button', { name: 'Rename Home' }));
    expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ id: 'home' }));
    await user.press(screen.getByRole('button', { name: 'Remove Park' }));
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: 'park' }));
    expect(store.getState().equipmentProfiles).toHaveLength(3); // the screen confirms first
  });
});

describe('BackupPanel', () => {
  const emptyBackup = serializeBackup(
    {
      goals: [],
      equipmentProfiles: [],
      sessions: [],
      userActions: [],
      overlay: EMPTY_OVERLAY,
      settings: {},
    },
    NOW,
  );

  function files(picked: string | undefined): BackupFiles {
    return {
      share: jest.fn(async () => undefined),
      pick: async () => picked,
      saveSafetyCopy: (fileName) => `file:///backups/${fileName}`,
    };
  }

  it('exports to the share sheet', async () => {
    const access = files(undefined);
    await startStore(access);
    const user = userEvent.setup();
    await render(<BackupPanel />);
    await user.press(screen.getByTestId('export-backup'));
    expect(access.share).toHaveBeenCalled();
    expect(await screen.findByTestId('backup-exported')).toBeOnTheScreen();
  });

  it('confirms before importing and reports a canceled pick', async () => {
    await startStore(files(undefined));
    const user = userEvent.setup();
    await render(<BackupPanel />);
    await user.press(screen.getByTestId('import-backup'));
    expect(screen.getByText('Replace all data?')).toBeOnTheScreen();
    await user.press(screen.getByTestId('import-confirm'));
    expect(await screen.findByTestId('backup-canceled')).toBeOnTheScreen();
  });

  it('lists why a file is rejected and changes nothing', async () => {
    const store = await startStore(files('{"format":"nope"}'));
    const user = userEvent.setup();
    await render(<BackupPanel />);
    await user.press(screen.getByTestId('import-backup'));
    await user.press(screen.getByTestId('import-confirm'));
    expect(await screen.findByTestId('import-rejected')).toBeOnTheScreen();
    expect(screen.getByText(/Nothing was changed/)).toBeOnTheScreen();
    expect(store.getState().equipmentProfiles).toHaveLength(2);
    expect(screen.queryByTestId('undo-import')).toBeNull();
  });

  it('imports, then undoes the import from the safety copy', async () => {
    const store = await startStore(files(emptyBackup));
    const user = userEvent.setup();
    await render(<BackupPanel />);
    await user.press(screen.getByTestId('import-backup'));
    await user.press(screen.getByTestId('import-confirm'));
    expect(await screen.findByTestId('backup-imported')).toBeOnTheScreen();
    expect(store.getState().equipmentProfiles).toHaveLength(0);
    await user.press(screen.getByTestId('undo-import'));
    await user.press(screen.getByTestId('undo-confirm'));
    expect(await screen.findByTestId('backup-undone')).toBeOnTheScreen();
    expect(store.getState().equipmentProfiles).toHaveLength(2);
    expect(screen.queryByTestId('undo-import')).toBeNull();
  });
});
