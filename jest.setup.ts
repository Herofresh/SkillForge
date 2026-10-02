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
