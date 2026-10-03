/**
 * The guard around `react-native-android-widget` (PLAN 6.6, ADR-055). The library's entry looks up
 * its native TurboModule with `getEnforcing` as soon as it is imported, which throws where the
 * module isn't compiled in: Expo Go, iOS, web and Jest. So nothing imports the library (or
 * `nativeWidget.tsx`, which does) statically; `loadNativeWidget` checks first and `require`s it
 * only when the native module exists, i.e. in a build made with `npm run build:apk`.
 */
import { Platform, TurboModuleRegistry } from 'react-native';

/** The native module name the library registers. */
const NATIVE_MODULE_NAME = 'AndroidWidget';

export type NativeWidget = typeof import('./nativeWidget');

/** True only in an Android build that contains the widget's native code. */
export function widgetsAvailable(): boolean {
  return Platform.OS === 'android' && TurboModuleRegistry.get(NATIVE_MODULE_NAME) != null;
}

/** The widget code, or `undefined` where its native module is missing (Expo Go, tests, iOS, web). */
export function loadNativeWidget(): NativeWidget | undefined {
  if (!widgetsAvailable()) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- only safe after the check above
  return require('./nativeWidget') as NativeWidget;
}
