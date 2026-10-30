import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HERO_CLASS_BY_ID } from '@/data/classes';
import { classChallenge } from '@/domain/challenges';
import { tierNumeral, type ClassRow, type ClassRowStatus } from '@/domain/classes';
import { k, t } from '@/i18n';

import { Colors, Spacing, TileFrames, type FrameStyle } from '../theme';
import { PixelButton, PixelFrame, PixelModal, PixelText, SegmentedBar } from '../ui';

import { NewBadge } from './ClassBanner';
import { ClassEmblem, classColor } from './ClassEmblem';
import { challengeGoalText } from './challengeText';
import { partText, requirementText } from './classText';

type Props = {
  rows: readonly ClassRow[];
  /** Wear a reached class. */
  onWear: (classId: string) => void;
  /** Called on close; the screen marks the reached tiers as seen then. */
  onClose: () => void;
  testID?: string;
};

const STATUS_LABELS: Readonly<Record<ClassRowStatus, string>> = {
  worn: k('Wearing'),
  unlocked: k('Unlocked'),
  locked: k('Locked'),
};

/** Rows like the rank ladder: the worn class in its color, unlocked gold, locked a silhouette. */
function frameOf(row: ClassRow): FrameStyle {
  switch (row.status) {
    case 'worn':
      return {
        lines: [Colors.ink, classColor(row.classId), Colors.ink],
        fill: Colors.surfaceRaised,
      };
    case 'unlocked':
      return TileFrames.proficient;
    case 'locked':
      return TileFrames.legendary;
  }
}

/** One part per line under the bar, e.g. "Push 12 / 30". */
function NextTier({ row, testID }: { row: ClassRow; testID: string }) {
  const next = row.next;
  if (!next) {
    return (
      <PixelText variant="small" tone="gold" testID={`${testID}-next`}>
        {t('Highest tier reached')}
      </PixelText>
    );
  }
  const locked = row.status === 'locked';
  const requirement = requirementText(next.rule);
  const heading = locked
    ? t('Unlock: {requirement}', { requirement })
    : t('Next: {title} (tier {tier}) · {requirement}', {
        title: t(next.title),
        tier: tierNumeral(next.tier),
        requirement,
      });
  return (
    <View style={styles.gap} testID={`${testID}-next`}>
      <PixelText variant="small" tone={locked ? 'textMuted' : 'text'}>
        {heading}
      </PixelText>
      <SegmentedBar
        fraction={next.fraction}
        segments={10}
        color={locked ? Colors.goldDark : classColor(row.classId)}
        height={8}
      />
      <PixelText variant="small" tone="textMuted" testID={`${testID}-progress`}>
        {next.parts.map(partText).join(' · ')}
      </PixelText>
    </View>
  );
}

function ClassRowView({
  row,
  isNew,
  onWear,
  testID,
}: {
  row: ClassRow;
  isNew: boolean;
  onWear: (classId: string) => void;
  testID: string;
}) {
  const heroClass = HERO_CLASS_BY_ID.get(row.classId);
  const challenge = heroClass ? classChallenge(heroClass, row.tier) : undefined;
  const challengeLine = challenge
    ? t('Weekly challenge: {goal}', {
        goal: challengeGoalText(challenge.goal, challenge.target),
      })
    : undefined;
  const locked = row.status === 'locked';
  const tierLine =
    row.tierCount <= 1
      ? t('Starting class')
      : locked
        ? t('{n} tiers', { n: row.tierCount })
        : t('Tier {tier} of {count}', {
            tier: tierNumeral(row.tier),
            count: tierNumeral(row.tierCount),
          });
  const title = t(row.title);
  const name = t(row.name);
  const status = t(STATUS_LABELS[row.status]);
  const flavor = heroClass ? t(heroClass.flavor) : undefined;
  const label = [
    title,
    row.title !== row.name ? t('{name} class', { name }) : undefined,
    status,
    tierLine,
    isNew ? t('New') : undefined,
    flavor,
    challengeLine,
    row.next
      ? `${
          locked
            ? t('Unlock: {requirement}', { requirement: requirementText(row.next.rule) })
            : t('Next tier, {title}: {requirement}', {
                title: t(row.next.title),
                requirement: requirementText(row.next.rule),
              })
        }. ` + row.next.parts.map(partText).join(', ')
      : undefined,
  ]
    .filter(Boolean)
    .join('. ');
  return (
    <PixelFrame frame={frameOf(row)} padding={Spacing.sm} contentStyle={styles.gap}>
      <View
        style={styles.row}
        accessible
        accessibilityRole="text"
        accessibilityLabel={label}
        testID={testID}>
        <ClassEmblem classId={row.classId} tier={row.tier} size={36} />
        <View style={styles.text}>
          <PixelText variant="heading" color={locked ? Colors.textMuted : classColor(row.classId)}>
            {title}
          </PixelText>
          <PixelText variant="label" tone="textMuted">
            {row.title !== row.name ? `${name} · ${tierLine}` : tierLine}
          </PixelText>
        </View>
        {isNew && <NewBadge testID={`${testID}-new`} />}
        <PixelText
          variant="label"
          tone={row.status === 'worn' ? 'gold' : locked ? 'textMuted' : 'rune'}
          testID={`${testID}-status`}>
          {status}
        </PixelText>
      </View>
      {flavor !== undefined && (
        <PixelText variant="small" tone="textMuted">
          {flavor}
        </PixelText>
      )}
      {challengeLine && (
        <PixelText variant="small" tone="rune" testID={`${testID}-challenge`}>
          {challengeLine}
        </PixelText>
      )}
      <NextTier row={row} testID={testID} />
      {row.status === 'unlocked' && (
        <PixelButton
          label={t('Wear {title}', { title })}
          icon="helmet"
          variant="secondary"
          onPress={() => onWear(row.classId)}
          testID={`${testID}-wear`}
        />
      )}
    </PixelFrame>
  );
}

/**
 * The class sheet (PLAN 6.9, ADR-057): every hero class over the Character tab, opened from the
 * class banner. Unlocked classes show their tier, the next tier's requirement and progress, and a
 * "Wear" button; locked ones are silhouettes with what they need, like the rank ladder. NEW tags
 * mark tiers reached since the sheet was last opened (kept while it is open; the screen marks
 * them seen on close). Everything comes from `classLadder`. Mount it to open it.
 */
export function ClassSheet({ rows, onWear, onClose, testID = 'class-sheet' }: Props) {
  // The NEW tags as they were when the sheet opened, so wearing a class doesn't hide them.
  const [newIds] = useState(
    () => new Set(rows.filter((row) => row.isNew).map((row) => row.classId)),
  );
  return (
    <PixelModal visible title={t('Classes')} onClose={onClose} testID={testID}>
      <PixelText variant="small" tone="textMuted" testID={`${testID}-intro`}>
        {t(
          'Classes are titles your training earns. Each needs a fixed amount of attribute points (or sessions, or a rank) and grows over three tiers. They change only how your hero looks, and a class you have earned stays yours. Pick one to wear: it also offers an optional weekly challenge.',
        )}
      </PixelText>
      <ScrollView nestedScrollEnabled style={styles.scroll} contentContainerStyle={styles.list}>
        {rows.map((row) => (
          <ClassRowView
            key={row.classId}
            row={row}
            isNew={newIds.has(row.classId)}
            onWear={onWear}
            testID={`${testID}-${row.classId}`}
          />
        ))}
      </ScrollView>
    </PixelModal>
  );
}

/** The list scrolls inside the sheet so the close button stays on screen. */
const SHEET_MAX_HEIGHT = 460;

const styles = StyleSheet.create({
  scroll: {
    maxHeight: SHEET_MAX_HEIGHT,
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
});
