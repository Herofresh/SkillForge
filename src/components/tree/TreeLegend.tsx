import { StyleSheet, View } from 'react-native';

import { TILE_STATES } from '@/domain/treeView';

import { Spacing } from '../theme';
import { PixelIcon, PixelModal, PixelText } from '../ui';

import { ChainLink } from './ChainLink';
import { TILE_LOOKS } from './tileLook';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** What the tile states and chains mean (a sheet from the Tree tab). */
export function TreeLegend({ visible, onClose }: Props) {
  return (
    <PixelModal visible={visible} title="Legend" onClose={onClose} testID="tree-legend-sheet">
      {TILE_STATES.map((state) => {
        const look = TILE_LOOKS[state];
        return (
          <View key={state} style={styles.row}>
            <PixelIcon name={look.icon} />
            <View style={styles.text}>
              <PixelText variant="label" tone={look.tone}>
                {look.label}
              </PixelText>
              <PixelText variant="small">{look.description}</PixelText>
            </View>
          </View>
        );
      })}
      <View style={styles.row}>
        <View style={styles.chain}>
          <ChainLink met />
        </View>
        <PixelText variant="small" style={styles.text}>
          A chain joins a skill to the one it builds on: gold once that one is proficient. Chips
          under a tile are prerequisites from elsewhere.
        </PixelText>
      </View>
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
  },
  chain: {
    width: 24,
    alignItems: 'center',
  },
});
