/**
 * Credits shown in Settings → About (PLAN 4.6): where the progression content comes from
 * (docs/research/progressions.md) and the licences of the bundled fonts (ADR-030). Content only;
 * the notes are marked with `k` and translated where they are shown.
 */
import { k } from '@/i18n';

export interface Credit {
  name: string;
  /** One line on what it is or what we took from it. */
  note: string;
  url: string;
}

export const CONTENT_SOURCES: readonly Credit[] = [
  {
    name: 'Overcoming Gravity (Steven Low)',
    note: k('Tier levels (OG2 charts), progressions and tendon safety guidance.'),
    url: 'https://stevenlow.org/overcoming-gravity/',
  },
  {
    name: 'r/bodyweightfitness',
    note: k('The Recommended Routine and its progression charts.'),
    url: 'https://redditbwf.github.io/wiki/recommended_routine.html',
  },
  {
    name: 'GMB Fitness',
    note: k('Handstand and skill progressions.'),
    url: 'https://gmb.io/handstand/',
  },
  {
    name: 'Antranik',
    note: k('Beginner routines and steady-state skill training.'),
    url: 'https://antranik.org/',
  },
];

/** Shown under the content sources (ADR-065). */
export const NOT_AFFILIATED_NOTE = k(
  'SkillForge is an independent project, not affiliated with or endorsed by the sources listed.',
);

/**
 * The privacy policy (PLAN 7.4, ADR-067): site/privacy/ published to GitHub Pages. Play Console's
 * store listing links the same URL.
 */
export const PRIVACY_POLICY: Credit = {
  name: k('Privacy policy'),
  note: k('What SkillForge stores (everything on this phone) and what it never sends.'),
  url: 'https://herofresh.github.io/SkillForge/privacy/',
};

/** The SIL Open Font License 1.1 that all bundled fonts use. */
export const OFL_CREDIT: Credit = {
  name: 'SIL Open Font License 1.1',
  note: k('The licence of all three fonts.'),
  url: 'https://openfontlicense.org/',
};

export const FONT_CREDITS: readonly Credit[] = [
  {
    name: 'Jersey 15',
    note: '© 2023 The Soft Type Project Authors · SIL Open Font License 1.1',
    url: 'https://github.com/scfried/soft-type-jersey',
  },
  {
    name: 'Silkscreen',
    note: '© 2001 The Silkscreen Project Authors · SIL Open Font License 1.1',
    url: 'https://github.com/googlefonts/silkscreen',
  },
  {
    name: 'Alegreya Sans',
    note: '© 2013 The Alegreya Sans Project Authors · SIL Open Font License 1.1',
    url: 'https://github.com/huertatipografica/Alegreya-Sans',
  },
];
