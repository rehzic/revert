import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { VideoCard } from '@/components/VideoCard';
import { WUDU_VIDEO_INDEX } from '@/content/videos';
import { WUDU_BREAKERS, WUDU_STEPS } from '@/content/wudu';
import { useColors } from '@/lib/theme';

export default function WuduScreen() {
  const c = useColors();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VideoCard index={WUDU_VIDEO_INDEX} label="Wudu" />
      <Text style={[styles.intro, { color: c.muted }]}>
        Wudu is the washing you do before prayer. Use clean water and go in this order. Each wash is usually done three
        times; once is the minimum.
      </Text>
      {WUDU_STEPS.map((s, i) => (
        <View key={s.title} style={[styles.step, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.num, { backgroundColor: c.accentSoft }]}>
            <Text style={[styles.numText, { color: c.accent }]}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: c.text }]}>{s.title}</Text>
              {s.times ? <Text style={[styles.times, { color: c.accent }]}>{s.times}×</Text> : null}
            </View>
            <Text style={[styles.body, { color: c.text }]}>{s.instruction}</Text>
          </View>
        </View>
      ))}
      <View style={[styles.box, { backgroundColor: c.accentSoft }]}>
        <Text style={[styles.title, { color: c.text }]}>What breaks wudu</Text>
        {WUDU_BREAKERS.map((b) => (
          <Text key={b} style={[styles.body, { color: c.text }]}>
            • {b}
          </Text>
        ))}
        <Text style={[styles.small, { color: c.muted }]}>
          If your wudu is broken, repeat it before your next prayer.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 130, gap: 12 },
  intro: { fontSize: 15, lineHeight: 21 },
  step: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 26, padding: 14 },
  num: { width: 32, height: 32, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  numText: { fontWeight: '700' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600' },
  times: { fontSize: 14, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21 },
  box: { borderRadius: 26, padding: 16, gap: 6, marginTop: 4 },
  small: { fontSize: 13, marginTop: 4 },
});
