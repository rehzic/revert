import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RecitationCard } from '@/components/RecitationCard';
import { VideoCard } from '@/components/VideoCard';
import { buildSteps, getPrayer } from '@/content/prayers';
import { PRAYER_VIDEO_INDEX } from '@/content/videos';
import { useTracker } from '@/lib/TrackerContext';
import { useColors } from '@/lib/theme';

export default function PrayerGuide() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayer = getPrayer(id);
  const steps = useMemo(() => (prayer ? buildSteps(prayer) : []), [prayer]);
  const [i, setI] = useState(0);
  const { isPrayed, toggle } = useTracker();

  if (!prayer) return <Text style={{ padding: 16, color: c.text }}>Prayer not found.</Text>;

  const step = steps[i];
  const last = i === steps.length - 1;
  const prayedToday = isPrayed(new Date(), prayer.id);

  const goNext = () => {
    if (!last) return setI(i + 1);
    if (!prayedToday) toggle(new Date(), prayer.id);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: `${prayer.name} · ${prayer.rakahs} rak'ahs` }} />
      <ScrollView contentContainerStyle={styles.container}>
        <VideoCard index={PRAYER_VIDEO_INDEX[prayer.id]} label={prayer.name} />

        <View style={styles.progressRow}>
          <Text style={[styles.rakah, { color: c.accent }]}>
            Rak'ah {step.rakah} of {prayer.rakahs}
          </Text>
          <Text style={[styles.count, { color: c.muted }]}>
            Step {i + 1} / {steps.length}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: c.border }]}>
          <View style={[styles.fill, { backgroundColor: c.accent, width: `${((i + 1) / steps.length) * 100}%` }]} />
        </View>

        <Text style={[styles.position, { color: c.text }]}>{step.position}</Text>
        <Text style={[styles.instruction, { color: c.text }]}>{step.instruction}</Text>
        {step.recitations.map((r, k) => (
          <RecitationCard key={k} r={r} />
        ))}
      </ScrollView>

      <View style={[styles.nav, { borderTopColor: c.border, backgroundColor: c.bg }]}>
        <Pressable
          onPress={() => setI(i - 1)}
          disabled={i === 0}
          style={[styles.navButton, { borderColor: c.border, opacity: i === 0 ? 0.4 : 1 }]}
        >
          <Text style={[styles.navText, { color: c.text }]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={goNext}
          style={[styles.navButton, styles.primary, { backgroundColor: c.accent, borderColor: c.accent }]}
        >
          <Text style={[styles.navText, { color: '#fff' }]}>{last ? (prayedToday ? 'Done' : `Mark ${prayer.name} as prayed`) : 'Next'}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  rakah: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  count: { fontSize: 13 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6 },
  position: { fontSize: 24, fontWeight: '700' },
  instruction: { fontSize: 16, lineHeight: 23 },
  nav: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 28, borderTopWidth: 1 },
  navButton: { flex: 1, borderWidth: 1, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  primary: { flex: 2 },
  navText: { fontSize: 16, fontWeight: '600' },
});
