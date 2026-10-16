import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { angleDiff, headingFromMagnetometer, qiblaBearing } from '@/lib/qibla';
import { useSettings } from '@/lib/SettingsContext';
import { useColors } from '@/lib/theme';

export default function QiblaScreen() {
  const c = useColors();
  const { settings } = useSettings();
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fallback to saved location if we have one; otherwise ask once.
  const [coords, setCoords] = useState(settings.location);
  useEffect(() => {
    if (coords) return;
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return setError('Location is needed to find the direction of the Kaaba.');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })().catch(() => setError("Couldn't get your location."));
  }, [coords]);

    useEffect(() => {
    // The compass sensor isn't available in a web browser; skip it there instead of crashing.
    try {
      Magnetometer.setUpdateInterval(200);
      const sub = Magnetometer.addListener(({ x, y }) => setHeading(headingFromMagnetometer(x, y)));
      return () => sub.remove();
    } catch {
      return undefined;
    }
  }, []);


  const bearing = coords ? qiblaBearing(coords.latitude, coords.longitude) : null;
  const offset = bearing !== null && heading !== null ? angleDiff(bearing, heading) : null;
  const aligned = offset !== null && Math.abs(offset) < 5;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.title, { color: c.text }]}>Qibla</Text>
      <Text style={[styles.sub, { color: c.muted }]}>
        {bearing !== null ? `Kaaba is ${Math.round(bearing)}° from true north` : 'Finding your location…'}
      </Text>

      <View style={[styles.dial, { borderColor: c.border, backgroundColor: c.card }]}>
        <View
          style={[
            styles.needleWrap,
            { transform: [{ rotate: `${offset ?? 0}deg` }] },
          ]}
        >
          <View style={[styles.needle, { backgroundColor: aligned ? c.accent : c.muted }]} />
          <Text style={[styles.kaaba, { color: c.accent }]}>🕋</Text>
        </View>
      </View>

      <Text style={[styles.status, { color: aligned ? c.accent : c.text }]}>
        {error
          ? error
          : offset === null
            ? 'Hold your phone flat and turn slowly.'
            : aligned
              ? 'You are facing the Qibla.'
              : offset > 0
                ? 'Turn right'
                : 'Turn left'}
      </Text>
      <Text style={[styles.note, { color: c.muted }]}>
        Keep the phone flat and away from metal or magnets. If the arrow looks wrong, move the phone in a figure eight.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 8 },
  sub: { fontSize: 15 },
  dial: { width: 260, height: 260, borderRadius: 130, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  needleWrap: { position: 'absolute', width: 260, height: 260, alignItems: 'center', justifyContent: 'flex-start' },
  needle: { width: 4, height: 110, borderRadius: 2, marginTop: 14 },
  kaaba: { position: 'absolute', top: 2, fontSize: 22 },
  status: { fontSize: 20, fontWeight: '600', marginTop: 24 },
  note: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 8 },
});
