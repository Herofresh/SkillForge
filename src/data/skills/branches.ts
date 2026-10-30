import type { Branch } from '@/domain/types';
import { k } from '@/i18n';

/**
 * Display name of each branch (single source for the review sheet and the UI). English; a screen
 * shows one through `t(BRANCH_NAMES[branch])`.
 */
export const BRANCH_NAMES: Record<Branch, string> = {
  h_push: k('Horizontal push'),
  v_push: k('Vertical push'),
  v_pull: k('Vertical pull'),
  h_pull: k('Horizontal pull'),
  front_lever: k('Front lever'),
  back_lever: k('Back lever and rings strength'),
  planche: k('Planche'),
  handstand: k('Handstand and balance'),
  core: k('Core and compression'),
  legs: k('Legs'),
  dynamic: k('Dynamic skills and hybrids'),
  flexibility: k('Flexibility'),
  acrobatics: k('Acrobatics'),
  mobility: k('Mobility'),
};
