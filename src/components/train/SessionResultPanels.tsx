import { Pressable, StyleSheet, View } from 'react-native';

import { TRIAL_NEEDED_LABEL, trialAlsoCountsText, trialNeededNote } from '@/domain/format';
import type { SummaryView } from '@/domain/trainView';
import { t } from '@/i18n';

import { Spacing, TOUCH_TARGET } from '../theme';
import { GuideButton } from '../guide/GuideButton';
import { BURST_TITLES, LevelUpBurst, PixelFrame, PixelIcon, PixelText } from '../ui';

type Props = {
  view: SummaryView;
  /** Plays the QUEST COMPLETE / LEVEL UP! / UNLOCKED! bursts (the fresh summary); off for history. */
  celebrate: boolean;
  /** Replays the bursts when it changes (the session id). */
  playKey: string;
  /** Subtitle of the XP panel, e.g. "Session logged" or the session's date. */
  subtitle: string;
  onOpenNode: (nodeId: string) => void;
};

/**
 * What a session earned (PLAN 4.4, 4.5): total XP with its bonuses, the streak, level-ups, unlocks
 * and XP per exercise, with the session time and the time per exercise when known (PLAN 5.4), and
 * the guide's "i" next to the XP breakdown (PLAN 6.10c).
 * Shared by the fresh Train summary and a past session opened from the
 * Character tab.
 */
export function SessionResultPanels({ view, celebrate, playKey, subtitle, onOpenNode }: Props) {
  return (
    <>
      <PixelFrame variant="rune">
        {celebrate ? (
          <LevelUpBurst title={BURST_TITLES.questComplete} subtitle={subtitle} playKey={playKey} />
        ) : (
          <PixelText variant="label" tone="rune" align="center">
            {subtitle}
          </PixelText>
        )}
        <PixelText variant="display" align="center" testID="summary-total-xp">
          {`+${view.totalXp} XP`}
        </PixelText>
        <View style={styles.row}>
          <View style={styles.flex}>
            <PixelText variant="small" tone="textMuted" align="center">
              {view.challengeBonus > 0
                ? t(
                    '{exercises} from exercises · +{completion} completion · +{streak} streak · +{challenge} challenge',
                    {
                      exercises: view.exerciseXp,
                      completion: view.completionBonus,
                      streak: view.streakBonus,
                      challenge: view.challengeBonus,
                    },
                  )
                : t('{exercises} from exercises · +{completion} completion · +{streak} streak', {
                    exercises: view.exerciseXp,
                    completion: view.completionBonus,
                    streak: view.streakBonus,
                  })}
            </PixelText>
          </View>
          <GuideButton topic="xp" />
        </View>
        {view.sessionTime !== undefined && (
          <View style={styles.time} testID="summary-session-time">
            <PixelIcon name="hourglass" />
            <PixelText variant="label" tone="rune">
              {t('Session time {time}', { time: view.sessionTime })}
            </PixelText>
          </View>
        )}
      </PixelFrame>

      <PixelFrame variant="gold" contentStyle={styles.gap} testID="summary-streak">
        <View style={styles.row}>
          <PixelIcon name="flame" />
          <PixelText variant="heading">
            {view.streak === 1
              ? t('Streak: 1 session')
              : t('Streak: {n} sessions', { n: view.streak })}
          </PixelText>
        </View>
      </PixelFrame>

      {view.levelUps.length > 0 && (
        <PixelFrame variant="rune" contentStyle={styles.gap} testID="summary-level-ups">
          {celebrate ? (
            <LevelUpBurst
              title={BURST_TITLES.levelUp}
              subtitle={view.levelUps[0].name}
              playKey={playKey}
            />
          ) : (
            <PixelText variant="label" tone="rune" accessibilityRole="header">
              {t('Level ups')}
            </PixelText>
          )}
          {view.levelUps.map((levelUp) => (
            <PixelText key={levelUp.nodeId}>
              {t('{name}: LV {from} → {to}', {
                name: levelUp.name,
                from: levelUp.from,
                to: levelUp.to,
              })}
            </PixelText>
          ))}
        </PixelFrame>
      )}

      {view.unlocked.length > 0 && (
        <PixelFrame variant="rune" contentStyle={styles.gap} testID="summary-unlocked">
          {celebrate ? (
            <LevelUpBurst
              title={BURST_TITLES.unlocked}
              subtitle={view.unlocked[0].name}
              playKey={playKey}
            />
          ) : (
            <PixelText variant="label" tone="rune" accessibilityRole="header">
              {t('Unlocked')}
            </PixelText>
          )}
          {view.unlocked.map((node) => (
            <Pressable
              key={node.nodeId}
              onPress={() => onOpenNode(node.nodeId)}
              accessibilityRole="link"
              accessibilityLabel={t('Open {name}', { name: node.name })}
              style={styles.link}>
              <PixelIcon name="rune" />
              <PixelText tone="rune">{node.name}</PixelText>
            </Pressable>
          ))}
        </PixelFrame>
      )}

      {view.trialsImplied.length > 0 && (
        <PixelFrame variant="rune" contentStyle={styles.gap} testID="summary-trial-also-counts">
          <PixelText tone="rune">
            {trialAlsoCountsText(view.trialsImplied.map((node) => node.name))}
          </PixelText>
        </PixelFrame>
      )}

      {view.awaitingTrial.length > 0 && (
        <PixelFrame variant="stone" contentStyle={styles.gap} testID="summary-trial-needed">
          <View style={styles.row}>
            <PixelIcon name="shield" />
            <PixelText variant="label" tone="ember" accessibilityRole="header">
              {t(TRIAL_NEEDED_LABEL)}
            </PixelText>
          </View>
          {view.awaitingTrial.map((node) => (
            <Pressable
              key={node.nodeId}
              onPress={() => onOpenNode(node.nodeId)}
              accessibilityRole="link"
              accessibilityLabel={t('{name}: {note} Opens the skill.', {
                name: node.name,
                note: trialNeededNote(node.banked),
              })}
              style={styles.link}>
              <PixelText style={styles.flex}>
                <PixelText tone="ember">{node.name}</PixelText>
                {`: ${trialNeededNote(node.banked)}`}
              </PixelText>
            </Pressable>
          ))}
        </PixelFrame>
      )}

      <PixelFrame variant="parchment" contentStyle={styles.gap} testID="summary-exercises">
        <PixelText variant="label" tone="textOnParchment" accessibilityRole="header">
          {t('Exercises')}
        </PixelText>
        {view.exercises.map((exercise) => (
          <Pressable
            key={exercise.nodeId}
            onPress={() => onOpenNode(exercise.nodeId)}
            accessibilityRole="link"
            accessibilityLabel={
              t('{name}: {outcome}, {xp} XP', {
                name: exercise.name,
                outcome: exercise.outcomeLabel,
                xp: exercise.xp,
              }) +
              (exercise.xpNote !== undefined ? ` (${exercise.xpNote})` : '') +
              (exercise.time !== undefined ? t(', time {time}', { time: exercise.time }) : '')
            }
            style={styles.exercise}>
            <View style={styles.exerciseText}>
              <PixelText tone="textOnParchment">{exercise.name}</PixelText>
              <PixelText variant="small" tone="textOnParchment">
                {[
                  exercise.outcomeLabel,
                  exercise.trialPassed
                    ? t('Trial passed')
                    : exercise.trialAttempted
                      ? t('Trial not passed yet')
                      : undefined,
                  exercise.xpNote,
                  exercise.time,
                ]
                  .filter((part) => part !== undefined)
                  .join(' · ')}
              </PixelText>
            </View>
            <PixelText variant="heading" tone="textOnParchment">
              {`+${exercise.xp} XP`}
            </PixelText>
          </Pressable>
        ))}
      </PixelFrame>
    </>
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
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  link: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exercise: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseText: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
