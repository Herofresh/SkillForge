import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Whether the soft keyboard is open. A footer inside a `KeyboardSafeView` drops its bottom
 * safe-area inset while it is: the keyboard already covers the navigation bar, so the inset would
 * only leave a gap above the keys (ADR-069).
 */
export function useKeyboardShown(): boolean {
  const [shown, setShown] = useState(() => Keyboard.isVisible());
  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', () => setShown(true)),
      Keyboard.addListener('keyboardDidHide', () => setShown(false)),
    ];
    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, []);
  return shown;
}
