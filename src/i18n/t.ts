/**
 * `t(text, params)`: the English source text is the key (PLAN 7.8 FB-8, ADR-080). The current
 * locale's dictionary gives the translation; a missing entry falls back to the English text, so
 * the app never shows a bare key. `{name}` placeholders are filled from `params` after the
 * lookup, so a translation can reorder them. Pure TypeScript: the domain layer uses it too. The
 * store sets the locale before anything renders or recomputes; tests call `setLocale` directly.
 */
import { DE } from './de';
import { DEFAULT_LOCALE, type Locale } from './locale';

export type Dictionary = Readonly<Record<string, string>>;

const DICTIONARIES: Readonly<Partial<Record<Locale, Dictionary>>> = { de: DE };

let current: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  current = locale;
}

export function getLocale(): Locale {
  return current;
}

export type TranslationParams = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

/** `text` with its `{name}` placeholders filled from `params` (unknown names are left as they are). */
export function fill(text: string, params: TranslationParams): string {
  return text.replace(PLACEHOLDER, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** The translation of `text` in the current locale (English when there is none), filled in. */
export function t(text: string, params?: TranslationParams): string {
  const translated = DICTIONARIES[current]?.[text] ?? text;
  return params ? fill(translated, params) : translated;
}

/**
 * Marks a text in a data file (a class name, an item's flavour line) as translatable: it stays
 * English in the data and is translated where it is shown (`t(item.name)`). Identity at runtime;
 * the dictionary test collects these keys like `t('…')` calls.
 */
export const k = (text: string): string => text;

/** The translation of `text` in `locale`, for text produced outside the current locale. */
export function tIn(locale: Locale, text: string, params?: TranslationParams): string {
  const translated = DICTIONARIES[locale]?.[text] ?? text;
  return params ? fill(translated, params) : translated;
}
