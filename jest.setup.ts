// Component tests (PLAN 4.0): Reanimated and Worklets need their JS mocks under Jest, since the
// native worklet runtime doesn't exist in Node. The Reanimated mock lacks `useReducedMotion`;
// tests run with motion enabled.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
// The home-screen widget library (PLAN 6.6) needs its native module; tests get marker components
// (like the library's own, they render nothing and carry their name) and no-op API functions.
jest.mock('react-native-android-widget', () => {
  const marker = (name: string) => Object.assign(() => null, { __name__: name });
  return {
    FlexWidget: marker('FlexWidget'),
    TextWidget: marker('TextWidget'),
    SvgWidget: marker('SvgWidget'),
    registerWidgetTaskHandler: jest.fn(),
    requestWidgetUpdate: jest.fn(() => Promise.resolve()),
  };
});
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: () => false,
}));

// Heavy suites (PLAN maintenance): component suites render real screens (the map draws every node,
// the editor and live session run a real store) and scripts/appIcon renders the icon bitmaps. Alone
// they take 1-5 s per test, but in a full parallel run beside other work they have taken up to
// ~30 s, past Jest's 5 s default. They get one generous timeout here instead of per-test numbers;
// a hung test still fails (later), and assertion failures are unaffected. Pure suites keep 5 s.
const UI_SUITE_TIMEOUT_MS = 60_000;
const HEAVY_SUITE_PATH = /[\\/](src[\\/]components|scripts[\\/]appIcon\.test)[\\/.]/;
if (HEAVY_SUITE_PATH.test(expect.getState().testPath ?? '')) {
  jest.setTimeout(UI_SUITE_TIMEOUT_MS);
}
