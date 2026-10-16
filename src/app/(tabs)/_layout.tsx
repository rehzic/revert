import { Tabs } from 'expo-router';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { useColors } from '@/lib/theme';

// Each tab is a rounded app-style icon in a floating dock at the bottom, like the iPhone home screen.
function icon(glyph: string, bg: string) {
  return function TabIcon({ focused }: { focused: boolean; color: ColorValue }) {
    return (
      <View style={[styles.tile, { backgroundColor: bg, transform: [{ scale: focused ? 1.08 : 1 }] }]}>
        <Text style={styles.glyph}>{glyph}</Text>
      </View>
    );
  };
}

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: [styles.dock, { backgroundColor: c.card, borderColor: c.border }],
        tabBarItemStyle: styles.item,
        headerStyle: { backgroundColor: c.bg },
        headerTitleStyle: { color: c.text },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Prayer Times', tabBarIcon: icon('◐', '#7D6FCB') }} />
      <Tabs.Screen name="track" options={{ title: 'Prayer Tracker', tabBarIcon: icon('◉', '#F0A58A') }} />
      <Tabs.Screen name="qibla" options={{ title: 'Qibla', tabBarIcon: icon('⌖', '#7D6FCB') }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn to Pray', tabBarIcon: icon('❖', '#A895E0') }} />
      <Tabs.Screen name="wudu" options={{ title: 'Wudu', tabBarIcon: icon('≋', '#86C4AE') }} />
       <Tabs.Screen name="mosques" options={{ title: 'Mosques', tabBarIcon: icon('⌂', '#8FB8E0') }} />
   </Tabs>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    height: 84,
    justifyContent: 'center',
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  item: { height: 60, paddingTop: 0, paddingBottom: 0, justifyContent: 'center', alignItems: 'center' },
  tile: { width: 56, height: 56, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  glyph: { color: '#fff', fontSize: 26, fontWeight: '600' },
});
