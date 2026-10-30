import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { Border, Colors, FontFamily, HeaderTitleStyle } from '@/components/theme';
import { PixelIcon, type IconName } from '@/components/ui';
import { nodesAwaitingTrial } from '@/domain/progression';
import { k, t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

type TabDef = {
  name: string;
  title: string;
  icon: IconName;
};

const DOT_SIZE = 10;

const TABS: readonly TabDef[] = [
  { name: 'tree', title: k('Tree'), icon: 'tree' },
  { name: 'train', title: k('Train'), icon: 'bar' },
  { name: 'character', title: k('Character'), icon: 'helmet' },
  { name: 'settings', title: k('Settings'), icon: 'gear' },
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
  // FB-4: a small red dot on the Tree tab while a skill waits for its Trial to keep levelling.
  const awaiting = useAppStore(
    (state) => nodesAwaitingTrial(state.nodes, state.engine.progress).length,
  );
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
        headerTitleStyle: HeaderTitleStyle,
      }}>
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(title),
            tabBarIcon: ({ color }) => <PixelIcon name={icon} tint={color} />,
            ...(name === 'tree' && awaiting > 0
              ? {
                  tabBarBadge: '',
                  tabBarBadgeStyle: styles.dot,
                  tabBarAccessibilityLabel:
                    awaiting === 1
                      ? t('{title}, 1 skill needs its Trial', { title: t(title) })
                      : t('{title}, {n} skills need their Trial', { title: t(title), n: awaiting }),
                }
              : {}),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /** The Tree tab's "Trial needed" dot (FB-4): a badge without a number. */
  dot: {
    minWidth: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.danger,
  },
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
