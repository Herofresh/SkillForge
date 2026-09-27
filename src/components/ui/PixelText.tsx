import { Text, type TextProps } from 'react-native';

import { Colors, PIXEL, TypeScale, type ColorToken, type TextVariant } from '../theme';

type Props = TextProps & {
  /** Type scale entry (default `body`). `display`/`title` get the hard pixel text shadow. */
  variant?: TextVariant;
  /** Color token (default: `text`, or `gold` for display/title). */
  tone?: ColorToken;
  /** A raw color from the theme (e.g. a tier color) instead of a token. */
  color?: string;
  align?: 'left' | 'center' | 'right';
};

const SHADOWED: readonly TextVariant[] = ['display', 'title'];

/** All text in the app. Pick a variant; never set font families or sizes by hand. */
export function PixelText({ variant = 'body', tone, color, align, style, ...textProps }: Props) {
  const shadowed = SHADOWED.includes(variant);
  const resolved = color ?? Colors[tone ?? (shadowed ? 'gold' : 'text')];
  return (
    <Text
      {...textProps}
      style={[
        TypeScale[variant],
        { color: resolved, textAlign: align },
        shadowed && {
          textShadowColor: Colors.ink,
          textShadowOffset: { width: PIXEL, height: PIXEL },
          textShadowRadius: 0,
        },
        style,
      ]}
    />
  );
}
