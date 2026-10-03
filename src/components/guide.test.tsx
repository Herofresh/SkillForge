import { render, screen, userEvent } from '@testing-library/react-native';

import { GUIDE, GUIDE_TOPICS, guideEntry } from '@/domain/guide';
import type { SafeguardWarning } from '@/domain/types';

import GuideScreen from '../../app/guide/index';
import GuideTopicScreen from '../../app/guide/[topic]';

import { GuideButton } from './guide/GuideButton';
import { SafeguardGuideNote } from './guide/SafeguardGuideNote';
import { GuidePanel } from './settings/GuidePanel';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  Stack: { Screen: () => null },
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
});

describe('GuideButton', () => {
  it('is a labelled "i" that opens only on a tap, with the summary and a way to the page', async () => {
    const user = userEvent.setup();
    const ranks = guideEntry('ranks');
    await render(<GuideButton topic="ranks" />);
    // Nothing pops up on its own.
    expect(screen.queryByTestId('guide-ranks-sheet')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'About Ranks' }));
    expect(screen.getByTestId('guide-ranks-sheet-summary')).toHaveTextContent(ranks.summary);
    await user.press(screen.getByTestId('guide-ranks-sheet-more'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/guide/[topic]',
      params: { topic: 'ranks' },
    });
    expect(screen.queryByTestId('guide-ranks-sheet')).toBeNull();
  });

  it('closes without leaving the screen', async () => {
    const user = userEvent.setup();
    await render(<GuideButton topic="streak" />);
    await user.press(screen.getByTestId('guide-streak'));
    await user.press(screen.getByTestId('guide-streak-sheet-close'));
    expect(screen.queryByTestId('guide-streak-sheet')).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe('the guide screens', () => {
  it('lists every entry and opens its page', async () => {
    const user = userEvent.setup();
    await render(<GuideScreen />);
    for (const entry of GUIDE) {
      expect(screen.getByRole('button', { name: entry.title })).toBeOnTheScreen();
    }
    await user.press(screen.getByTestId('guide-row-companion'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/guide/[topic]',
      params: { topic: 'companion' },
    });
  });

  it('shows a page with its summary, its details and the next topic', async () => {
    const user = userEvent.setup();
    mockParams = { topic: 'safeguards' };
    const entry = guideEntry('safeguards');
    await render(<GuideTopicScreen />);
    expect(screen.getByTestId('guide-page-safeguards')).toBeOnTheScreen();
    expect(screen.getByText(entry.summary)).toBeOnTheScreen();
    for (const paragraph of entry.more)
      expect(screen.getByText(`• ${paragraph}`)).toBeOnTheScreen();
    const next = guideEntry(GUIDE_TOPICS[GUIDE_TOPICS.indexOf('safeguards') + 1]);
    await user.press(screen.getByTestId('guide-page-next'));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/guide/[topic]',
      params: { topic: next.id },
    });
  });

  it('has no next button on the last page, and a note for an unknown topic', async () => {
    mockParams = { topic: GUIDE_TOPICS[GUIDE_TOPICS.length - 1] };
    await render(<GuideTopicScreen />);
    expect(screen.queryByTestId('guide-page-next')).toBeNull();
    mockParams = { topic: 'nope' };
    await render(<GuideTopicScreen />);
    expect(screen.getByText('Unknown topic')).toBeOnTheScreen();
  });
});

describe('Settings → How SkillForge works', () => {
  it('opens the guide and explains the widgets', async () => {
    const user = userEvent.setup();
    await render(<GuidePanel />);
    await user.press(screen.getByTestId('open-guide'));
    expect(mockRouter.push).toHaveBeenCalledWith('/guide');
    await user.press(screen.getByRole('button', { name: 'About Home-screen widgets' }));
    expect(screen.getByTestId('guide-widgets-sheet-summary')).toHaveTextContent(
      guideEntry('widgets').summary,
    );
  });
});

describe('SafeguardGuideNote', () => {
  const note: SafeguardWarning = {
    code: 'prerequisites_unmet',
    message: 'Usually comes later.',
    severity: 'info',
  };
  const budget: SafeguardWarning = {
    code: 'straight_arm_budget',
    message: 'Over the budget.',
    severity: 'warning',
  };

  it('offers the safeguards entry next to a tendon warning only', async () => {
    await render(<SafeguardGuideNote warnings={[note]} />);
    expect(screen.queryByText('Why these warnings?')).toBeNull();
    await render(<SafeguardGuideNote warnings={[note, budget]} />);
    expect(screen.getByText('Why these warnings?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'About Straight-arm safeguards' })).toBeOnTheScreen();
  });
});
