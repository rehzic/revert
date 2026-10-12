import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

import type { PrayerId } from '@/content/prayers';

export const METHODS = {
  MuslimWorldLeague: 'Muslim World League',
  NorthAmerica: 'ISNA (North America)',
  MoonsightingCommittee: 'Moonsighting Committee',
  Egyptian: 'Egyptian General Authority',
  Karachi: 'University of Karachi',
  UmmAlQura: 'Umm al-Qura (Makkah)',
  Dubai: 'Dubai',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Turkey: 'Turkey (Diyanet)',
  Tehran: 'Tehran',
} as const;

export type MethodKey = keyof typeof METHODS;
export type AsrMadhab = 'shafi' | 'hanafi';

export type Location = { latitude: number; longitude: number };

export type DayTimes = { id: PrayerId | 'sunrise'; label: string; time: Date }[];

const ORDER: { id: PrayerId | 'sunrise'; label: string }[] = [
  { id: 'fajr', label: 'Fajr' },
  { id: 'sunrise', label: 'Sunrise' },
  { id: 'dhuhr', label: 'Dhuhr' },
  { id: 'asr', label: 'Asr' },
  { id: 'maghrib', label: 'Maghrib' },
  { id: 'isha', label: 'Isha' },
];

export function computeTimes(loc: Location, date: Date, method: MethodKey, madhab: AsrMadhab): DayTimes {
  const params = CalculationMethod[method]();
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  const pt = new PrayerTimes(new Coordinates(loc.latitude, loc.longitude), date, params);
  return ORDER.map(({ id, label }) => ({ id, label, time: pt[id] }));
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
