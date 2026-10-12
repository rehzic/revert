import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PRAYERS } from '@/content/prayers';
import { addDays, currentStreak, dayKey, useTracker } from '@/lib/TrackerContext';
import { useColors } from '@/lib/theme';

const WEEK = 7;

export default function TrackScreen() {
  const c = useColors();
  const { log, isPrayed, toggle } = useTracker();
  const today = new Date();
  const [selected, setSelected] = useState(today);

  const doneToday = log[dayKey(selected)]?.length ?? 0;
  const streak = currentStreak(log, today);
  const days = Array.from({ length: WEEK }, (_, i) => addDays(today, i - (WEEK - 1)));
  const isToday = dayKey(selected) === dayKey(today);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: c.accent }]}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}>
          <Text style={[styles.statValue, { color: c.text }]}>
            {doneToday}/{PRAYERS.length}
          </Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>{isToday ? 'prayed today' : 'prayed that day'}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>This week</Text>
        <View style={styles.week}>
          {days.map((d) => {
            const count = log[dayKey(d)]?.length ?? 0;
            const active = dayKey(d) === dayKey(selected);
            return (
              <Pressable key={dayKey(d)} onPress={() => setSelected(d)} style={styles.dayCol}>
                <Text style={[styles.dayName, { color: active ? c.accent : c.muted }]}>
                  {d.toLocaleDateString([], { weekday: 'narrow' })}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    { borderColor: active ? c.accent : c.border },
                    count === PRAYERS.length && { backgroundColor: c.accent, borderColor: c.accent },
                    count > 0 && count < PRAYERS.length && { backgroundColor: c.accentSoft },
                  ]}
                >
                  <Text style={[styles.dayNum, { color: count === PRAYERS.length ? '#fff' : c.text }]}>
                    {d.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>
          {isToday ? 'Today' : selected.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
        {PRAYERS.map((p) => {
          const done = isPrayed(selected, p.id);
          return (
            <Pressable key={p.id} onPress={() => toggle(selected, p.id)} style={[styles.row, { borderTopColor: c.border }]}>
              <View style={[styles.check, { borderColor: c.accent }, done && { backgroundColor: c.accent }]}>
                {done ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <Text style={[styles.rowText, { color: c.text }]}>{p.name}</Text>
              <Text style={[styles.rowArabic, { color: c.muted }]}>{p.arabic}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.note, { color: c.muted }]}>Tap a prayer to mark it as prayed. Tap a day above to edit it.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 130, gap: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 26, padding: 16, gap: 2 },
  statValue: { fontSize: 32, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 13, color: '#F5F3FD' },
  card: { borderWidth: 1, borderRadius: 26, padding: 16, gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayName: { fontSize: 12, fontWeight: '600' },
  dayDot: { width: 36, height: 36, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rowText: { fontSize: 16, flex: 1 },
  rowArabic: { fontSize: 18 },
  note: { fontSize: 13, textAlign: 'center' },
});
