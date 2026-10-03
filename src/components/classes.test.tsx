import { render, screen, userEvent } from '@testing-library/react-native';

import { HERO_CLASSES } from '@/data/classes';
import { classLadder, type ClassFacts, type ClassSettings } from '@/domain/classes';

import { ClassBanner } from './character/ClassBanner';
import { ClassSheet } from './character/ClassSheet';
import { ClassUnlockPanel } from './character/ClassUnlockPanel';
import { requirementText } from './character/classText';
import { BURST_TITLES } from './ui';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const facts: ClassFacts = {
  attributes: { push: 40, pull: 10, core: 0, legs: 0, balance: 0, mobility: 0 },
  sessions: 3,
  rank: 'Novice',
  medianOgLevel: 0,
};
const settings: ClassSettings = { unlocks: { warrior: [{ at: 1, sessionId: 's1' }] }, seen: {} };
const rows = classLadder(HERO_CLASSES, facts, settings);
const row = (id: string) => rows.find((entry) => entry.classId === id)!;

describe('requirementText', () => {
  it('words every kind of rule in one short line', () => {
    expect(requirementText({ kind: 'stats', points: { push: 25, pull: 25 } })).toBe(
      'Push 25 and Pull 25',
    );
    expect(requirementText({ kind: 'stats', points: { push: 1, pull: 2, core: 3 } })).toBe(
      'Push 1, Pull 2 and Core 3',
    );
    expect(requirementText({ kind: 'sessions', count: 20 })).toBe('20 sessions logged');
    expect(requirementText({ kind: 'rank', rank: 'Adept' })).toBe('Rank Adept');
  });
});

describe('ClassSheet', () => {
  it('lists every class: worn, unlocked with NEW and Wear, locked with what it needs', async () => {
    const onWear = jest.fn();
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(<ClassSheet rows={rows} onWear={onWear} onClose={onClose} />);
    expect(screen.getByText('Classes')).toBeOnTheScreen();
    expect(screen.getByTestId('class-sheet-recruit-status')).toHaveTextContent('Wearing');
    expect(screen.getByTestId('class-sheet-warrior-status')).toHaveTextContent('Unlocked');
    expect(screen.getByTestId('class-sheet-warrior-new')).toBeOnTheScreen();
    expect(screen.queryByTestId('class-sheet-recruit-new')).toBeNull();
    expect(screen.getByTestId('class-sheet-warrior-next')).toHaveTextContent(
      /Next: Veteran \(tier II\) · Push 120/,
    );
    expect(screen.getByTestId('class-sheet-warrior-progress')).toHaveTextContent('Push 40 / 120');
    expect(screen.getByTestId('class-sheet-ranger-status')).toHaveTextContent('Locked');
    expect(screen.getByTestId('class-sheet-ranger-next')).toHaveTextContent(/Unlock: Pull 30/);
    expect(screen.getByTestId('class-sheet-ranger-progress')).toHaveTextContent('Pull 10 / 30');
    expect(screen.getByTestId('class-sheet-berserker-progress')).toHaveTextContent(
      '3 / 20 sessions',
    );
    expect(screen.queryByTestId('class-sheet-ranger-wear')).toBeNull();
    expect(
      screen.getByLabelText(/^Warrior\. Unlocked\. Tier I of III\. New\. .*Next tier, Veteran/),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText(/^Ranger\. Locked\. 3 tiers\. .*Unlock: Pull 30/),
    ).toBeOnTheScreen();

    await user.press(screen.getByTestId('class-sheet-warrior-wear'));
    expect(onWear).toHaveBeenCalledWith('warrior');
    await user.press(screen.getByTestId('class-sheet-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the top tier as reached', async () => {
    const top = classLadder(HERO_CLASSES, facts, {
      selected: 'warrior',
      unlocks: { warrior: [{ at: 1 }, { at: 2 }, { at: 3 }] },
      seen: { warrior: 3 },
    });
    await render(<ClassSheet rows={top} onWear={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByTestId('class-sheet-warrior-status')).toHaveTextContent('Wearing');
    expect(screen.getByTestId('class-sheet-warrior-next')).toHaveTextContent(
      'Highest tier reached',
    );
    expect(screen.getByText('Warlord')).toBeOnTheScreen();
  });
});

describe('ClassBanner', () => {
  it('shows the worn class, the NEW count and opens the sheet', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(
      <ClassBanner row={row('recruit')} newCount={1} onPress={onPress} testID="banner" />,
    );
    expect(screen.getByTestId('banner-title')).toHaveTextContent('Recruit');
    expect(screen.getByTestId('banner-new')).toHaveTextContent('1 NEW');
    expect(
      screen.getByRole('button', { name: 'Class: Recruit. Starting class. 1 new class tier.' }),
    ).toBeOnTheScreen();
    await user.press(screen.getByTestId('banner'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ClassUnlockPanel', () => {
  it('celebrates a new class at its highest new tier and offers to wear it', async () => {
    const onWear = jest.fn();
    const user = userEvent.setup();
    await render(
      <ClassUnlockPanel
        tierUps={[
          { classId: 'warrior', tier: 1 },
          { classId: 'warrior', tier: 2 },
        ]}
        wornClassId="recruit"
        celebrate
        playKey="s1"
        onWear={onWear}
      />,
    );
    expect(screen.getByText(BURST_TITLES.classUnlocked)).toBeOnTheScreen();
    expect(screen.getByLabelText('Veteran: Warrior tier II')).toBeOnTheScreen();
    await user.press(screen.getByTestId('summary-class-warrior-wear'));
    expect(onWear).toHaveBeenCalledWith('warrior');
  });

  it('says TIER UP! for a higher tier only, and nothing without tier-ups', async () => {
    await render(
      <ClassUnlockPanel
        tierUps={[{ classId: 'ranger', tier: 2 }]}
        wornClassId="ranger"
        celebrate
        playKey="s2"
        onWear={jest.fn()}
      />,
    );
    expect(screen.getByText(BURST_TITLES.classTierUp)).toBeOnTheScreen();
    expect(screen.queryByTestId('summary-class-ranger-wear')).toBeNull();
    await render(
      <ClassUnlockPanel tierUps={[]} wornClassId="recruit" celebrate={false} playKey="s3" />,
    );
    expect(screen.queryByTestId('summary-classes')).toBeNull();
  });
});
