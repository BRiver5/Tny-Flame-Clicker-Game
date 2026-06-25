import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { COLORS } from '@/src/game/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.FLAME_CORE,
        tabBarInactiveTintColor: COLORS.TEXT_DIM,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Campfire',
          tabBarIcon: ({ color }) => <TabIcon label="🔥" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <TabIcon label="🛒" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon label="⚙" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontSize: 18 }}>{label}</Text>;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.PANEL,
    borderTopColor: 'rgba(255,255,255,0.08)',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
