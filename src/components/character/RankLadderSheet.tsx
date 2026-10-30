import { ScrollView, StyleSheet, View } from 'react-native';

import { BRANCH_NAMES } from '@/data/skills/branches';
import { NON_RANK_BRANCHES } from '@/domain/character';
import { formatOgLevel, spokenOgLevel } from '@/domain/format';
import {
  rankLabel,
  rankProgressText,
  rankRequirement,
  type RankLadder,
  type RankLadderStep,
  type RankStepStatus,
} from '@/domain/rankLadder';
import { k, t } from '@/i18n';

import { Colors, RankColors, Spacing, TileFrames, type FrameStyle } from '../theme';
import { PixelFrame, PixelIcon, PixelModal, PixelText, SegmentedBar } from '../ui';

import { RANK_ICONS } from './RankCrest';

type Props = {
  ladder: RankLadder;
  onClose: () => void;
  testID?: string;
};

/** Caps label of each step's state, also read out. */
const STATUS_LABELS: Readonly<Record<RankStepStatus, string>> = {
  reached: k('Reached'),
  current: k('Your rank'),
  next: k('Next rank'),
  locked: k('Locked'),
};

/**
 * Frames like the Tree's tiles (DESIGN.md → Tree): reached ranks gold like a proficient node, the
 * next one with the rune glow of a ready node, locked ones as the legendary silhouette; the
 * current rank wears its crest's double frame.
 */
function frameOf(step: RankLadderStep): FrameStyle {
  switch (step.status) {
    case 'reached':
      return TileFrames.proficient;
    case 'current':
      return { lines: [Colors.ink, RankColors[step.rank], Colors.ink], fill: Colors.surfaceRaised };
    case 'next':
      return TileFrames.available;
    case 'locked':
      return TileFrames.legendary;
  }
}

/** "Acrobatics and Mobility": the branches left out of the rank, in the current language. */
function nonRankNames(): string {
  const names = NON_RANK_BRANCHES.map((branch) => t(BRANCH_NAMES[branch]));
  return names.length === 1
    ? names[0]
    : t('{a} and {b}', { a: names.slice(0, -1).join(', '), b: names[names.length - 1] });
}

function RankStep({
  step,
  branchesForRank,
  testID,
}: {
  step: RankLadderStep;
  branchesForRank: number;
  testID: string;
}) {
  const locked = step.status === 'locked';
  const requirement = rankRequirement(step);
  const progress = rankProgressText(step, branchesForRank);
  const closest = step.status === 'next' ? step.branchesBelow : [];
  const title = rankLabel(step.rank);
  const status = t(STATUS_LABELS[step.status]);
  const label = [
    title,
    status,
    requirement,
    progress || undefined,
    closest.length > 0
      ? t('Still below: {list}', {
          list: closest
            .map((peak) => `${t(BRANCH_NAMES[peak.branch])} ${spokenOgLevel(peak.ogLevel)}`)
            .join(', '),
        })
      : undefined,
  ]
    .filter(Boolean)
    .join('. ');
  return (
    <PixelFrame frame={frameOf(step)} padding={Spacing.sm} contentStyle={styles.gap}>
      <View
        style={styles.row}
        accessible
        accessibilityRole="text"
        accessibilityLabel={label}
        testID={testID}>
        <PixelIcon name={RANK_ICONS[step.rank]} tint={locked ? Colors.goldDark : undefined} />
        <View style={styles.text}>
          <PixelText variant="heading" color={locked ? Colors.textMuted : RankColors[step.rank]}>
            {title}
          </PixelText>
          <PixelText variant="small" tone="textMuted">
            {requirement}
          </PixelText>
        </View>
        <PixelText
          variant="label"
          tone={step.status === 'next' ? 'rune' : locked ? 'textMuted' : 'gold'}
          testID={`${testID}-status`}>
          {status}
        </PixelText>
      </View>
      {progress !== '' && (
        <View style={styles.gap}>
          <SegmentedBar
            fraction={Math.min(step.branchesAtLevel, branchesForRank) / branchesForRank}
            segments={branchesForRank}
            color={step.status === 'next' ? Colors.rune : Colors.goldDark}
            height={8}
          />
          <PixelText variant="small" tone="textMuted" testID={`${testID}-progress`}>
            {progress}
          </PixelText>
        </View>
      )}
      {closest.length > 0 && (
        <View style={styles.gap} testID={`${testID}-below`}>
          <PixelText variant="label" tone="rune">
            {t('Still below {level}, closest first', {
              level: formatOgLevel(step.minMedianOgLevel),
            })}
          </PixelText>
          {closest.map((peak) => (
            <View key={peak.branch} style={styles.branch}>
              <PixelText variant="small" style={styles.text}>
                {t(BRANCH_NAMES[peak.branch])}
              </PixelText>
              <PixelText variant="label" tone="textMuted">
                {formatOgLevel(peak.ogLevel)}
              </PixelText>
            </View>
          ))}
        </View>
      )}
    </PixelFrame>
  );
}

/**
 * The rank ladder (PLAN 6.7, ADR-054): every rank from Novice to Legend over the Character tab,
 * opened from the rank crest. Lowest rank first, so the hero's own and the next one sit near the
 * top of the sheet. Reached ranks are gold, the hero's own wears its crest frame, the next one
 * shows how many branches are at its level and which are still below, and the ones beyond are
 * silhouettes with their requirement. Everything comes from `rankLadder`. Mount it to open it.
 */
export function RankLadderSheet({ ladder, onClose, testID = 'rank-ladder' }: Props) {
  return (
    <PixelModal visible title={t('Rank ladder')} onClose={onClose} testID={testID}>
      <PixelText variant="small" tone="textMuted" testID={`${testID}-intro`}>
        {t(
          "Your rank is the median of your best Trial's tier in each of the {count} main branches (now {median}). {excluded} don't count. Reaching a rank's level in {n} branches always earns it.",
          {
            count: ladder.rankBranchCount,
            median: formatOgLevel(ladder.medianOgLevel),
            excluded: nonRankNames(),
            n: ladder.branchesForRank,
          },
        )}
      </PixelText>
      <ScrollView nestedScrollEnabled style={styles.scroll} contentContainerStyle={styles.list}>
        {ladder.steps.map((step) => (
          <RankStep
            key={step.rank}
            step={step}
            branchesForRank={ladder.branchesForRank}
            testID={`${testID}-${step.rank.toLowerCase()}`}
          />
        ))}
      </ScrollView>
    </PixelModal>
  );
}

/** The ladder scrolls inside the sheet so the close button stays on screen. */
const LADDER_MAX_HEIGHT = 420;

const styles = StyleSheet.create({
  scroll: {
    maxHeight: LADDER_MAX_HEIGHT,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
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
  branch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
