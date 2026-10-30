import { StyleSheet, View } from 'react-native';

import type { Attribute } from '@/domain/types';
import { t } from '@/i18n';

import { ATTRIBUTE_LABELS } from '../attributeLabels';
import { AttributeColors, Colors, Spacing } from '../theme';
import { PixelFrame, PixelText } from '../ui';

export { ATTRIBUTE_LABELS };

type Props = {
  attributes: readonly Attribute[];
};

/** What a node trains: one tag per attribute in its attribute color. */
export function AttributeChips({ attributes }: Props) {
  if (attributes.length === 0) {
    return (
      <PixelText variant="small" tone="textMuted">
        {t('Skill work: it builds no attribute on its own.')}
      </PixelText>
    );
  }
  const spoken = attributes.map((attribute) => t(ATTRIBUTE_LABELS[attribute])).join(', ');
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={t('Trains {attributes}', { attributes: spoken })}>
      {attributes.map((attribute) => (
        <PixelFrame
          key={attribute}
          frame={{ lines: [Colors.ink, AttributeColors[attribute]], fill: Colors.surface }}
          shadow={false}
          padding={Spacing.xs}>
          <PixelText
            variant="label"
            color={AttributeColors[attribute]}
            style={styles.text}
            testID={`attribute-${attribute}`}>
            {t(ATTRIBUTE_LABELS[attribute])}
          </PixelText>
        </PixelFrame>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  text: {
    paddingHorizontal: Spacing.xs,
  },
});
