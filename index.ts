// The app's entry (package.json "main"). expo-router's entry registers the app; the home-screen
// widget's background task must be registered at bundle start too, because Android can start the
// bundle just to draw the widget while the app is closed (PLAN 6.6, ADR-055). Outside a build with
// the widget's native code (Expo Go, tests) `loadNativeWidget` returns undefined and nothing runs.
import 'expo-router/entry';

import { loadNativeWidget } from './src/widget/widgetModule';

loadNativeWidget()?.registerWidgetTask();
