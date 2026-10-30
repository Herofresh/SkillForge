/**
 * Languages (PLAN 7.8 FB-8, ADR-080): which locales the app has texts for, how the user's choice
 * ("system" or a fixed language) and the device language resolve to one of them. Pure: the store
 * and the UI read the device tag; this module only decides.
 */
export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** The language setting: follow the device, or one of the app's languages. */
export const LANGUAGE_CHOICES = ['system', ...LOCALES] as const;
export type LanguageChoice = (typeof LANGUAGE_CHOICES)[number];
export const DEFAULT_LANGUAGE_CHOICE: LanguageChoice = 'system';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** A stored setting as a choice; anything unknown is `system`. */
export function parseLanguageChoice(value: unknown): LanguageChoice {
  return typeof value === 'string' && (LANGUAGE_CHOICES as readonly string[]).includes(value)
    ? (value as LanguageChoice)
    : DEFAULT_LANGUAGE_CHOICE;
}

/**
 * The app locale for a device language tag ("de_AT", "de-DE", "en_US", "fr"): the language part
 * when the app has it, else English.
 */
export function localeFromTag(tag: string | undefined | null): Locale {
  const language = (tag ?? '').toLowerCase().split(/[-_]/)[0];
  return isLocale(language) ? language : DEFAULT_LOCALE;
}

/** The locale to show: the fixed choice, or the device language resolved by `localeFromTag`. */
export function resolveLocale(
  choice: LanguageChoice,
  deviceTag: string | undefined | null,
): Locale {
  return choice === 'system' ? localeFromTag(deviceTag) : choice;
}
