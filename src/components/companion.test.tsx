import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { ACCESSORIES } from '@/data/companion';
import {
  companionWardrobe,
  EMPTY_COMPANION_SETTINGS,
  type CompanionFacts,
  type CompanionSettings,
} from '@/domain/companion';

import { CompanionCard } from './character/CompanionCard';
import { CompanionSheet } from './character/CompanionSheet';
import { companionProgressText, companionRuleText } from './character/companionText';
import { TrinketUnlockPanel } from './character/TrinketUnlockPanel';
import type { CompanionView } from './character/useCompanion';
import { BURST_TITLES } from './ui';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const facts: CompanionFacts = {
  sessions: 3,
  level: 4,
  rank: 'Apprentice',
  classTiers: { warrior: 1 },
  bestStreak: 2,
  trialsPassed: 0,
  eliteTrialPassed: false,
};

const settings: CompanionSettings = {
  ...EMPTY_COMPANION_SETTINGS,
  unlocks: {
    rope_headband: { at: 1 },
    leather_bracers: { at: 2 },
    iron_helm: { at: 3, sessionId: 's3' },
  },
  seen: ['rope_headband', 'leather_bracers'],
};

const view = (overrides: Partial<CompanionView> = {}): CompanionView => ({
  mood: 'sad',
  title: 'Missing you',
  line: 'Misses training with you. One session cheers it up.',
  outfit: {
    loadout: { head: 'iron_helm', hands: 'leather_bracers' },
    weapon: { classId: 'warrior', upgraded: false },
  },
  look: {},
  weaponName: 'Longsword',
  newCount: 1,
  wardrobe: companionWardrobe(ACCESSORIES, settings, facts),
  ...overrides,
});

describe('companionText', () => {
  it('words every rule and the progress on it', () => {
    expect(companionRuleText({ kind: 'class', classId: 'warrior', tier: 3 })).toBe(
      'Warrior class, tier III',
    );
    expect(companionRuleText({ kind: 'trials', count: 1 })).toBe('Pass your first Trial');
    expect(companionRuleText({ kind: 'streak', count: 7 })).toBe('A streak of 7 sessions');
    expect(
      companionProgressText({ kind: 'level', level: 10 }, { current: 4, target: 10, met: false }),
    ).toBe('Level 4 / 10');
    expect(
      companionProgressText(
        { kind: 'rank', rank: 'Legend' },
        { current: 1, target: 4, met: false },
      ),
    ).toBe('Apprentice now');
  });
});

describe('CompanionCard', () => {
  it('shows the mood kindly, the weapon and Customize with the NEW count', async () => {
    const onCustomize = jest.fn();
    const user = userEvent.setup();
    await render(<CompanionCard view={view()} onCustomize={onCustomize} />);
    expect(screen.getByTestId('companion-mood')).toHaveTextContent('Missing you');
    expect(screen.getByTestId('companion-line')).toHaveTextContent(/cheers it up/);
    expect(screen.getByTestId('companion-weapon')).toHaveTextContent('Longsword');
    expect(screen.getByTestId('companion-new')).toHaveTextContent('1 NEW');
    await user.press(screen.getByTestId('companion-customize'));
    expect(onCustomize).toHaveBeenCalled();
    // The guide's "i" (PLAN 6.10c) explains the mood and the accessories.
    await user.press(screen.getByRole('button', { name: 'About Companion' }));
    expect(screen.getByTestId('guide-companion-sheet-summary')).toHaveTextContent(/never loses/);
  });

  it('waves on a tap and goes back to idling', async () => {
    jest.useFakeTimers();
    try {
      await render(<CompanionCard view={view()} onCustomize={jest.fn()} />);
      const sprite = screen.getByTestId('companion-sprite');
      expect(sprite.props.accessibilityHint).toBe('Your companion waves at you');
      await act(async () => {
        fireEvent.press(sprite);
      });
      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
      expect(screen.getByTestId('companion-sprite')).toBeOnTheScreen();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('CompanionSheet', () => {
  it('lists colors, earned accessories to wear and locked ones with what earns them', async () => {
    const onEquip = jest.fn();
    const onLook = jest.fn();
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(
      <CompanionSheet view={view()} onEquip={onEquip} onLook={onLook} onClose={onClose} />,
    );
    expect(screen.getByText('Customize')).toBeOnTheScreen();
    expect(screen.getByTestId('companion-sheet-weapon')).toHaveTextContent('Longsword');
    expect(screen.getByTestId('companion-sheet-head-iron_helm')).toHaveTextContent(/NEW/);
    expect(screen.getByTestId('companion-sheet-head-golden_crown-locked')).toHaveTextContent(
      /Rank Legend · Apprentice now/,
    );
    expect(screen.getByTestId('companion-sheet-cloak-hooded_cloak-locked')).toHaveTextContent(
      /Character level 10 · Level 4 \/ 10/,
    );
    await user.press(screen.getByTestId('companion-sheet-head-rope_headband'));
    expect(onEquip).toHaveBeenCalledWith('head', 'rope_headband');
    await user.press(screen.getByTestId('companion-sheet-hands-none'));
    expect(onEquip).toHaveBeenCalledWith('hands', null);
    await user.press(screen.getByTestId('companion-sheet-skin-tan'));
    expect(onLook).toHaveBeenCalledWith({ skin: 'tan' });
    await user.press(screen.getByTestId('companion-sheet-outfit-crimson'));
    expect(onLook).toHaveBeenCalledWith({ outfit: 'crimson' });
  });

  it('offers the body (man by default, PLAN 6.13) and the hair styles of either body', async () => {
    const onLook = jest.fn();
    const user = userEvent.setup();
    await render(
      <CompanionSheet view={view()} onEquip={jest.fn()} onLook={onLook} onClose={jest.fn()} />,
    );
    expect(screen.getByTestId('companion-sheet-body-man')).toHaveTextContent('Man');
    expect(screen.getByTestId('companion-sheet-body-man')).toBeChecked();
    expect(screen.getByTestId('companion-sheet-body-woman')).not.toBeChecked();
    await user.press(screen.getByTestId('companion-sheet-body-woman'));
    expect(onLook).toHaveBeenCalledWith({ body: 'woman' });
    await user.press(screen.getByTestId('companion-sheet-hairstyle-long'));
    expect(onLook).toHaveBeenCalledWith({ hairStyle: 'long' });
    await render(
      <CompanionSheet
        view={{ ...view(), look: { body: 'woman' } }}
        onEquip={jest.fn()}
        onLook={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    // A woman who never chose a style wears the long hair.
    expect(screen.getByTestId('companion-sheet-hairstyle-long')).toBeChecked();
  });
});

describe('TrinketUnlockPanel', () => {
  it('celebrates new trinkets with NEW TRINKET!', async () => {
    await render(<TrinketUnlockPanel accessoryIds={['iron_helm']} celebrate playKey="s3" />);
    expect(screen.getByText(BURST_TITLES.newTrinket)).toBeOnTheScreen();
    expect(screen.getByTestId('summary-trinket-iron_helm')).toHaveTextContent(/Iron helm/);
  });

  it('lists them quietly for a past session and renders nothing without any', async () => {
    await render(
      <TrinketUnlockPanel accessoryIds={['iron_helm']} celebrate={false} playKey="s3" />,
    );
    expect(screen.getByText('Trinkets earned')).toBeOnTheScreen();
    expect(screen.queryByText(BURST_TITLES.newTrinket)).toBeNull();
    await render(<TrinketUnlockPanel accessoryIds={[]} celebrate playKey="s4" />);
    expect(screen.queryByTestId('summary-trinkets')).toBeNull();
  });
});
