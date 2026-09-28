import { StyleSheet, View } from 'react-native';

import { formatLevelProgress, formatOgLevel, spokenOgLevel } from '@/domain/format';
import { PROFICIENT_LEVEL } from '@/domain/progression';
import { tierForOgLevel } from '@/domain/tier';
import type { TreeTile } from '@/domain/treeView';

import { Spacing, TileFrames } from '../theme';
import { LevelBadge, LevelUpBurst, PixelFrame, PixelIcon, PixelText, TierChip, XPBar } from '../ui';

import { CustomBadge } from '../editor/CustomBadge';
import { GoalMarker } from '../tree/NodeTile';
import { TILE_LOOKS } from '../tree/tileLook';

type Props = {
  tile: TreeTile;
  /** Set after a self-unlock to replay the "UNLOCKED!" burst. */
  unlockBurstKey?: number;
  /** The user added (`added`) or changed (`edited`) this node: shows the "Custom" badge. */
  custom?: 'added' | 'edited';
};

/**
 * The top of the node detail, framed like its tree tile: big state icon, name, tier, OG level,
 * state, goal marker, and the level with its XP bar (the cap and banked XP explained).
 */
export function NodeHeader({ tile, unlockBurstKey, custom }: Props) {
  const { node, state, level, isGoal, status } = tile;
  const look = TILE_LOOKS[state];
  const unlockedByUser = status.selfUnlocked && status.unmetHard.length > 0;
  return (
    <PixelFrame frame={TileFrames[state]} contentStyle={styles.content} testID="detail-header">
      <View style={styles.row}>
        <PixelIcon name={look.icon} size={48} label={look.label} />
        <View style={styles.text}>
          <PixelText variant="title" accessibilityRole="header">
            {node.name}
          </PixelText>
          <View style={styles.meta}>
            <TierChip tier={tierForOgLevel(node.ogLevel)} />
            <PixelText
              variant="label"
              tone="textMuted"
              accessibilityLabel={spokenOgLevel(node.ogLevel)}>
              {formatOgLevel(node.ogLevel)}
            </PixelText>
            {node.straightArm && (
              <PixelText variant="label" tone="ember">
                Straight-arm
              </PixelText>
            )}
          </View>
        </View>
      </View>
      <View style={styles.meta}>
        <PixelText variant="label" tone={look.tone} testID="detail-state">
          {look.label}
        </PixelText>
        {isGoal && <GoalMarker testID="detail-goal-marker" />}
        {custom && <CustomBadge kind={custom} testID="detail-custom" />}
      </View>
      <PixelText variant="small" tone="textMuted">
        {look.description}
      </PixelText>
      {unlockedByUser && (
        <PixelText variant="small" tone="rune" testID="detail-self-unlocked">
          You unlocked this yourself. Its prerequisites are still listed below.
        </PixelText>
      )}
      {unlockBurstKey !== undefined && (
        <LevelUpBurst title="UNLOCKED!" subtitle={node.name} playKey={unlockBurstKey} />
      )}
      <View style={styles.level}>
        <LevelBadge level={level.level} testID="detail-level" />
        <View style={styles.bar}>
          <XPBar
            label="Node XP"
            fraction={level.fraction}
            valueText={formatLevelProgress(level)}
            testID="detail-xp"
          />
        </View>
      </View>
      {level.capped && (
        <PixelText variant="small" tone="gold">
          {`Level ${PROFICIENT_LEVEL} is the cap until you pass the Trial.` +
            (level.banked > 0 ? ` ${level.banked} XP is banked and counts once you pass it.` : '')}
        </PixelText>
      )}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  bar: {
    flex: 1,
  },
});
