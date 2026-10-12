import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { requestNotificationPermission } from '@/lib/notifications';
import { computeTimes, formatCountdown, formatTime } from '@/lib/prayerTimes';
import { useSettings } from '@/lib/SettingsContext';
import { useTracker } from '@/lib/TrackerContext';
import { useColors } from '@/lib/theme';

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export default function TimesScreen() {
  const c = useColors();
  const { settings, loaded, update } = useSettings();
  const { isPrayed, toggle } = useTracker();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow();

  async function locate() {
    setLocating(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setError('Location permission is needed to work out prayer times for where you are.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      let placeName: string | null = null;
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        placeName = [place?.city, place?.region ?? place?.country].filter(Boolean).join(', ') || null;
      } catch {}
      await update({ location: { latitude, longitude }, placeName });
    } catch {
      setError("Couldn't get your location. Try again.");
    } finally {
      setLocating(false);
    }
  }

  useEffect(() => {
    if (loaded && !settings.location) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const today = useMemo(
    () => (settings.location ? computeTimes(settings.location, now, settings.method, settings.madhab) : null),
    // Recompute when the calendar day changes, not every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.location, settings.method, settings.madhab, now.toDateString()],
  );

  const next = useMemo(() => {
    if (!settings.location || !today) return null;
    const upcoming = today.find((t) => t.id !== 'sunrise' && t.time > now);
    if (upcoming) return upcoming;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return computeTimes(settings.location, tomorrow, settings.method, settings.madhab)[0];
  }, [today, now, settings]);

  async function toggleNotifications(on: boolean) {
    if (on && !(await requestNotificationPermission())) {
      setError('Notifications are turned off for Revert in your phone settings.');
      return;
    }
    await update({ notifications: on });
  }

  if (!loaded) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {next ? (
        <View style={[styles.hero, { backgroundColor: c.accent }]}>
          <Text style={styles.heroLabel}>Next prayer</Text>
          <Text style={styles.heroName}>{next.label}</Text>
          <Text style={styles.heroTime}>
            {formatTime(next.time)} · in {formatCountdown(next.time.getTime() - now.getTime())}
          </Text>
          {next.id !== 'sunrise' ? (
            <Pressable style={styles.heroButton} onPress={() => router.push(`/prayer/${next.id}`)}>
                <Text style={[styles.heroButtonText, { color: c.accent }]}>How to pray {next.label}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.body, { color: c.text }]}>
            Revert needs your location to show today's prayer times.
          </Text>
          <Pressable onPress={locate} style={[styles.button, { backgroundColor: c.accent }]} disabled={locating}>
            <Text style={styles.buttonText}>{locating ? 'Finding you…' : 'Use my location'}</Text>
          </Pressable>
        </View>
      )}

      {error ? <Text style={[styles.error]}>{error}</Text> : null}

      {today ? (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Today's timeline</Text>
            <Pressable onPress={locate} disabled={locating}>
              <Text style={{ color: c.accent }}>{locating ? 'Updating…' : settings.placeName ?? 'Update location'}</Text>
            </Pressable>
          </View>
          <View style={styles.timeline}>
            {today.map((t) => {
              const isNext = next?.id === t.id && next.time.getTime() === t.time.getTime();
              const isSunrise = t.id === 'sunrise';
              const prayerId = t.id === 'sunrise' ? null : t.id;
              const done = prayerId !== null && isPrayed(now, prayerId);
              return (
                <Pressable
                  key={t.id}
                  disabled={isSunrise}
                  onPress={() => prayerId !== null && toggle(now, prayerId)}
                  style={styles.timelineRow}
                >
                  <View style={styles.spine}>
                    <View style={[styles.line, { backgroundColor: c.border }]} />
                    <View
                      style={[
                        styles.node,
                        { borderColor: isSunrise ? c.muted : c.accent, backgroundColor: done ? c.accent : c.card },
                        isNext && { width: 16, height: 16, borderRadius: 8 },
                      ]}
                    />
                  </View>
                  <View style={styles.timelineText}>
                    <Text style={[styles.timeName, { color: isSunrise ? c.muted : c.text }]}>
                      {t.label}
                      {isNext ? '  · next' : ''}
                    </Text>
                    <Text style={[styles.timeValue, { color: isSunrise ? c.muted : c.text }]}>{formatTime(t.time)}</Text>
                  </View>
                  {done ? <Text style={{ color: c.accent, fontWeight: '700' }}>Done</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Prayer reminders</Text>
            <Text style={[styles.small, { color: c.muted }]}>Get a notification when each prayer time begins.</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={toggleNotifications}
            disabled={!settings.location}
            trackColor={{ true: c.accent }}
          />
        </View>
        <Pressable onPress={() => router.push('/settings')}>
            <Text style={{ color: c.accent, marginTop: 4 }}>Calculation method and Asr timing ›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 130, gap: 16 },
  hero: { borderRadius: 26, padding: 20, gap: 4 },
  heroLabel: { color: '#F5F3FD', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  heroName: { color: '#fff', fontSize: 36, fontWeight: '700' },
  heroTime: { color: '#fff', fontSize: 16 },
  heroButton: { marginTop: 12, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 10, alignItems: 'center' },
  heroButtonText: { fontWeight: '600', fontSize: 15 },
  card: { borderWidth: 1, borderRadius: 26, padding: 16, gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  timeline: { gap: 0, marginTop: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 58 },
  spine: { width: 20, alignItems: 'center', alignSelf: 'stretch' },
  line: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  node: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginTop: 23 },
  timelineText: { flex: 1, gap: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8 },
  timeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 22, height: 22, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkSpacer: { width: 22 },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 12 },
  timeName: { fontSize: 16 },
  timeValue: { fontSize: 16, fontVariant: ['tabular-nums'] },
  body: { fontSize: 15, lineHeight: 21 },
  small: { fontSize: 13 },
  button: { borderRadius: 18, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  error: { color: '#C0392B', fontSize: 14 },
});
