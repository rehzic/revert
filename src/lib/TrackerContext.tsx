import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { PRAYERS, type PrayerId } from '@/content/prayers';

// Map of local date ('YYYY-MM-DD') to the prayers marked as prayed that day.
export type PrayerLog = Record<string, PrayerId[]>;

const KEY = 'revert.log.v1';

export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

// Consecutive days with all five prayers, counting back from today
// (or from yesterday, so an unfinished today doesn't reset the streak).
export function currentStreak(log: PrayerLog, today = new Date()): number {
  const full = (d: Date) => (log[dayKey(d)]?.length ?? 0) >= PRAYERS.length;
  let d = full(today) ? today : addDays(today, -1);
  let n = 0;
  while (full(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

type Ctx = {
  log: PrayerLog;
  isPrayed: (date: Date, id: PrayerId) => boolean;
  toggle: (date: Date, id: PrayerId) => void;
};

const TrackerContext = createContext<Ctx | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<PrayerLog>({});
  const current = useRef(log);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        current.current = JSON.parse(raw);
        setLog(current.current);
      })
      .catch(() => {});
  }, []);

  const isPrayed = useCallback((date: Date, id: PrayerId) => log[dayKey(date)]?.includes(id) ?? false, [log]);

  const toggle = useCallback((date: Date, id: PrayerId) => {
    const k = dayKey(date);
    const day = current.current[k] ?? [];
    const nextDay = day.includes(id) ? day.filter((p) => p !== id) : [...day, id];
    const next = { ...current.current, [k]: nextDay };
    current.current = next;
    setLog(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  return <TrackerContext.Provider value={{ log, isPrayed, toggle }}>{children}</TrackerContext.Provider>;
}

export function useTracker(): Ctx {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used inside TrackerProvider');
  return ctx;
}
