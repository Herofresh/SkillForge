import type { Attribute } from '@/domain/types';

/**
 * Display names of the attributes (the domain names them, the UI words them). In a file of its own,
 * without React Native, so the widget layout and the build scripts can read them too.
 */
export const ATTRIBUTE_LABELS: Readonly<Record<Attribute, string>> = {
  push: 'Push',
  pull: 'Pull',
  core: 'Core',
  legs: 'Legs',
  balance: 'Balance',
  mobility: 'Mobility',
};
