import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Border, Colors, Frames, Spacing, type FrameStyle, type FrameVariant } from '../theme';

import { inset, notchedRects, type Insets } from './frameGeometry';

/** Corner steps per frame: a two-step staircase reads as "pixel" without eating the content. */
const CORNER_STEPS = 2;

type Props = Omit<ViewProps, 'style'> & {
  /** A named frame from the theme, or a custom one (buttons). Default `stone`. */
  variant?: FrameVariant;
  frame?: FrameStyle;
  /** Draw the hard drop shadow (default true). */
  shadow?: boolean;
  /** Pressed look: no shadow, the face moves into the shadow's place. */
  pressed?: boolean;
  /** Inner padding around the children (default `Spacing.md`). */
  padding?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

function Shape({ base, color }: { base: Insets; color: string }) {
  return (
    <>
      {notchedRects(base, Border.cornerStep, CORNER_STEPS).map((rect, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[styles.layer, rect, { backgroundColor: color }]}
        />
      ))}
    </>
  );
}

/**
 * The pixel panel every screen is built from: stepped corners, 2 dp frame lines (outer ink, inner
 * accent), a flat fill and a hard 4 dp drop shadow. Pure drawing with Views, so it sizes to its
 * content.
 */
export function PixelFrame({
  variant = 'stone',
  frame,
  shadow = true,
  pressed = false,
  padding = Spacing.md,
  style,
  contentStyle,
  children,
  ...viewProps
}: Props) {
  const look = frame ?? Frames[variant];
  const travel = Border.shadow;
  const drawShadow = shadow && !pressed;
  // Face position inside the wrapper: normally top-left, pressed = shifted into the shadow.
  const face: Insets = pressed
    ? { top: travel, left: travel, right: 0, bottom: 0 }
    : { top: 0, left: 0, right: travel, bottom: travel };
  const layers = [...look.lines, look.fill];
  const contentInset = look.lines.length * Border.line + padding;

  return (
    <View {...viewProps} style={style}>
      {drawShadow && (
        <Shape base={{ top: travel, left: travel, right: 0, bottom: 0 }} color={Colors.ink} />
      )}
      {layers.map((color, index) => (
        <Shape key={index} base={inset(face, index * Border.line)} color={color} />
      ))}
      <View
        style={[
          {
            marginTop: face.top,
            marginLeft: face.left,
            marginRight: face.right,
            marginBottom: face.bottom,
            padding: contentInset,
          },
          contentStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
  },
});
