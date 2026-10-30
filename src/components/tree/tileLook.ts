/**
 * How each tile state looks and reads (PLAN 4.2, docs/DESIGN.md → Tree). The domain names the
 * states (`TileState`); this file words them for the UI. Frames are `TileFrames` in theme.ts.
 */
import { spokenOgLevel } from '@/domain/format';
import type { TileState, TreeTile } from '@/domain/treeView';
import { k, t } from '@/i18n';

import type { ColorToken } from '../theme';
import type { IconName } from '../ui';

export interface TileLook {
  icon: IconName;
  /** Short caps label on the tile, e.g. "LOCKED" (English; shown through `t`). */
  label: string;
  /** Color of the label and the name. */
  tone: ColorToken;
  nameTone: ColorToken;
  /** One sentence for the legend and screen readers (English; shown through `t`). */
  description: string;
}

export const TILE_LOOKS: Readonly<Record<TileState, TileLook>> = {
  legendary: {
    icon: 'flame',
    label: k('Legendary'),
    tone: 'gold',
    nameTone: 'textMuted',
    description: k('A legendary skill far ahead: something to dream of.'),
  },
  locked: {
    icon: 'lock',
    label: k('Locked'),
    tone: 'textMuted',
    nameTone: 'textMuted',
    description: k('Its prerequisites are not met yet. You can still unlock it yourself.'),
  },
  available: {
    icon: 'rune',
    label: k('Ready'),
    tone: 'rune',
    nameTone: 'text',
    description: k('Open to train: the next step on the path.'),
  },
  training: {
    icon: 'sword',
    label: k('Training'),
    tone: 'gold',
    nameTone: 'text',
    description: k('You are training it: sets earn XP up to level 5 until the Trial.'),
  },
  proficient: {
    icon: 'shield',
    label: k('Proficient'),
    tone: 'gold',
    nameTone: 'gold',
    description: k('Trial passed: it opens the skills that build on it.'),
  },
  mastered: {
    icon: 'star',
    label: k('Mastered'),
    tone: 'gold',
    nameTone: 'gold',
    description: k('Level 10: fully mastered.'),
  },
};

/** Tiles that show a level and an XP bar. */
export const TRAINED_TILE_STATES: readonly TileState[] = ['training', 'proficient', 'mastered'];

/**
 * What a screen reader says for a node tile, in the column (NodeTile) and on the map (MapNode):
 * name, state, level once trained, OG level, and the straight-arm / goal / custom / self-unlock notes.
 */
export function tileAccessibilityLabel(tile: TreeTile, custom: boolean): string {
  const { node, state, level, isGoal, status } = tile;
  return [
    node.name,
    t(TILE_LOOKS[state].label),
    TRAINED_TILE_STATES.includes(state) ? t('level {n}', { n: level.level }) : undefined,
    level.capped ? t('trial needed to level further') : undefined,
    spokenOgLevel(node.ogLevel),
    node.straightArm ? t('straight-arm') : undefined,
    isGoal ? t('goal') : undefined,
    custom ? t('custom') : undefined,
    status.selfUnlocked && status.unmetHard.length > 0 ? t('unlocked by you') : undefined,
  ]
    .filter(Boolean)
    .join(', ');
}

/** The caps state line of an untrained tile ("Ready · Unlocked by you" after a self-unlock). */
export function tileStateLabel(tile: TreeTile): string {
  return tile.status.selfUnlocked && tile.state === 'available'
    ? t('Ready · Unlocked by you')
    : t(TILE_LOOKS[tile.state].label);
}
