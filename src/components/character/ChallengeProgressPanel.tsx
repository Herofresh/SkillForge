import { StyleSheet, View } from 'react-native';

import { HERO_CLASS_BY_ID } from '@/data/classes';
import { classChallenge, pinAt, type ChallengePin, type ChallengeStep } from '@/domain/challenges';
import { classTitle } from '@/domain/classes';

import { Colors, Spacing } from '../theme';
import { BURST_TITLES, LevelUpBurst, PixelFrame, PixelText, SegmentedBar } from '../ui';

import { classColor } from './ClassEmblem';
import { challengeCountText, challengeGoalText } from './challengeText';

type Props = {
  /** What the session did for its week's challenge (`SummaryView.challenge`); none = no panel. */
  step?: ChallengeStep;
  /** The pinned weeks (to name the class whose challenge it is). */
  pins: readonly ChallengePin[];
  /** XP the challenge paid in this session (the summary's `challengeBonus`). */
  bonus: number;
  /** Plays the CHALLENGE COMPLETE! burst (the fresh summary); off for history. */
  celebrate: boolean;
  playKey: string;
};

const MAX_SEGMENTS = 10;

/**
 * The weekly class challenge on a session summary (PLAN 6.9b): the session's share ("+1"), the
 * week's count, and a CHALLENGE COMPLETE! burst with the bonus when this session finished it.
 * Renders nothing when the session's week has no challenge.
 */
export function ChallengeProgressPanel({ step, pins, bonus, celebrate, playKey }: Props) {
  const pin = step ? pinAt(pins, step.start) : undefined;
  const heroClass = pin ? HERO_CLASS_BY_ID.get(pin.classId) : undefined;
  const challenge = heroClass && pin ? classChallenge(heroClass, pin.tier) : undefined;
  if (!step || !pin || !heroClass || !challenge) return null;
  const title = classTitle(heroClass, pin.tier);
  const goal = `${challengeGoalText(challenge.goal, step.target)} this week`;
  const count = challengeCountText(challenge.goal, step.count, step.target);
  const alreadyDone = !step.completed && step.count - step.gained >= step.target;
  const line = step.completed
    ? `Complete! +${bonus} XP`
    : alreadyDone
      ? 'Already complete this week'
      : step.gained > 0
        ? `+${step.gained} this session`
        : 'This session added nothing to it';
  return (
    <PixelFrame variant="arcane" contentStyle={styles.gap} testID="summary-challenge">
      {celebrate && step.completed ? (
        <LevelUpBurst
          title={BURST_TITLES.challengeComplete}
          subtitle={`${title} · +${bonus} XP`}
          playKey={`${playKey}-challenge`}
        />
      ) : (
        <PixelText variant="label" tone="arcane" accessibilityRole="header">
          {`Weekly challenge · ${title}`}
        </PixelText>
      )}
      <View
        style={styles.gap}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${goal}. ${count}. ${line}.`}>
        <PixelText>{goal}</PixelText>
        <SegmentedBar
          fraction={Math.min(1, step.count / Math.max(1, step.target))}
          segments={Math.min(MAX_SEGMENTS, Math.max(1, step.target))}
          color={step.count >= step.target ? Colors.gold : classColor(heroClass.id)}
          height={8}
        />
        <View style={styles.row}>
          <PixelText variant="small" style={styles.text} testID="summary-challenge-count">
            {count}
          </PixelText>
          <PixelText
            variant="small"
            tone={step.completed ? 'gold' : 'rune'}
            testID="summary-challenge-line">
            {line}
          </PixelText>
        </View>
      </View>
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
  },
});
