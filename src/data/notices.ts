/**
 * Fixed notices the app shows in more than one place (PLAN 7.0b, ADR-065). Content only: each
 * text lives here once and the screens and the guide import it.
 */

/** The health disclaimer: onboarding step 1, Settings → About and the guide. */
export const HEALTH_DISCLAIMER_TITLE = 'Train safe';

export const HEALTH_DISCLAIMER =
  'SkillForge gives general training suggestions, not medical advice. Check with a doctor ' +
  'before you start a new exercise programme, especially with an injury or a health condition. ' +
  'Stop if you feel pain. You train at your own risk.';

/**
 * Where the user's data lives. Android Auto Backup stays on (ADR-065), so the device backup may
 * hold a copy: the text must never promise the data exists only on this phone.
 */
export const DATA_STORAGE_NOTE =
  'Your data is stored on this phone. SkillForge has no account and sends nothing anywhere; ' +
  'Android’s own device backup may include it.';

/**
 * Moving between the GitHub APK and the Play Store version (PLAN 7.3, ADR-066): the two builds
 * have different signers, so neither updates the other. Guide and Backup panel.
 */
export const STORE_SWITCH_NOTE =
  'Switching between the GitHub and the Play Store version needs a reinstall: export a backup ' +
  'first, then import it in the new install.';
