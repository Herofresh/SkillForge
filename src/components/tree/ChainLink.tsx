import { StyleSheet, View } from 'react-native';

import { Border, ChainColors, PIXEL } from '../theme';

/** Size of one hollow chain link in dp (a 5 × 5 art-pixel ring). */
const LINK = 5 * PIXEL;
/** The bar joining two links (seen edge-on). */
const BAR_HEIGHT = 4 * PIXEL;
/** Total height: link, bar, link. The tree column uses it as the gap between two tiles. */
export const CHAIN_HEIGHT = 2 * LINK + BAR_HEIGHT;
export const CHAIN_WIDTH = LINK;

type Props = {
  met: boolean;
};

/**
 * The pixel chain between a tile and the tile above it (its prerequisite): two hollow links joined
 * by a bar, gold once the prerequisite is met, dull steel before. Decorative; the tile's label says
 * the same for screen readers.
 */
export function ChainLink({ met }: Props) {
  const color = met ? ChainColors.met : ChainColors.unmet;
  return (
    <View
      style={styles.column}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={met ? 'chain-met' : 'chain-unmet'}>
      <View style={[styles.link, { borderColor: color }]} />
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={[styles.link, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    height: CHAIN_HEIGHT,
    width: LINK,
    alignItems: 'center',
  },
  link: {
    width: LINK,
    height: LINK,
    borderWidth: Border.line,
  },
  bar: {
    width: Border.line,
    height: BAR_HEIGHT,
  },
});
