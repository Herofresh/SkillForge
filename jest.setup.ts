// Component tests (PLAN 4.0): Reanimated and Worklets need their JS mocks under Jest, since the
// native worklet runtime doesn't exist in Node. The Reanimated mock lacks `useReducedMotion`;
// tests run with motion enabled.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: () => false,
}));
