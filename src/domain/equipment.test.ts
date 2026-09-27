import { DEFAULT_EQUIPMENT_PROFILES, HOME_EQUIPMENT, PARK_EQUIPMENT } from '@/domain/equipment';
import { EQUIPMENT_TAGS } from '@/domain/types';

describe('default equipment profiles', () => {
  it('are Home and Park with stable ids', () => {
    expect(DEFAULT_EQUIPMENT_PROFILES.map((profile) => [profile.id, profile.name])).toEqual([
      ['home', 'Home'],
      ['park', 'Park'],
    ]);
  });

  it('Park is Home plus dip bars', () => {
    expect([...PARK_EQUIPMENT].sort()).toEqual([...HOME_EQUIPMENT, 'dip_bars'].sort());
  });

  it('only use known tags', () => {
    for (const tag of PARK_EQUIPMENT) expect(EQUIPMENT_TAGS).toContain(tag);
  });
});
