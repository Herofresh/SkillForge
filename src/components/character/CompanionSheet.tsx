import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  BODY_SHAPES,
  COMPANION_DYES,
  COMPANION_HAIRS,
  COMPANION_TINTS,
  DEFAULT_DYE_ID,
  DEFAULT_HAIR_ID,
  DEFAULT_TINT_ID,
  HAIR_STYLES,
  companionBody,
} from '@/data/companion';
import { COMPANION_BODIES, type CompanionLookChoice } from '@/domain/companion';
import type { CompanionSlot } from '@/domain/types';
import { t } from '@/i18n';

import { Colors, PIXEL, Spacing } from '../theme';
import { PixelChip, PixelModal, PixelText } from '../ui';

import { CompanionSprite } from './CompanionSprite';
import { WardrobeSlot } from './WardrobeSlot';
import type { CompanionView } from './useCompanion';

type Props = {
  view: CompanionView;
  onEquip: (slot: CompanionSlot, accessoryId: string | null) => void;
  onLook: (look: CompanionLookChoice) => void;
  /** Called on close; the screen marks the earned accessories as seen then. */
  onClose: () => void;
  testID?: string;
};

function ColorRow({
  label,
  options,
  selected,
  onSelect,
  testID,
}: {
  label: string;
  options: readonly { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
  testID: string;
}) {
  return (
    <View style={styles.gapSmall}>
      <PixelText variant="label" tone="textMuted">
        {label}
      </PixelText>
      <View style={styles.chips}>
        {options.map((option) => (
          <PixelChip
            key={option.id}
            label={t(option.name)}
            selected={option.id === selected}
            onPress={() => onSelect(option.id)}
            accessibilityLabel={`${label}: ${t(option.name)}`}
            testID={`${testID}-${option.id}`}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * The companion's customize sheet (PLAN 6.10 / 6.13, ADR-059 / ADR-061): a live preview, the body
 * (man or woman), hair style, skin, hair and outfit colors, then every slot (`WardrobeSlot`, PLAN 7.8
 * FB-6): its earned accessories as a grid of previews to wear (or None), the locked ones folded away
 * with what earns them. The weapon comes from the worn class and is shown, not
 * chosen. NEW tags mark accessories earned since the sheet was last opened (kept while it is
 * open; the screen marks them seen on close). Mount it to open it.
 */
export function CompanionSheet({
  view,
  onEquip,
  onLook,
  onClose,
  testID = 'companion-sheet',
}: Props) {
  const [newIds] = useState(
    () =>
      new Set(
        view.wardrobe.flatMap((row) =>
          row.items.filter((item) => item.isNew).map((item) => item.id),
        ),
      ),
  );
  return (
    <PixelModal visible title={t('Customize')} onClose={onClose} testID={testID}>
      <ScrollView nestedScrollEnabled style={styles.scroll} contentContainerStyle={styles.list}>
        <View style={styles.preview}>
          <View style={styles.stage}>
            <CompanionSprite animation="content" outfit={view.outfit} look={view.look} scale={3} />
          </View>
          <View style={styles.flex}>
            <PixelText variant="label" tone="textMuted">
              {t('Weapon')}
            </PixelText>
            <PixelText variant="body" testID={`${testID}-weapon`}>
              {t(view.weaponName)}
            </PixelText>
            <PixelText variant="small" tone="textMuted">
              {t('Comes with the class you wear. Wear another class to change it.')}
            </PixelText>
          </View>
        </View>
        <PixelText variant="small" tone="textMuted">
          {t('Training earns gear for your companion. What you earn stays yours.')}
        </PixelText>
        <ColorRow
          label={t('Body')}
          options={COMPANION_BODIES.map((id) => BODY_SHAPES[id])}
          selected={companionBody(view.look).shape.id}
          onSelect={(id) => {
            const body = COMPANION_BODIES.find((entry) => entry === id);
            if (body) onLook({ body });
          }}
          testID={`${testID}-body`}
        />
        <ColorRow
          label={t('Hair style')}
          options={HAIR_STYLES}
          selected={companionBody(view.look).hair.id}
          onSelect={(hairStyle) => onLook({ hairStyle })}
          testID={`${testID}-hairstyle`}
        />
        <ColorRow
          label={t('Skin')}
          options={COMPANION_TINTS}
          selected={view.look.skin ?? DEFAULT_TINT_ID}
          onSelect={(skin) => onLook({ skin })}
          testID={`${testID}-skin`}
        />
        <ColorRow
          label={t('Hair')}
          options={COMPANION_HAIRS}
          selected={view.look.hair ?? DEFAULT_HAIR_ID}
          onSelect={(hair) => onLook({ hair })}
          testID={`${testID}-hair`}
        />
        <ColorRow
          label={t('Outfit')}
          options={COMPANION_DYES}
          selected={view.look.outfit ?? DEFAULT_DYE_ID}
          onSelect={(outfit) => onLook({ outfit })}
          testID={`${testID}-outfit`}
        />
        {view.wardrobe.map((row) => (
          <WardrobeSlot
            key={row.slot}
            row={row}
            outfit={view.outfit}
            look={view.look}
            newIds={newIds}
            onEquip={onEquip}
            testID={`${testID}-${row.slot}`}
          />
        ))}
      </ScrollView>
    </PixelModal>
  );
}

/** The list scrolls inside the sheet so the close button stays on screen. */
const SHEET_MAX_HEIGHT = 480;

const styles = StyleSheet.create({
  scroll: {
    maxHeight: SHEET_MAX_HEIGHT,
  },
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  gapSmall: {
    gap: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stage: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: PIXEL,
    borderColor: Colors.border,
  },
  flex: {
    flex: 1,
  },
});
