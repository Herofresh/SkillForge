import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase } from '@/db/testing/testDatabase';
import { serializeBackup } from '@/domain/backup';
import { branchOgLevels, RANK_BRANCHES } from '@/domain/character';
import { goalProgress, radarAxes, type SessionListItem } from '@/domain/characterView';
import { EMPTY_OVERLAY } from '@/domain/overlay';
import { rankLadder } from '@/domain/rankLadder';
import { importFileSizeProblem, MAX_IMPORT_FILE_BYTES } from '@/lib/importFile';
import { createAppStore, type AppStore, type BackupFiles } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import { AttributeRadar } from './character/AttributeRadar';
import { GoalProgressCard } from './character/GoalProgressCard';
import { RankCrest } from './character/RankCrest';
import { RankLadderSheet } from './character/RankLadderSheet';
import { SessionHistoryRow } from './character/SessionHistoryRow';
import { EquipmentProfileEditor } from './equipment/EquipmentProfileEditor';
import { BackupPanel } from './settings/BackupPanel';
import { ReplayOnboardingPanel } from './settings/ReplayOnboardingPanel';

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
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is a button when it opens the ladder', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<RankCrest rank="Novice" hint="Branch median Foundation" onPress={onPress} />);
    expect(screen.getByText('See all ranks')).toBeOnTheScreen();
    await user.press(
      screen.getByRole('button', { name: 'Rank: Novice. Branch median Foundation' }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('RankLadderSheet', () => {
  it('shows a new hero every rank, the next one with every branch still below', async () => {
    const ladder = rankLadder(branchOgLevels(ALL_NODES, {}));
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(<RankLadderSheet ladder={ladder} onClose={onClose} />);
    expect(screen.getByText('Rank ladder')).toBeOnTheScreen();
    for (const rank of ['Novice', 'Apprentice', 'Adept', 'Master', 'Legend']) {
      expect(screen.getByText(rank)).toBeOnTheScreen();
    }
    expect(screen.getByTestId('rank-ladder-novice-status')).toHaveTextContent('Your rank');
    expect(screen.getByTestId('rank-ladder-apprentice-status')).toHaveTextContent('Next rank');
    expect(screen.getByTestId('rank-ladder-legend-status')).toHaveTextContent('Locked');
    expect(screen.getByTestId('rank-ladder-apprentice-progress')).toHaveTextContent(
      `0 of ${ladder.branchesForRank} branches at OG 2 or higher · ${ladder.branchesForRank} to go`,
    );
    expect(screen.getByTestId('rank-ladder-legend-progress')).toBeOnTheScreen();
    expect(screen.queryByTestId('rank-ladder-novice-progress')).toBeNull();
    // Only the next rank lists the branches below it.
    expect(screen.getByTestId('rank-ladder-apprentice-below')).toBeOnTheScreen();
    expect(screen.queryByTestId('rank-ladder-adept-below')).toBeNull();
    expect(screen.getByText('Planche')).toBeOnTheScreen();
    expect(screen.queryByText('Acrobatics')).toBeNull();
    expect(
      screen.getByLabelText(
        /^Legend\. Locked\. Branch median OG 13\. 0 of 7 branches at OG 13 or higher/,
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Apprentice\. Next rank\. .*Still below: /)).toBeOnTheScreen();
    await user.press(screen.getByTestId('rank-ladder-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('marks the lower ranks reached and counts the branches at the next level', async () => {
    const levels = branchOgLevels(ALL_NODES, {});
    for (const branch of RANK_BRANCHES.slice(0, 7)) levels[branch] = 6;
    levels[RANK_BRANCHES[7]] = 9;
    await render(<RankLadderSheet ladder={rankLadder(levels)} onClose={jest.fn()} />);
    expect(screen.getByTestId('rank-ladder-novice-status')).toHaveTextContent('Reached');
    expect(screen.getByTestId('rank-ladder-apprentice-status')).toHaveTextContent('Reached');
    expect(screen.getByTestId('rank-ladder-adept-status')).toHaveTextContent('Your rank');
    expect(screen.getByTestId('rank-ladder-master-progress')).toHaveTextContent(
      '1 of 7 branches at OG 9 or higher · 6 to go',
    );
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
  it('adds a profile and hands rename to the screen', async () => {
    const store = await startStore();
    const onRename = jest.fn();
    const user = userEvent.setup();
    await render(<EquipmentProfileEditor onRename={onRename} />);
    await user.type(screen.getByTestId('new-profile-input'), 'Gym');
    await user.press(screen.getByTestId('add-profile'));
    expect(store.getState().equipmentProfiles.map((profile) => profile.name)).toEqual([
      'Home',
      'Park',
      'Gym',
    ]);
    await user.press(screen.getByRole('button', { name: 'Rename Home' }));
    expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ id: 'home' }));
  });

  it('asks before removing a profile, also without Settings (onboarding, PLAN 5.12)', async () => {
    const store = await startStore();
    const user = userEvent.setup();
    await render(<EquipmentProfileEditor />);
    await user.press(screen.getByRole('button', { name: 'Remove Park' }));
    expect(screen.getByText('Remove Park?')).toBeOnTheScreen();
    expect(store.getState().equipmentProfiles).toHaveLength(2); // nothing removed yet
    // The backdrop and the button both close the sheet.
    await user.press(screen.getAllByRole('button', { name: 'Keep it' })[0]);
    expect(store.getState().equipmentProfiles).toHaveLength(2);

    await user.press(screen.getByRole('button', { name: 'Remove Park' }));
    await user.press(screen.getByTestId('remove-confirm'));
    expect(store.getState().equipmentProfiles.map((profile) => profile.id)).toEqual(['home']);
    // The last profile has no Remove button.
    expect(screen.queryByRole('button', { name: 'Remove Home' })).toBeNull();
  });
});

describe('ReplayOnboardingPanel', () => {
  it('replays the intro only after the confirmation says the data stays (PLAN 5.10)', async () => {
    const store = await startStore();
    store.getState().setHeroName('Aria');
    store.getState().completeOnboarding();
    const user = userEvent.setup();
    await render(<ReplayOnboardingPanel />);
    await user.press(screen.getByRole('button', { name: 'Replay onboarding' }));
    expect(screen.getByText(/Your data stays\. Only the intro runs again/)).toBeOnTheScreen();
    // The backdrop and the button both close the sheet.
    await user.press(screen.getAllByRole('button', { name: 'Cancel' })[0]);
    expect(store.getState().onboardingCompletedAt).toBe(NOW);

    await user.press(screen.getByRole('button', { name: 'Replay onboarding' }));
    await user.press(screen.getByTestId('replay-confirm'));
    expect(store.getState().onboardingCompletedAt).toBeUndefined();
    expect(store.getState().profile?.heroName).toBe('Aria');
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

  it('shows why a too-large file is not read and changes nothing (PLAN 7.0a)', async () => {
    const message = importFileSizeProblem(MAX_IMPORT_FILE_BYTES + 1) as string;
    const store = await startStore({
      ...files(undefined),
      pick: async () => {
        throw new Error(message);
      },
    });
    const user = userEvent.setup();
    await render(<BackupPanel />);
    await user.press(screen.getByTestId('import-backup'));
    await user.press(screen.getByTestId('import-confirm'));
    expect(await screen.findByText(message, { exact: false })).toBeOnTheScreen();
    expect(store.getState().equipmentProfiles).toHaveLength(2);
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
