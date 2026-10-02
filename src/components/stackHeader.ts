import { Colors, HeaderTitleStyle } from './theme';

/**
 * Header options for a pushed stack screen (node detail, its Trial, the Style Guide): stone bar,
 * gold title and back arrow in the pixel font.
 */
export function stackHeaderOptions(title: string) {
  return {
    headerShown: true,
    title,
    headerStyle: { backgroundColor: Colors.surface },
    headerTintColor: Colors.gold,
    headerTitleStyle: HeaderTitleStyle,
    headerShadowVisible: false,
  } as const;
}
