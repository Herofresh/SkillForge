import { createId } from '@/lib/id';

describe('createId', () => {
  it('starts with the time in base 36 and differs between calls', () => {
    const at = 1_790_000_000_000;
    const a = createId(at);
    const b = createId(at);
    expect(a.startsWith(`${at.toString(36)}-`)).toBe(true);
    expect(a).toMatch(/^[0-9a-z]+-[0-9a-z]{8}$/);
    expect(a).not.toBe(b);
  });
});
