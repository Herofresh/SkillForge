import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { Border, Colors, FontFamily, TypeScale } from '@/components/theme';
import { PixelIcon, type IconName } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';

type TabDef = {
  name: string;
  title: string;
  icon: IconName;
};

const TABS: readonly TabDef[] = [
  { name: 'tree', title: 'Tree', icon: 'tree' },
  { name: 'train', title: 'Train', icon: 'bar' },
  { name: 'character', title: 'Character', icon: 'helmet' },
  { name: 'settings', title: 'Settings', icon: 'gear' },
];

/** Tab and header background: stone with an ink + gold pixel rule on the inner edge. */
function Rule({ edge }: { edge: 'top' | 'bottom' }) {
  const lines = [
    <View key="ink" style={[styles.line, { backgroundColor: Colors.ink }]} />,
    <View key="gold" style={[styles.line, { backgroundColor: Colors.goldDark }]} />,
  ];
  return (
    <View style={[styles.bar, edge === 'top' ? styles.top : styles.bottom]}>
      {edge === 'top' ? lines : lines.reverse()}
    </View>
  );
}

export default function TabLayout() {
  // First run (PLAN 4.1): the tabs wait until onboarding is completed.
  const onboarded = useAppStore((state) => state.onboardingCompletedAt !== undefined);
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopWidth: 0 },
        tabBarBackground: () => <Rule edge="top" />,
        tabBarLabelStyle: { fontFamily: FontFamily.caps, fontSize: 10 },
        headerStyle: { backgroundColor: Colors.surface },
        headerBackground: () => <Rule edge="bottom" />,
        headerShadowVisible: false,
        headerTintColor: Colors.gold,
        headerTitleStyle: { fontFamily: TypeScale.title.fontFamily, fontSize: 20 },
      }}>
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => <PixelIcon name={icon} tint={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  top: {
    justifyContent: 'flex-start',
  },
  bottom: {
    justifyContent: 'flex-end',
  },
  line: {
    height: Border.line,
  },
});
