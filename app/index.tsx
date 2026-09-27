import { Redirect } from 'expo-router';

/** The app opens on the skill tree. */
export default function Index() {
  return <Redirect href="/tree" />;
}
