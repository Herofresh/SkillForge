import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { DE } from './de';
import { localeFromTag, parseLanguageChoice, resolveLocale } from './locale';
import { fill, getLocale, setLocale, t } from './t';

const ROOT = join(__dirname, '..', '..');
const SOURCE_DIRS = ['app', 'src'];

/** Every `t('…')` and `k('…')` key (single, double or template quotes) in the app's source (not tests, not this folder). */
function sourceKeys(): Map<string, string[]> {
  const keys = new Map<string, string[]>();
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== 'node_modules' && entry !== 'i18n') visit(path);
        continue;
      }
      if (!/\.tsx?$/.test(entry) || /\.test\.tsx?$/.test(entry) || entry.endsWith('.d.ts'))
        continue;
      const text = readFileSync(path, 'utf8');
      const file = relative(ROOT, path).replace(/\\/g, '/');
      for (const match of text.matchAll(
        /\b[tk]\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\$]|\\.)*)`)/g,
      )) {
        const raw = match[1] ?? match[2] ?? match[3] ?? '';
        const key = raw.replace(/\\(['"`])/g, '$1').replace(/\\n/g, '\n');
        keys.set(key, [...(keys.get(key) ?? []), file]);
      }
    }
  };
  for (const dir of SOURCE_DIRS) visit(join(ROOT, dir));
  return keys;
}

afterEach(() => setLocale('en'));

describe('language choice (PLAN 7.8 FB-8)', () => {
  it('resolves the device tag to a known language, else English', () => {
    expect(localeFromTag('de_AT')).toBe('de');
    expect(localeFromTag('de-DE')).toBe('de');
    expect(localeFromTag('DE')).toBe('de');
    expect(localeFromTag('en_US')).toBe('en');
    expect(localeFromTag('fr_FR')).toBe('en');
    expect(localeFromTag(undefined)).toBe('en');
  });

  it('follows the device only for "system"', () => {
    expect(resolveLocale('system', 'de_DE')).toBe('de');
    expect(resolveLocale('en', 'de_DE')).toBe('en');
    expect(resolveLocale('de', 'en_US')).toBe('de');
    expect(parseLanguageChoice('de')).toBe('de');
    expect(parseLanguageChoice('nope')).toBe('system');
    expect(parseLanguageChoice(undefined)).toBe('system');
  });
});

describe('t', () => {
  it('returns the English text in English and the dictionary entry in German', () => {
    const [key] = Object.keys(DE);
    expect(key).toBeDefined();
    expect(t(key)).toBe(key);
    setLocale('de');
    expect(getLocale()).toBe('de');
    expect(t(key)).toBe(DE[key]);
  });

  it('falls back to the English text for an unknown key', () => {
    setLocale('de');
    expect(t('No such text in the app')).toBe('No such text in the app');
  });

  it('fills placeholders after the lookup', () => {
    expect(fill('{name}: {n} XP', { name: 'Pull-up', n: 12 })).toBe('Pull-up: 12 XP');
    expect(fill('{missing} stays', {})).toBe('{missing} stays');
  });
});

describe('the German dictionary', () => {
  const keys = sourceKeys();

  it('covers every t() key in the source', () => {
    const missing = [...keys.keys()].filter((key) => !(key in DE));
    expect(missing).toEqual([]);
  });

  it('has no entry the source no longer uses', () => {
    const unused = Object.keys(DE).filter((key) => !keys.has(key));
    expect(unused).toEqual([]);
  });

  it('keeps the placeholders of every key, and is never empty or identical to the key', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const [key, value] of Object.entries(DE)) {
      expect({ key, placeholders: placeholders(value) }).toEqual({
        key,
        placeholders: placeholders(key),
      });
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
