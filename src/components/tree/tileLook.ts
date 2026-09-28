/**
 * How each tile state looks and reads (PLAN 4.2, docs/DESIGN.md → Tree). The domain names the
 * states (`TileState`); this file words them for the UI. Frames are `TileFrames` in theme.ts.
 */
import { spokenOgLevel } from '@/domain/format';
import type { TileState, TreeTile } from '@/domain/treeView';

import type { ColorToken } from '../theme';
import type { IconName } from '../ui';

export interface TileLook {
  icon: IconName;
  /** Short caps label on the tile, e.g. "LOCKED". */
  label: string;
  /** Color of the label and the name. */
  tone: ColorToken;
  nameTone: ColorToken;
  /** One sentence for the legend and screen readers. */
  description: string;
}

export const TILE_LOOKS: Readonly<Record<TileState, TileLook>> = {
  legendary: {
    icon: 'flame',
    label: 'Legendary',
    tone: 'gold',
    nameTone: 'textMuted',
    description: 'A legendary skill far ahead: something to dream of.',
  },
  locked: {
    icon: 'lock',
    label: 'Locked',
    tone: 'textMuted',
    nameTone: 'textMuted',
    description: 'Its prerequisites are not met yet. You can still unlock it yourself.',
  },
  available: {
    icon: 'rune',
    label: 'Ready',
    tone: 'rune',
    nameTone: 'text',
    description: 'Open to train: the next step on the path.',
  },
  training: {
    icon: 'sword',
    label: 'Training',
    tone: 'gold',
    nameTone: 'text',
    description: 'You are training it: sets earn XP up to level 5 until the Trial.',
  },
  proficient: {
    icon: 'shield',
    label: 'Proficient',
    tone: 'gold',
    nameTone: 'gold',
    description: 'Trial passed: it opens the skills that build on it.',
  },
  mastered: {
    icon: 'star',
    label: 'Mastered',
    tone: 'gold',
    nameTone: 'gold',
    description: 'Level 10: fully mastered.',
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
    TILE_LOOKS[state].label,
    TRAINED_TILE_STATES.includes(state) ? `level ${level.level}` : undefined,
    spokenOgLevel(node.ogLevel),
    node.straightArm ? 'straight-arm' : undefined,
    isGoal ? 'goal' : undefined,
    custom ? 'custom' : undefined,
    status.selfUnlocked && status.unmetHard.length > 0 ? 'unlocked by you' : undefined,
  ]
    .filter(Boolean)
    .join(', ');
}

/** The caps state line of an untrained tile ("Ready · Unlocked by you" after a self-unlock). */
export function tileStateLabel(tile: TreeTile): string {
  return tile.status.selfUnlocked && tile.state === 'available'
    ? 'Ready · Unlocked by you'
    : TILE_LOOKS[tile.state].label;
}
