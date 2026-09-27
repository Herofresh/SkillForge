/**
 * Plain-language text for prescriptions and Trials (shared by onboarding, node detail and the Train
 * flow). Pure, so the wording is tested once and screens never build it themselves.
 */
import type { Metric, SetPerformance, Trial } from './types';

/** Load values are shown with two decimals (0.05 × BW steps). */
const LOAD_DECIMALS = 2;

/** One set, e.g. "8 reps", "30 s", "3 × 5 s lowerings", "5 reps at 0.50× BW". */
export function formatPerformance(metric: Metric, performance: SetPerformance): string {
  const reps = performance.reps ?? 1;
  switch (metric) {
    case 'reps':
      return `${performance.value} ${performance.value === 1 ? 'rep' : 'reps'}`;
    case 'hold_s':
      return `${performance.value} s`;
    case 'eccentric_s':
      return `${reps} × ${performance.value} s ${reps === 1 ? 'lowering' : 'lowerings'}`;
    case 'load_xbw':
      return `${reps} ${reps === 1 ? 'rep' : 'reps'} at ${performance.value.toFixed(LOAD_DECIMALS)}× BW`;
  }
}

/** A Trial standard, e.g. "3 sets of 8 reps" or "3 sets of 30 s". */
export function formatTrial(metric: Metric, trial: Trial): string {
  const perSet = formatPerformance(metric, {
    value: trial.target,
    ...(trial.reps !== undefined ? { reps: trial.reps } : {}),
  });
  return `${trial.sets} ${trial.sets === 1 ? 'set' : 'sets'} of ${perSet}`;
}

/** The unit shown next to a stepper for the metric's main value. */
export const METRIC_UNITS: Readonly<Record<Metric, string>> = {
  reps: 'reps',
  hold_s: 's',
  eccentric_s: 's',
  load_xbw: '× BW',
};

/** OG level 0 marks a foundation node below the OG2 chart (see the progressions overview). */
export const FOUNDATION_OG_LEVEL = 0;

/** The OG level as a short tag: "Foundation" for level 0, else "OG 5". */
export function formatOgLevel(ogLevel: number): string {
  return ogLevel === FOUNDATION_OG_LEVEL ? 'Foundation' : `OG ${ogLevel}`;
}

/** The OG level for screen readers: "foundation" for level 0, else "OG level 5". */
export function spokenOgLevel(ogLevel: number): string {
  return ogLevel === FOUNDATION_OG_LEVEL ? 'foundation' : `OG level ${ogLevel}`;
}
