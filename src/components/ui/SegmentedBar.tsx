import { StyleSheet, View } from 'react-native';

import { litSegments } from '@/lib/segments';

import { Border, Colors, PIXEL } from '../theme';

type Props = {
  /** Fill from 0 to 1. */
  fraction: number;
  segments: number;
  color: string;
  /** Segment height in dp (default 12). */
  height?: number;
};

const DEFAULT_HEIGHT = 12;

/**
 * A row of pixel segments inside an ink frame: the building block of XPBar and StatBar. Lit
 * segments get a 1-pixel top highlight for the 16-bit bevel. Purely visual; the wrapper provides
 * the accessibility value.
 */
export function SegmentedBar({ fraction, segments, color, height = DEFAULT_HEIGHT }: Props) {
  const lit = litSegments(fraction, segments);
  return (
    <View style={styles.frame}>
      {Array.from({ length: segments }, (_, index) => {
        const on = index < lit;
        return (
          <View
            key={index}
            testID={on ? 'segment-lit' : 'segment-dark'}
            style={[styles.segment, { height, backgroundColor: on ? color : Colors.border }]}>
            {on && <View style={styles.highlight} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'row',
    gap: PIXEL,
    padding: PIXEL,
    borderWidth: Border.line,
    borderColor: Colors.ink,
    backgroundColor: Colors.ink,
  },
  segment: {
    flex: 1,
  },
  highlight: {
    height: PIXEL,
    backgroundColor: Colors.text,
    opacity: 0.45,
  },
});
