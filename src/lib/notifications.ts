import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { computeTimes } from './prayerTimes';
import type { Settings } from './settings';

const CHANNEL_ID = 'prayer-times';
// iOS keeps at most 64 pending notifications; 5 prayers x 7 days stays well under that.
const DAYS_AHEAD = 7;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Prayer times',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Replaces all scheduled reminders with one per prayer for the next week.
// Called whenever the app opens or settings change, so the window keeps rolling forward.
export async function scheduleReminders(settings: Settings): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.notifications || !settings.location) return 0;

  const now = Date.now();
  let count = 0;
  for (let d = 0; d < DAYS_AHEAD; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const times = computeTimes(settings.location, date, settings.method, settings.madhab);
    for (const t of times) {
      if (t.id === 'sunrise' || t.time.getTime() <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${t.label}`,
          body: `It's time to pray ${t.label}. Tap to open the guide.`,
          data: { prayer: t.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: t.time,
          channelId: CHANNEL_ID,
        },
      });
      count++;
    }
  }
  return count;
}
