import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SettingsProvider } from '@/lib/SettingsContext';
import { TrackerProvider } from '@/lib/TrackerContext';
import { useColors } from '@/lib/theme';

export default function RootLayout() {
  const c = useColors();

  // Tapping a prayer reminder opens that prayer's guide.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const prayer = res.notification.request.content.data?.prayer;
      if (typeof prayer === 'string') router.push(`/prayer/${prayer}`);
    });
    return () => sub.remove();
  }, []);

  return (
    <SettingsProvider>
      <TrackerProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.accent,
          headerTitleStyle: { color: c.text },
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="prayer/[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'modal' }} />
      </Stack>
      </TrackerProvider>
    </SettingsProvider>
  );
}
