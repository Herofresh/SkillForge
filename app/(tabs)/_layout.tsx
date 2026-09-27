import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router/js-tabs';

import { Colors } from '@/components/theme';

type TabDef = {
  name: string;
  title: string;
  icon: SymbolViewProps['name'];
};

const TABS: readonly TabDef[] = [
  {
    name: 'tree',
    title: 'Tree',
    icon: { ios: 'tree', android: 'account_tree', web: 'account_tree' },
  },
  {
    name: 'train',
    title: 'Train',
    icon: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
  },
  {
    name: 'character',
    title: 'Character',
    icon: { ios: 'person', android: 'person', web: 'person' },
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: { ios: 'gearshape', android: 'settings', web: 'settings' },
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
      }}>
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <SymbolView name={icon} tintColor={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
