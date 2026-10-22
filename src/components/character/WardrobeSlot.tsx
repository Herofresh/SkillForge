import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ACCESSORY_BY_ID,
  companionColors,
  companionStill,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  type CompanionLook,
  type CompanionOutfit,
} from '@/data/companion';
import type { AccessoryRow, SlotRow } from '@/domain/companion';
import type { CompanionSlot } from '@/domain/types';

import { Border, Colors, PIXEL, Spacing, TOUCH_TARGET } from '../theme';
import { PixelIcon, PixelText } from '../ui';
import { PixelSprite } from '../ui/PixelSprite';

import { companionProgressText, companionRuleText, SLOT_LABELS } from './companionText';

/** dp per sprite pixel: earned tiles, and the smaller locked rows. */
const TILE_SCALE = 2;
const LOCKED_SCALE = 1;
const TILE_WIDTH = SPRITE_WIDTH * TILE_SCALE + 2 * (Spacing.xs + Border.line);
/** A locked item's preview is dimmed: it shows what the item looks like, not that it is worn. */
const LOCKED_OPACITY = 0.45;
const GRID = { width: SPRITE_WIDTH, height: SPRITE_HEIGHT };

type Props = {
  row: SlotRow;
  /** The companion as it is now: every preview shows it wearing that one item. */
  outfit: CompanionOutfit;
  look: CompanionLook;
  newIds: ReadonlySet<string>;
  onEquip: (slot: CompanionSlot, accessoryId: string | null) => void;
  testID: string;
};

/** The companion's still pose wearing `accessoryId` in `slot` (or nothing there with `null`). */
function Preview({
  slot,
  accessoryId,
  outfit,
  look,
  scale,
}: {
  slot: CompanionSlot;
  accessoryId: string | null;
  outfit: CompanionOutfit;
  look: CompanionLook;
  scale: number;
}) {
  const colors = useMemo(() => companionColors(look), [look]);
  const loadout = { ...outfit.loadout };
  if (accessoryId === null) delete loadout[slot];
  else loadout[slot] = accessoryId;
  const dressed: CompanionOutfit = { ...outfit, loadout };
  return (
    <PixelSprite
      cacheKey={`wardrobe:${JSON.stringify(dressed)}:${JSON.stringify(look)}`}
      frames={() => [companionStill('content', dressed, look)]}
      colors={colors}
      scale={scale}
      grid={GRID}
    />
  );
}

/** One earned item (or "None") as a tile: the preview, the name, gold when worn, NEW when fresh. */
function Tile({
  label,
  selected,
  isNew,
  onPress,
  accessibilityLabel,
  testID,
  children,
}: {
  label: string;
  selected: boolean;
  isNew: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  testID: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.tileSelected,
        pressed && styles.pressed,
      ]}>
      <View style={styles.tileStage}>{children}</View>
      <PixelText
        variant="small"
        tone={selected ? 'gold' : 'text'}
        numberOfLines={2}
        style={styles.tileName}>
        {label}
      </PixelText>
      {isNew && (
        <PixelText variant="label" tone="rune">
          New
        </PixelText>
      )}
    </Pressable>
  );
}

/**
 * One slot of the Customize sheet (PLAN 7.8 FB-6): its heading and the worn item's flavour, the
 * earned items (and "None") as a grid of previews of the companion wearing them, and the locked
 * items folded into "Locked (n)"; opened, each shows its dimmed preview, what earns it and the
 * progress so far.
 */
export function WardrobeSlot({ row, outfit, look, newIds, onEquip, testID }: Props) {
  const [showLocked, setShowLocked] = useState(false);
  const earned = row.items.filter((item) => item.status !== 'locked');
  const locked = row.items.filter((item) => item.status === 'locked');
  const worn = row.worn ? ACCESSORY_BY_ID.get(row.worn) : undefined;
  const slotLabel = SLOT_LABELS[row.slot];
  return (
    <View style={styles.slot} testID={testID}>
      <PixelText variant="heading" accessibilityRole="header">
        {slotLabel}
      </PixelText>
      {worn && (
        <PixelText variant="small" tone="textMuted">
          {worn.flavor}
        </PixelText>
      )}
      <View style={styles.grid} accessibilityRole="radiogroup">
        <Tile
          label="None"
          selected={row.worn === undefined}
          isNew={false}
          onPress={() => onEquip(row.slot, null)}
          accessibilityLabel={`${slotLabel}: nothing`}
          testID={`${testID}-none`}>
          <Preview
            slot={row.slot}
            accessoryId={null}
            outfit={outfit}
            look={look}
            scale={TILE_SCALE}
          />
        </Tile>
        {earned.map((item) => (
          <Tile
            key={item.id}
            label={item.name}
            selected={item.status === 'worn'}
            isNew={newIds.has(item.id)}
            onPress={() => onEquip(row.slot, item.id)}
            accessibilityLabel={`${slotLabel}: ${item.name}${newIds.has(item.id) ? ', new' : ''}`}
            testID={`${testID}-${item.id}`}>
            <Preview
              slot={row.slot}
              accessoryId={item.id}
              outfit={outfit}
              look={look}
              scale={TILE_SCALE}
            />
          </Tile>
        ))}
      </View>
      {locked.length > 0 && (
        <Pressable
          onPress={() => setShowLocked((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showLocked }}
          accessibilityLabel={`${slotLabel}: ${locked.length} locked`}
          accessibilityHint={showLocked ? 'Hides them' : 'Shows what earns them'}
          testID={`${testID}-locked-toggle`}
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
          <PixelIcon name="lock" />
          <PixelText variant="label" tone="gold" style={styles.flex}>
            {`Locked (${locked.length})`}
          </PixelText>
          <PixelText variant="label" tone="gold">
            {showLocked ? 'Hide' : 'Show'}
          </PixelText>
        </Pressable>
      )}
      {showLocked &&
        locked.map((item) => (
          <LockedRow
            key={item.id}
            item={item}
            slot={row.slot}
            outfit={outfit}
            look={look}
            testID={`${testID}-${item.id}-locked`}
          />
        ))}
    </View>
  );
}

function LockedRow({
  item,
  slot,
  outfit,
  look,
  testID,
}: {
  item: AccessoryRow;
  slot: CompanionSlot;
  outfit: CompanionOutfit;
  look: CompanionLook;
  testID: string;
}) {
  const rule = companionRuleText(item.rule);
  const progress = companionProgressText(item.rule, item.progress);
  return (
    <View
      style={styles.locked}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${item.name}, locked. ${rule}. ${progress}`}
      testID={testID}>
      <View style={styles.lockedPreview}>
        <Preview
          slot={slot}
          accessoryId={item.id}
          outfit={outfit}
          look={look}
          scale={LOCKED_SCALE}
        />
      </View>
      <View style={styles.flex}>
        <PixelText variant="small" tone="textMuted">
          {item.name}
        </PixelText>
        <PixelText variant="label" tone="gold">
          {`${rule} · ${progress}`}
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: PIXEL,
    borderTopColor: Colors.bronze,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tile: {
    width: TILE_WIDTH,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderWidth: Border.line,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  tileSelected: {
    borderColor: Colors.gold,
  },
  tileStage: {
    alignItems: 'center',
  },
  tileName: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  toggle: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
    borderLeftWidth: PIXEL,
    borderLeftColor: Colors.goldDark,
  },
  lockedPreview: {
    opacity: LOCKED_OPACITY,
  },
  flex: {
    flex: 1,
  },
});
