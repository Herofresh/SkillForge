/** Languages (PLAN 7.8 FB-8, ADR-080): `t` for texts, `k` to mark translatable data, the locale helpers. */
export {
  DEFAULT_LANGUAGE_CHOICE,
  DEFAULT_LOCALE,
  isLocale,
  LANGUAGE_CHOICES,
  localeFromTag,
  LOCALES,
  parseLanguageChoice,
  resolveLocale,
  type LanguageChoice,
  type Locale,
} from './locale';
export {
  fill,
  getLocale,
  k,
  setLocale,
  t,
  tIn,
  type Dictionary,
  type TranslationParams,
} from './t';
