import { StyleSheet, Text, View } from 'react-native';

import type { Recitation } from '@/content/prayers';
import { useColors } from '@/lib/theme';

export function RecitationCard({ r }: { r: Recitation }) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {r.repeat ? <Text style={[styles.repeat, { color: c.accent }]}>Say {r.repeat}×</Text> : null}
      {r.arabic ? <Text style={[styles.arabic, { color: c.text }]}>{r.arabic}</Text> : null}
      <Text style={[styles.translit, { color: c.text }]}>{r.transliteration}</Text>
      <Text style={[styles.meaning, { color: c.muted }]}>{r.meaning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 8 },
  repeat: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  arabic: { fontSize: 24, lineHeight: 42, textAlign: 'right', writingDirection: 'rtl' },
  translit: { fontSize: 15, fontStyle: 'italic', lineHeight: 22 },
  meaning: { fontSize: 14, lineHeight: 20 },
});
