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
> & {
  /** Caps label above the field; also the screen-reader label. */
  label: string;
  /** Screen-reader label when it should say more than `label`. */
  accessibilityLabel?: string;
  testID?: string;
};

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
          style={styles.input}
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
});
