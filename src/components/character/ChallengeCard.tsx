import { StyleSheet, View } from 'react-native';

import { HERO_CLASS_BY_ID } from '@/data/classes';
import type { ChallengeView } from '@/domain/challenges';
import { classTitle } from '@/domain/classes';
import { CLASS_CHALLENGE_BONUS_XP } from '@/domain/xp';

import { Colors, Spacing } from '../theme';
import { PixelIcon, PixelText, SegmentedBar } from '../ui';

import { NewBadge } from './ClassBanner';
import { classColor } from './ClassEmblem';
import { CHALLENGE_FINE_PRINT, challengeCountText, challengeGoalText } from './challengeText';

type Props = {
  challenge: ChallengeView;
  testID?: string;
};

/** The most segments the bar draws (one per counted session or exercise). */
const MAX_SEGMENTS = 10;

/**
 * This week's class challenge on the Character tab (PLAN 6.9b, ADR-058), under the class banner:
 * the goal, a bar with the count, and the bonus; a COMPLETE tag once it is done, the badge count of
 * completed weeks, and a note when the worn class's own challenge only starts next week. Read-only:
 * it never asks for anything and nothing is lost by missing it.
 */
export function ChallengeCard({ challenge, testID = 'character-challenge' }: Props) {
  const heroClass = HERO_CLASS_BY_ID.get(challenge.classId);
  const title = heroClass ? classTitle(heroClass, challenge.tier) : challenge.classId;
  const goal = challengeGoalText(challenge.goal, challenge.target);
  const count = challengeCountText(challenge.goal, challenge.count, challenge.target);
  const next = challenge.nextClassId ? HERO_CLASS_BY_ID.get(challenge.nextClassId) : undefined;
  const status = challenge.completed
    ? `Complete: +${CLASS_CHALLENGE_BONUS_XP} XP earned`
    : `+${CLASS_CHALLENGE_BONUS_XP} XP when done`;
  const label = [
    `Weekly challenge of the ${title}: ${goal} this week`,
    count,
    status,
    challenge.completedWeeks > 0 ? `${challenge.completedWeeks} completed in total` : undefined,
  ]
    .filter(Boolean)
    .join('. ');
  return (
    <View style={styles.gap} testID={testID}>
      <View style={styles.row} accessible accessibilityRole="text" accessibilityLabel={label}>
        <PixelIcon name="scroll" />
        <View style={styles.text}>
          <PixelText variant="label" tone="textMuted">
            {`Weekly challenge · ${title}`}
          </PixelText>
          <PixelText variant="heading" testID={`${testID}-goal`}>
            {`${goal} this week`}
          </PixelText>
        </View>
        {challenge.completed && <NewBadge label="COMPLETE" testID={`${testID}-complete`} />}
      </View>
      <SegmentedBar
        fraction={challenge.fraction}
        segments={Math.min(MAX_SEGMENTS, Math.max(1, challenge.target))}
        color={challenge.completed ? Colors.gold : classColor(challenge.classId)}
        height={8}
      />
      <View style={styles.row}>
        <PixelText variant="small" style={styles.text} testID={`${testID}-count`}>
          {count}
        </PixelText>
        <PixelText variant="small" tone={challenge.completed ? 'gold' : 'rune'}>
          {status}
        </PixelText>
      </View>
      {challenge.completedWeeks > 0 && (
        <View style={styles.row} testID={`${testID}-badges`}>
          <PixelIcon name="star" />
          <PixelText variant="small" tone="gold">
            {`Challenge badges: ${challenge.completedWeeks}`}
          </PixelText>
        </View>
      )}
      {next && (
        <PixelText variant="small" tone="textMuted" testID={`${testID}-next`}>
          {`Fixed for this week. The ${next.name} challenge starts on Monday.`}
        </PixelText>
      )}
      {!challenge.pinned && (
        <PixelText variant="small" tone="textMuted">
          Your first session this week fixes the challenge for the week.
        </PixelText>
      )}
      <PixelText variant="small" tone="textMuted">
        {CHALLENGE_FINE_PRINT}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.xs,
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
