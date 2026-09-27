import type { Branch } from '@/domain/types';

/** Display name of each branch (single source for the review sheet and, later, the UI). */
export const BRANCH_NAMES: Record<Branch, string> = {
  h_push: 'Horizontal push',
  v_push: 'Vertical push',
  v_pull: 'Vertical pull',
  h_pull: 'Horizontal pull',
  front_lever: 'Front lever',
  back_lever: 'Back lever and rings strength',
  planche: 'Planche',
  handstand: 'Handstand and balance',
  core: 'Core and compression',
  legs: 'Legs',
  dynamic: 'Dynamic skills and hybrids',
  flexibility: 'Flexibility and mobility',
};
