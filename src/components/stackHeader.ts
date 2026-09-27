import { Colors, TypeScale } from './theme';

/**
 * Header options for a pushed stack screen (node detail, its Trial, the Style Guide): stone bar,
 * gold title and back arrow in the display font.
 */
export function stackHeaderOptions(title: string) {
  return {
    headerShown: true,
    title,
    headerStyle: { backgroundColor: Colors.surface },
    headerTintColor: Colors.gold,
    headerTitleStyle: { fontFamily: TypeScale.title.fontFamily },
    headerShadowVisible: false,
  } as const;
}
