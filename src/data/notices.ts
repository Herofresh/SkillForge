/**
 * Fixed notices the app shows in more than one place (PLAN 7.0b, ADR-065). Content only: each
 * text lives here once and the screens and the guide import it. Marked with `k`: the screens
 * translate them where they are shown (`t(HEALTH_DISCLAIMER)`).
 */
import { k } from '@/i18n';

/** The health disclaimer: onboarding step 1, Settings → About and the guide. */
export const HEALTH_DISCLAIMER_TITLE = k('Train safe');

export const HEALTH_DISCLAIMER = k(
  'SkillForge gives general training suggestions, not medical advice. Check with a doctor before you start a new exercise programme, especially with an injury or a health condition. Stop if you feel pain. You train at your own risk.',
);

/**
 * Where the user's data lives. Android Auto Backup stays on (ADR-065), so the device backup may
 * hold a copy: the text must never promise the data exists only on this phone.
 */
export const DATA_STORAGE_NOTE = k(
  'Your data is stored on this phone. SkillForge has no account and sends nothing anywhere; Android’s own device backup may include it.',
);

/**
 * Moving between the GitHub APK and the Play Store version (PLAN 7.3, ADR-066): the two builds
 * have different signers, so neither updates the other. Guide and Backup panel.
 */
export const STORE_SWITCH_NOTE = k(
  'Switching between the GitHub and the Play Store version needs a reinstall: export a backup first, then import it in the new install.',
);
