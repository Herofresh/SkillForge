import { Redirect } from 'expo-router';

/**
 * An unknown route (e.g. a mistyped `skillforge://` link) goes to the app's start (PLAN 7.0a)
 * instead of expo-router's "Unmatched Route" screen.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
