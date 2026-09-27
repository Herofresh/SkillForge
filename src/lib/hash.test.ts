import { hashString } from '@/lib/hash';

describe('hashString', () => {
  it('matches the FNV-1a reference values', () => {
    expect(hashString('')).toBe(0x811c9dc5);
    expect(hashString('a')).toBe(0xe40c292c);
    expect(hashString('foobar')).toBe(0xbf9cf968);
  });

  it('is deterministic and spreads similar keys', () => {
    expect(hashString('1:pull_up')).toBe(hashString('1:pull_up'));
    expect(hashString('1:pull_up')).not.toBe(hashString('2:pull_up'));
  });
});
