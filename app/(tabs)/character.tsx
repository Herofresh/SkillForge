import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AttributeRadar } from '@/components/character/AttributeRadar';
import { ChallengeCard } from '@/components/character/ChallengeCard';
import { ClassBanner } from '@/components/character/ClassBanner';
import { ClassSheet } from '@/components/character/ClassSheet';
import { CompanionCard } from '@/components/character/CompanionCard';
import { CompanionSheet } from '@/components/character/CompanionSheet';
import { useCompanion } from '@/components/character/useCompanion';
import { GoalProgressCard } from '@/components/character/GoalProgressCard';
import { RankCrest } from '@/components/character/RankCrest';
import { RankLadderSheet } from '@/components/character/RankLadderSheet';
import { SessionHistoryRow } from '@/components/character/SessionHistoryRow';
import { ATTRIBUTE_LABELS } from '@/components/node/AttributeChips';
import { AttributeColors, Colors, PIXEL, Spacing } from '@/components/theme';
import {
  LevelBadge,
  BURST_TITLES,
  EmptyState,
  LevelUpBurst,
  useLevelUpKey,
  PixelFrame,
  PixelIcon,
  PixelText,
  Screen,
  StatBar,
  WarningBanner,
  XPBar,
  type IconName,
} from '@/components/ui';
import { characterSheet, type CharacterSheet } from '@/domain/characterView';
import { useAppStore } from '@/store/useAppStore';

/**
 * The character sheet (PLAN 4.5): hero, level and XP, the companion (PLAN 6.10), rank crest (opens the rank ladder, PLAN 6.7),
 * the worn hero class (opens the class sheet, PLAN 6.9) with its weekly challenge (PLAN 6.9b), the attribute radar with the push/pull balance note, streak and totals, goals along their paths
 * and the recent sessions (each opens its summary). Everything comes from `characterSheet` over the store's state.
 */
export default function CharacterScreen() {
  const nodes = useAppStore((state) => state.nodes);
  const engine = useAppStore((state) => state.engine);
  const sessions = useAppStore((state) => state.sessions);
  const sessionResults = useAppStore((state) => state.sessionResults);
  const goals = useAppStore((state) => state.goals);
  const heroName = useAppStore((state) => state.profile?.heroName);
  const classes = useAppStore((state) => state.classes);
  const challengePins = useAppStore((state) => state.challengePins);
  // The streak depends on the time: read the clock whenever the tab comes into view.
  const [now, setNow] = useState(() => Date.now());
  useFocusEffect(useCallback(() => setNow(Date.now()), []));
  const sheet = useMemo(
    () =>
      characterSheet({
        nodes,
        engine,
        sessions,
        sessionResults,
        goals,
        classes,
        challengePins,
        now,
        ...(heroName !== undefined ? { heroName } : {}),
      }),
    [nodes, engine, sessions, sessionResults, goals, classes, challengePins, heroName, now],
  );
  return <CharacterBody sheet={sheet} now={now} />;
}

function Stat({
  icon,
  label,
  value,
  testID,
}: {
  icon: IconName;
  label: string;
  value: number;
  testID: string;
}) {
  return (
    <View
      style={styles.stat}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
      testID={testID}>
      <PixelIcon name={icon} />
      <PixelText variant="title">{String(value)}</PixelText>
      <PixelText variant="label" tone="textMuted" align="center">
        {label}
      </PixelText>
    </View>
  );
}

/** The companion (PLAN 6.10): its card, and the customize sheet it opens. */
function CompanionSection({ now }: { now: number }) {
  const view = useCompanion(now);
  const [open, setOpen] = useState(false);
  const equipAccessory = useAppStore((state) => state.equipAccessory);
  const setCompanionLook = useAppStore((state) => state.setCompanionLook);
  const markAccessoriesSeen = useAppStore((state) => state.markAccessoriesSeen);
  return (
    <>
      <CompanionCard view={view} onCustomize={() => setOpen(true)} />
      {open && (
        <CompanionSheet
          view={view}
          onEquip={equipAccessory}
          onLook={setCompanionLook}
          onClose={() => {
            setOpen(false);
            markAccessoriesSeen();
          }}
        />
      )}
    </>
  );
}

function CharacterBody({ sheet, now }: { sheet: CharacterSheet; now: number }) {
  const router = useRouter();
  const [balanceAcknowledged, setBalanceAcknowledged] = useState(false);
  const [ladderOpen, setLadderOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const selectClass = useAppStore((state) => state.selectClass);
  const markClassesSeen = useAppStore((state) => state.markClassesSeen);
  const newClasses = sheet.classes.filter((row) => row.isNew).length;
  const closeClasses = () => {
    setClassesOpen(false);
    markClassesSeen();
  };
  const levelUpKey = useLevelUpKey(sheet.level.level);
  const largest = Math.max(1, ...sheet.radar.map((axis) => axis.value));
  const openNode = (nodeId: string) =>
    router.push({ pathname: '/node/[nodeId]', params: { nodeId } });
  const xpText =
    sheet.level.xpForLevel === 0
      ? 'MAX'
      : `${sheet.level.xpIntoLevel} / ${sheet.level.xpForLevel} XP`;

  return (
    <Screen testID="character-screen">
      <PixelFrame variant="gold" contentStyle={styles.gap}>
        <View style={styles.hero}>
          <View style={styles.flex}>
            <PixelText variant="label" tone="textMuted">
              Hero
            </PixelText>
            <PixelText variant="display" testID="hero-name">
              {sheet.heroName ?? 'Nameless hero'}
            </PixelText>
          </View>
          <LevelBadge level={sheet.level.level} size="lg" testID="character-level" />
        </View>
        {levelUpKey !== undefined && (
          <LevelUpBurst
            title={BURST_TITLES.levelUp}
            subtitle={`Level ${levelUpKey}`}
            playKey={levelUpKey}
          />
        )}
        <XPBar
          label={`To level ${sheet.level.level + 1}`}
          fraction={sheet.level.fraction}
          valueText={xpText}
          testID="character-xp"
        />
        <PixelText variant="small" tone="textMuted" testID="character-total-xp">
          {`${sheet.totalXp} XP earned in total`}
        </PixelText>
      </PixelFrame>

      <CompanionSection now={now} />

      <PixelFrame contentStyle={styles.gap}>
        <RankCrest
          rank={sheet.rank}
          hint={sheet.rankHint}
          onPress={() => setLadderOpen(true)}
          testID="character-rank"
        />
        <View style={styles.divider}>
          <ClassBanner
            row={sheet.wornClass}
            newCount={newClasses}
            onPress={() => setClassesOpen(true)}
            testID="character-class"
          />
        </View>
        {sheet.challenge && (
          <View style={styles.divider}>
            <ChallengeCard challenge={sheet.challenge} />
          </View>
        )}
      </PixelFrame>
      {ladderOpen && <RankLadderSheet ladder={sheet.ladder} onClose={() => setLadderOpen(false)} />}
      {classesOpen && (
        <ClassSheet rows={sheet.classes} onWear={selectClass} onClose={closeClasses} />
      )}

      <PixelFrame contentStyle={styles.gap} testID="character-attributes">
        <PixelText variant="label" tone="rune" accessibilityRole="header">
          Attributes
        </PixelText>
        <AttributeRadar axes={sheet.radar} testID="attribute-radar" />
        {sheet.radar.every((axis) => axis.value === 0) && (
          <PixelText variant="small" tone="textMuted">
            Train or pass a Trial to grow your attributes. The radar shows their balance.
          </PixelText>
        )}
        {sheet.radar.map((axis) => (
          <StatBar
            key={axis.attribute}
            label={ATTRIBUTE_LABELS[axis.attribute]}
            value={axis.value}
            max={largest}
            color={AttributeColors[axis.attribute]}
            testID={`stat-${axis.attribute}`}
          />
        ))}
      </PixelFrame>

      {sheet.balance && (
        <WarningBanner
          title="Push and pull out of balance"
          message={sheet.balance.message}
          severity="info"
          acknowledged={balanceAcknowledged}
          onAcknowledge={() => setBalanceAcknowledged(true)}
          testID="balance-warning"
        />
      )}

      <PixelFrame variant="raised">
        <View style={styles.stats}>
          <Stat icon="flame" label="Streak" value={sheet.streak} testID="stat-streak" />
          <Stat
            icon="scroll"
            label="Sessions"
            value={sheet.totals.sessions}
            testID="stat-sessions"
          />
          <Stat icon="bar" label="Sets" value={sheet.totals.sets} testID="stat-sets" />
          <Stat
            icon="shield"
            label="Trials"
            value={sheet.totals.trialsPassed}
            testID="stat-trials"
          />
        </View>
      </PixelFrame>

      <View style={styles.gap}>
        <PixelText variant="label" tone="rune" accessibilityRole="header">
          Goals
        </PixelText>
        {sheet.goals.length === 0 ? (
          <EmptyState
            icon="star"
            title="No goals yet"
            message="Pick up to five in the Tree."
            action={{
              label: 'Open the Tree',
              icon: 'tree',
              variant: 'secondary',
              onPress: () => router.navigate('/tree'),
            }}
            testID="goals-empty"
          />
        ) : (
          sheet.goals.map((goal) => (
            <PixelFrame key={goal.nodeId}>
              <GoalProgressCard goal={goal} onOpen={openNode} testID={`goal-${goal.nodeId}`} />
            </PixelFrame>
          ))
        )}
      </View>

      <View style={styles.gap}>
        <PixelText variant="label" tone="rune" accessibilityRole="header">
          Recent sessions
        </PixelText>
        {sheet.recent.length === 0 ? (
          <EmptyState
            icon="scroll"
            title="No sessions yet"
            message="Your quest log starts with the first one."
            action={{ label: 'Train now', icon: 'sword', onPress: () => router.navigate('/train') }}
            testID="recent-empty"
          />
        ) : (
          <PixelFrame variant="parchment" contentStyle={styles.list} testID="recent-sessions">
            {sheet.recent.map((item, index) => (
              <View key={item.sessionId} style={index > 0 && styles.divider}>
                <SessionHistoryRow
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: '/session/[sessionId]',
                      params: { sessionId: item.sessionId },
                    })
                  }
                  testID={`recent-session-${index}`}
                />
              </View>
            ))}
          </PixelFrame>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  list: {
    gap: Spacing.xs,
  },
  divider: {
    paddingTop: Spacing.xs,
    borderTopWidth: PIXEL,
    borderTopColor: Colors.bronze,
  },
});
