import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { setLocale, t } from '@/i18n';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import { LocaleKey } from './LocaleKey';
import { LanguagePanel } from './settings/LanguagePanel';
import { PixelText } from './ui';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const NOW = 1_790_000_000_000;

let test: TestDatabase;
let store: AppStore;
beforeEach(async () => {
  test = await openTestDatabase();
  store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    deviceLocaleTag: () => 'en_US',
  });
  store.getState().loadAll();
  setAppStore(store);
});
afterEach(() => {
  setLocale('en');
  test.close();
});

/** A screen text that follows the locale, under the remounting key. */
function Greeting() {
  return <PixelText testID="greeting">{t('Tree')}</PixelText>;
}

describe('Settings → Language (PLAN 7.8 FB-8, ADR-080)', () => {
  it('offers System, English and Deutsch, each in its own language, and switches at once', async () => {
    const user = userEvent.setup();
    await render(
      <LocaleKey>
        <LanguagePanel />
        <Greeting />
      </LocaleKey>,
    );
    expect(screen.getByTestId('language-system')).toHaveProp('accessibilityState', {
      selected: true,
    });
    expect(screen.getByText('Deutsch')).toBeOnTheScreen();
    expect(screen.getByTestId('language-text')).toHaveTextContent(
      /^Follows your device language \(English now\)\./,
    );
    expect(screen.getByTestId('greeting')).toHaveTextContent('Tree');

    await user.press(screen.getByTestId('language-de'));
    expect(store.getState()).toMatchObject({ language: 'de', locale: 'de' });
    // The panel itself and everything under LocaleKey now read in German.
    expect(screen.getByText('Sprache')).toBeOnTheScreen();
    expect(screen.getByTestId('language-text')).toHaveTextContent(
      /^Die App bleibt auf Deutsch, egal welche Sprache das Gerät hat\./,
    );
    expect(screen.getByTestId('greeting')).toHaveTextContent('Baum');

    await user.press(screen.getByTestId('language-system'));
    expect(store.getState()).toMatchObject({ language: 'system', locale: 'en' });
    expect(screen.getByTestId('greeting')).toHaveTextContent('Tree');
  });
});
