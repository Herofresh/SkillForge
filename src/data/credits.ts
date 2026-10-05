/**
 * Credits shown in Settings → About (PLAN 4.6): where the progression content comes from
 * (docs/research/progressions.md) and the licences of the bundled fonts (ADR-030). Content only.
 */

export interface Credit {
  name: string;
  /** One line on what it is or what we took from it. */
  note: string;
  url: string;
}

export const CONTENT_SOURCES: readonly Credit[] = [
  {
    name: 'Overcoming Gravity (Steven Low)',
    note: 'Difficulty levels (OG2 charts), progressions and tendon safety guidance.',
    url: 'https://stevenlow.org/overcoming-gravity/',
  },
  {
    name: 'r/bodyweightfitness',
    note: 'The Recommended Routine and its progression charts.',
    url: 'https://redditbwf.github.io/wiki/recommended_routine.html',
  },
  {
    name: 'GMB Fitness',
    note: 'Handstand and skill progressions.',
    url: 'https://gmb.io/handstand/',
  },
  {
    name: 'Antranik',
    note: 'Beginner routines and steady-state skill training.',
    url: 'https://antranik.org/',
  },
];

/** Shown under the content sources (ADR-065). */
export const NOT_AFFILIATED_NOTE =
  'SkillForge is an independent project, not affiliated with or endorsed by the sources listed.';

/** The SIL Open Font License 1.1 that all bundled fonts use. */
export const OFL_CREDIT: Credit = {
  name: 'SIL Open Font License 1.1',
  note: 'The licence of all three fonts.',
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
