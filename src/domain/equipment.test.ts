import {
  DEFAULT_EQUIPMENT_PROFILES,
  EQUIPMENT_TAG_LABELS,
  HOME_EQUIPMENT,
  PARK_EQUIPMENT,
  toggleEquipmentTag,
} from '@/domain/equipment';
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

describe('toggleEquipmentTag', () => {
  it('adds a missing tag and removes a present one', () => {
    expect(toggleEquipmentTag(['floor'], 'rings')).toEqual(['floor', 'rings']);
    expect(toggleEquipmentTag(['floor', 'rings'], 'floor')).toEqual(['rings']);
  });

  it('has a label for every tag', () => {
    for (const tag of EQUIPMENT_TAGS) expect(EQUIPMENT_TAG_LABELS[tag].length).toBeGreaterThan(0);
  });
});
