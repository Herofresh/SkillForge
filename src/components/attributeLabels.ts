import type { Attribute } from '@/domain/types';
import { k } from '@/i18n';

/**
 * Display names of the attributes (the domain names them, the UI words them). In a file of its own,
 * without React Native, so the widget layout and the build scripts can read them too. English;
 * the place that shows one calls `t(ATTRIBUTE_LABELS[attribute])`.
 */
export const ATTRIBUTE_LABELS: Readonly<Record<Attribute, string>> = {
  push: k('Push'),
  pull: k('Pull'),
  core: k('Core'),
  legs: k('Legs'),
  balance: k('Balance'),
  mobility: k('Mobility'),
};
