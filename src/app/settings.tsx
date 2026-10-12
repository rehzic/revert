import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { METHODS, type AsrMadhab, type MethodKey } from '@/lib/prayerTimes';
import { useSettings } from '@/lib/SettingsContext';
import { useColors } from '@/lib/theme';

export default function SettingsScreen() {
  const c = useColors();
  const { settings, update } = useSettings();

  function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={[styles.option, { borderBottomColor: c.border }]}>
        <Text style={[styles.optionText, { color: c.text }]}>{label}</Text>
        {selected ? <Text style={{ color: c.accent, fontSize: 18 }}>✓</Text> : null}
      </Pressable>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: c.muted }]}>Asr timing</Text>
      <View style={[styles.group, { backgroundColor: c.card, borderColor: c.border }]}>
        {(
          [
            ['shafi', 'Standard (Shafi, Maliki, Hanbali)'],
            ['hanafi', 'Hanafi (later Asr)'],
          ] as [AsrMadhab, string][]
        ).map(([key, label]) => (
          <Option key={key} label={label} selected={settings.madhab === key} onPress={() => update({ madhab: key })} />
        ))}
      </View>

      <Text style={[styles.heading, { color: c.muted }]}>Calculation method</Text>
      <Text style={[styles.help, { color: c.muted }]}>
        Pick the one your local mosque uses. If you're not sure, Muslim World League works in most places.
      </Text>
      <View style={[styles.group, { backgroundColor: c.card, borderColor: c.border }]}>
        {(Object.keys(METHODS) as MethodKey[]).map((key) => (
          <Option
            key={key}
            label={METHODS[key]}
            selected={settings.method === key}
            onPress={() => update({ method: key })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, paddingBottom: 40 },
  heading: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12 },
  help: { fontSize: 13, lineHeight: 18 },
  group: { borderWidth: 1, borderRadius: 26, overflow: 'hidden' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  optionText: { fontSize: 15, flex: 1 },
});
