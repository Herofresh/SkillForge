import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Spacing, TOUCH_TARGET, TypeScale } from '../theme';

import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';

type Props = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'maxLength'
  | 'autoFocus'
  | 'autoCapitalize'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'multiline'
  | 'autoCorrect'
> & {
  /** Caps label above the field; also the screen-reader label. */
  label: string;
  /** Screen-reader label when it should say more than `label`. */
  accessibilityLabel?: string;
  testID?: string;
};

const MULTILINE_HEIGHT = 6 * TOUCH_TARGET - 2 * Spacing.xs;

/**
 * A text field in a stone pixel frame that lights up gold while focused. Body font, at least 48 dp
 * tall, labelled for screen readers.
 */
export function PixelTextInput({ label, accessibilityLabel, testID, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      <PixelText variant="label" tone="rune">
        {label}
      </PixelText>
      <PixelFrame variant={focused ? 'gold' : 'stone'} padding={Spacing.xs}>
        <TextInput
          {...inputProps}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.gold}
          cursorColor={Colors.gold}
          style={[styles.input, inputProps.multiline && styles.multiline]}
        />
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  input: {
    ...TypeScale.body,
    color: Colors.text,
    minHeight: TOUCH_TARGET - 2 * Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  /** A few lines of pasted text (e.g. shared progressions), scrolling inside the field. */
  multiline: {
    minHeight: MULTILINE_HEIGHT,
    maxHeight: MULTILINE_HEIGHT,
    textAlignVertical: 'top',
  },
});
