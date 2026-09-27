/**
 * Font files loaded at start-up (`useFonts` in app/_layout.tsx). The keys are the family names in
 * `FontFamily` (theme.ts), so a component only ever names a token. All fonts are OFL (ADR-030).
 * Weights are imported one by one so the bundle carries only the files we use.
 */
import { AlegreyaSans_400Regular } from '@expo-google-fonts/alegreya-sans/400Regular';
import { AlegreyaSans_700Bold } from '@expo-google-fonts/alegreya-sans/700Bold';
import { PixelifySans_600SemiBold } from '@expo-google-fonts/pixelify-sans/600SemiBold';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans/700Bold';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen/400Regular';

import { FontFamily } from './theme';

export const FONT_ASSETS = {
  [FontFamily.display]: PixelifySans_700Bold,
  [FontFamily.pixel]: PixelifySans_600SemiBold,
  [FontFamily.caps]: Silkscreen_400Regular,
  [FontFamily.body]: AlegreyaSans_400Regular,
  [FontFamily.bodyBold]: AlegreyaSans_700Bold,
} as const;
