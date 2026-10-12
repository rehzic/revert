import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AsrMadhab, Location, MethodKey } from './prayerTimes';

export type Settings = {
  method: MethodKey;
  madhab: AsrMadhab;
  notifications: boolean;
  location: Location | null;
  placeName: string | null;
};

const KEY = 'revert.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  method: 'MuslimWorldLeague',
  madhab: 'shafi',
  notifications: false,
  location: null,
  placeName: null,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}
