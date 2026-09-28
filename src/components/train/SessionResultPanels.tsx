import { Pressable, StyleSheet, View } from 'react-native';

import type { SummaryView } from '@/domain/trainView';

import { Spacing, TOUCH_TARGET } from '../theme';
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
 * and XP per exercise, with the session time and the time per exercise when known (PLAN 5.4).
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
        <PixelText variant="small" tone="textMuted" align="center">
          {`${view.exerciseXp} from exercises · +${view.completionBonus} completion · +${view.streakBonus} streak`}
        </PixelText>
        {view.sessionTime !== undefined && (
          <View style={styles.time} testID="summary-session-time">
            <PixelIcon name="hourglass" />
            <PixelText variant="label" tone="rune">
              {`Session time ${view.sessionTime}`}
            </PixelText>
          </View>
        )}
      </PixelFrame>

      <PixelFrame variant="gold" contentStyle={styles.gap} testID="summary-streak">
        <View style={styles.row}>
          <PixelIcon name="flame" />
          <PixelText variant="heading">
            {`Streak: ${view.streak} ${view.streak === 1 ? 'session' : 'sessions'}`}
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
              Level ups
            </PixelText>
          )}
          {view.levelUps.map((levelUp) => (
            <PixelText key={levelUp.nodeId}>
              {`${levelUp.name}: LV ${levelUp.from} → ${levelUp.to}`}
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
              Unlocked
            </PixelText>
          )}
          {view.unlocked.map((node) => (
            <Pressable
              key={node.nodeId}
              onPress={() => onOpenNode(node.nodeId)}
              accessibilityRole="link"
              accessibilityLabel={`Open ${node.name}`}
              style={styles.link}>
              <PixelIcon name="rune" />
              <PixelText tone="rune">{node.name}</PixelText>
            </Pressable>
          ))}
        </PixelFrame>
      )}

      <PixelFrame variant="parchment" contentStyle={styles.gap} testID="summary-exercises">
        <PixelText variant="label" tone="textOnParchment" accessibilityRole="header">
          Exercises
        </PixelText>
        {view.exercises.map((exercise) => (
          <Pressable
            key={exercise.nodeId}
            onPress={() => onOpenNode(exercise.nodeId)}
            accessibilityRole="link"
            accessibilityLabel={`${exercise.name}: ${exercise.outcomeLabel}, ${exercise.xp} XP${exercise.time !== undefined ? `, time ${exercise.time}` : ''}`}
            style={styles.exercise}>
            <View style={styles.exerciseText}>
              <PixelText tone="textOnParchment">{exercise.name}</PixelText>
              <PixelText variant="small" tone="textOnParchment">
                {exercise.outcomeLabel +
                  (exercise.trialPassed
                    ? ' · Trial passed'
                    : exercise.trialAttempted
                      ? ' · Trial not passed yet'
                      : '') +
                  (exercise.time !== undefined ? ` · ${exercise.time}` : '')}
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
});
