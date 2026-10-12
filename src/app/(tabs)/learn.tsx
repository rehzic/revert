import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PRAYERS } from '@/content/prayers';
import { useColors } from '@/lib/theme';

export default function LearnScreen() {
  const c = useColors();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.intro, { color: c.muted }]}>
        Each prayer follows the same pattern of standing, bowing and prostrating. Pick a prayer to follow it step by
        step, one rak'ah at a time. Make wudu first.
      </Text>
      {PRAYERS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/prayer/${p.id}`)}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.name, { color: c.text }]}>{p.name}</Text>
              <Text style={[styles.when, { color: c.muted }]}>{p.when}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
              <Text style={[styles.badgeText, { color: c.accent }]}>{p.rakahs} rak'ahs</Text>
            </View>
            <Text style={[styles.arabic, { color: c.text }]}>{p.arabic}</Text>
          </Pressable>
      ))}
      <Text style={[styles.note, { color: c.muted }]}>
        These guides cover the obligatory (fard) rak'ahs. Details vary slightly between schools of thought; ask your
        local mosque if you're unsure about anything.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 130, gap: 12 },
  intro: { fontSize: 15, lineHeight: 21, marginBottom: 4 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 26, padding: 16 },
  name: { fontSize: 18, fontWeight: '600' },
  when: { fontSize: 13 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  arabic: { fontSize: 22, minWidth: 64, textAlign: 'right' },
  note: { fontSize: 13, lineHeight: 19, marginTop: 8 },
});
