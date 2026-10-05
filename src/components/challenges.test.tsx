import { render, screen } from '@testing-library/react-native';

import { HERO_CLASSES } from '@/data/classes';
import type { ChallengePin, ChallengeView } from '@/domain/challenges';
import { classLadder, ruleParts, type ClassFacts } from '@/domain/classes';
import { CLASS_CHALLENGE_BONUS_XP } from '@/domain/xp';
import { localWeekBounds } from '@/lib/time';

import { ChallengeCard } from './character/ChallengeCard';
import { ChallengeProgressPanel } from './character/ChallengeProgressPanel';
import { ClassSheet } from './character/ClassSheet';
import { challengeCountText, challengeGoalText } from './character/challengeText';
import { partText } from './character/classText';
import { SessionResultPanels } from './train/SessionResultPanels';
import { BURST_TITLES } from './ui';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const MONDAY = new Date(2026, 8, 21, 12).getTime();
const WEEK = localWeekBounds(MONDAY);
const PINS: ChallengePin[] = [{ ...WEEK, classId: 'ranger', tier: 1 }];

describe('challenge words', () => {
  it('words every goal kind', () => {
    expect(challengeGoalText({ kind: 'sessions' }, 3)).toBe('Train in 3 sessions');
    expect(challengeGoalText({ kind: 'complete_sessions' }, 1)).toBe(
      'Finish 1 session without skipping a set',
    );
    expect(challengeGoalText({ kind: 'sessions_training', attributes: ['pull'] }, 3)).toBe(
      'Pull work in 3 sessions',
    );
    expect(challengeGoalText({ kind: 'sessions_training', attributes: ['push', 'pull'] }, 2)).toBe(
      'Push and pull work in 2 sessions',
    );
    expect(challengeGoalText({ kind: 'exercises_training', attribute: 'mobility' }, 4)).toBe(
      '4 mobility exercises',
    );
    expect(challengeGoalText({ kind: 'trial_attempts' }, 1)).toBe('Attempt 1 Trial');
    expect(challengeCountText({ kind: 'trial_attempts' }, 3, 2)).toBe('2 / 2 Trials');
    expect(challengeCountText({ kind: 'exercises_training', attribute: 'mobility' }, 1, 4)).toBe(
      '1 / 4 exercises',
    );
  });

  it('reads the Sorcerer rank progress naturally (6.9 review)', () => {
    const facts: ClassFacts = {
      attributes: { push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 },
      sessions: 0,
      rank: 'Novice',
      medianOgLevel: 0,
    };
    const [part] = ruleParts({ kind: 'rank', rank: 'Adept' }, facts);
    expect(partText(part)).toBe('You are Novice · branch median Foundation · Adept at Tier 6');
  });
});

const view = (overrides: Partial<ChallengeView> = {}): ChallengeView => ({
  classId: 'ranger',
  tier: 1,
  goal: { kind: 'sessions_training', attributes: ['pull'] },
  target: 2,
  count: 1,
  completed: false,
  fraction: 0.5,
  ...WEEK,
  pinned: true,
  completedWeeks: 0,
  ...overrides,
});

describe('ChallengeCard', () => {
  it('shows the goal, the count and the bonus while open', async () => {
    await render(<ChallengeCard challenge={view()} />);
    expect(screen.getByTestId('character-challenge-goal')).toHaveTextContent(
      'Pull work in 2 sessions this week',
    );
    expect(screen.getByTestId('character-challenge-count')).toHaveTextContent('1 / 2 sessions');
    expect(screen.getByText(`+${CLASS_CHALLENGE_BONUS_XP} XP when done`)).toBeOnTheScreen();
    expect(screen.getByText(/Weekly challenge · Ranger/)).toBeOnTheScreen();
    expect(screen.getByText(/missing it costs nothing/)).toBeOnTheScreen();
    expect(screen.queryByTestId('character-challenge-complete')).toBeNull();
    expect(screen.queryByTestId('character-challenge-badges')).toBeNull();
  });

  it('shows the completed state, the badges and the next class', async () => {
    await render(
      <ChallengeCard
        challenge={view({
          count: 2,
          completed: true,
          fraction: 1,
          completedWeeks: 3,
          nextClassId: 'monk',
        })}
      />,
    );
    expect(screen.getByTestId('character-challenge-complete')).toHaveTextContent('COMPLETE');
    expect(screen.getByText(`Complete: +${CLASS_CHALLENGE_BONUS_XP} XP earned`)).toBeOnTheScreen();
    expect(screen.getByTestId('character-challenge-badges')).toHaveTextContent(
      'Challenge badges: 3',
    );
    expect(screen.getByTestId('character-challenge-next')).toHaveTextContent(
      /The Monk challenge starts on Monday/,
    );
  });

  it('says when the first session fixes a previewed challenge', async () => {
    await render(<ChallengeCard challenge={view({ pinned: false, count: 0, fraction: 0 })} />);
    expect(screen.getByText(/first session this week fixes the challenge/)).toBeOnTheScreen();
  });
});

describe('ChallengeProgressPanel', () => {
  const step = { start: WEEK.start, gained: 1, count: 1, target: 2, completed: false };

  it('shows the progress this session made', async () => {
    await render(
      <ChallengeProgressPanel step={step} pins={PINS} bonus={0} celebrate playKey="s1" />,
    );
    expect(screen.getByText('Weekly challenge · Ranger')).toBeOnTheScreen();
    expect(screen.getByTestId('summary-challenge-count')).toHaveTextContent('1 / 2 sessions');
    expect(screen.getByTestId('summary-challenge-line')).toHaveTextContent('+1 this session');
    expect(screen.queryByText(BURST_TITLES.challengeComplete)).toBeNull();
  });

  it('bursts CHALLENGE COMPLETE! with the bonus when the session finished it', async () => {
    await render(
      <ChallengeProgressPanel
        step={{ ...step, count: 2, completed: true }}
        pins={PINS}
        bonus={CLASS_CHALLENGE_BONUS_XP}
        celebrate
        playKey="s2"
      />,
    );
    expect(screen.getByText(BURST_TITLES.challengeComplete)).toBeOnTheScreen();
    expect(screen.getByTestId('summary-challenge-line')).toHaveTextContent(
      `Complete! +${CLASS_CHALLENGE_BONUS_XP} XP`,
    );
  });

  it('has no burst in history, says when it was already done, and hides without a step', async () => {
    const { rerender } = await render(
      <ChallengeProgressPanel
        step={{ ...step, count: 3, gained: 1 }}
        pins={PINS}
        bonus={0}
        celebrate={false}
        playKey="s3"
      />,
    );
    expect(screen.getByTestId('summary-challenge-line')).toHaveTextContent(
      'Already complete this week',
    );
    await rerender(<ChallengeProgressPanel pins={PINS} bonus={0} celebrate playKey="s4" />);
    expect(screen.queryByTestId('summary-challenge')).toBeNull();
  });
});

describe('the challenge in the class sheet and the summary bonuses', () => {
  it('shows each class its weekly challenge at its tier', async () => {
    const facts: ClassFacts = {
      attributes: { push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 },
      sessions: 0,
      rank: 'Novice',
      medianOgLevel: 0,
    };
    const rows = classLadder(HERO_CLASSES, facts, { unlocks: {}, seen: {} });
    await render(<ClassSheet rows={rows} onWear={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByTestId('class-sheet-recruit-challenge')).toHaveTextContent(
      'Weekly challenge: Train in 2 sessions',
    );
    expect(screen.getByTestId('class-sheet-ranger-challenge')).toHaveTextContent(
      'Weekly challenge: Pull work in 2 sessions',
    );
    expect(screen.getByTestId('class-sheet-druid-challenge')).toHaveTextContent(
      'Weekly challenge: 3 mobility exercises',
    );
  });

  it('lists the challenge bonus with the other bonuses', async () => {
    await render(
      <SessionResultPanels
        view={{
          totalXp: 70,
          exerciseXp: 18,
          completionBonus: 2,
          streakBonus: 0,
          challengeBonus: CLASS_CHALLENGE_BONUS_XP,
          streak: 1,
          exercises: [],
          levelUps: [],
          unlocked: [],
          warnings: [],
        }}
        celebrate={false}
        playKey="s"
        subtitle="Session logged"
        onOpenNode={jest.fn()}
      />,
    );
    expect(
      screen.getByText(
        `18 from exercises · +2 completion · +0 streak · +${CLASS_CHALLENGE_BONUS_XP} challenge`,
      ),
    ).toBeOnTheScreen();
  });
});
