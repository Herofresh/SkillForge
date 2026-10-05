import { guideEntry } from '@/domain/guide';

import { NOT_AFFILIATED_NOTE } from './credits';
import { DATA_STORAGE_NOTE, HEALTH_DISCLAIMER } from './notices';

describe('notices (PLAN 7.0b, ADR-064)', () => {
  it('the health disclaimer keeps its substance', () => {
    expect(HEALTH_DISCLAIMER).toMatch(/not medical advice/);
    expect(HEALTH_DISCLAIMER).toMatch(/doctor/);
    expect(HEALTH_DISCLAIMER).toMatch(/injury or a health condition/);
    expect(HEALTH_DISCLAIMER).toMatch(/Stop if you feel pain/);
    expect(HEALTH_DISCLAIMER).toMatch(/at your own risk/);
  });

  it('never promises the data lives only on the phone (Auto Backup is on)', () => {
    expect(DATA_STORAGE_NOTE).not.toMatch(/only/);
    expect(DATA_STORAGE_NOTE).toMatch(/device backup may include it/);
    expect(NOT_AFFILIATED_NOTE).toMatch(/not affiliated with or endorsed by/);
  });

  it('the guide uses the same texts', () => {
    expect(guideEntry('safeguards').more).toContain(HEALTH_DISCLAIMER);
    expect(guideEntry('data').summary).toContain(DATA_STORAGE_NOTE);
    expect(guideEntry('data').more.join(' ')).not.toMatch(/deletes its data/);
  });
});
