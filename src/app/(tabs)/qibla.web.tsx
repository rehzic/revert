import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { angleDiff, qiblaBearing } from '@/lib/qibla';
import { useSettings } from '@/lib/SettingsContext';
import { useColors } from '@/lib/theme';

// Web version of the Qibla screen. A browser doesn't expose the phone's compass sensor
// the way the app does, so this reads the browser's orientation events instead.
// iPhones ask for permission first, which needs a tap on the button.
type IOSOrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export default function QiblaScreen() {
  const c = useColors();
  const { settings } = useSettings();
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [listening, setListening] = useState(false);
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

  // Android and desktop browsers don't ask, so start listening right away.
  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setError("This browser doesn't have a compass. Open this page on your phone.");
      return;
    }
    const DOE = DeviceOrientationEvent as OrientationWithPermission;
    if (typeof DOE.requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      setListening(true);
    }
  }, []);

  // Keep the dial turning with the phone while listening.
  useEffect(() => {
    if (!listening) return;
    const name = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    const handler = (e: Event) => {
      const ev = e as IOSOrientationEvent;
      if (typeof ev.webkitCompassHeading === 'number') setHeading(ev.webkitCompassHeading);
      else if (typeof ev.alpha === 'number') setHeading((360 - ev.alpha + 360) % 360);
    };
    window.addEventListener(name, handler);
    return () => window.removeEventListener(name, handler);
  }, [listening]);

  async function turnOnCompass() {
    const DOE = DeviceOrientationEvent as OrientationWithPermission;
    try {
      const result = await DOE.requestPermission?.();
      if (result !== 'granted') {
        setError('Allow motion and orientation access for this site in Safari settings, then tap again.');
        return;
      }
      setNeedsPermission(false);
      setListening(true);
    } catch {
      setError("Couldn't start the compass in this browser.");
    }
  }

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
        {/* The dial turns opposite to the phone, so N always points to true north. */}
        <View style={[styles.face, { transform: [{ rotate: `${-(heading ?? 0)}deg` }] }]}>
          <Text style={[styles.north, { color: c.text }]}>N</Text>
          {bearing !== null ? (
            <View style={[styles.face, { transform: [{ rotate: `${bearing}deg` }] }]}>
              <Text style={[styles.kaaba, { color: c.accent }]}>🕋</Text>
            </View>
          ) : null}
        </View>
        {/* Fixed marker at the top: when the Kaaba sits under it, you face the Qibla. */}
        <View style={[styles.pointer, { backgroundColor: aligned ? c.accent : c.muted }]} />
      </View>

      {needsPermission && !listening ? (
        <Pressable onPress={turnOnCompass} style={[styles.button, { backgroundColor: c.accent }]}>
          <Text style={styles.buttonText}>Turn on compass</Text>
        </Pressable>
      ) : null}

      <Text style={[styles.status, { color: aligned ? c.accent : c.text }]}>
        {error
          ? error
          : needsPermission && !listening
            ? 'Tap the button to turn on the compass.'
            : heading === null
              ? 'Waiting for your phone’s compass…'
              : aligned
                ? 'You are facing the Qibla.'
                : offset! > 0
                  ? 'Turn right'
                  : 'Turn left'}
      </Text>
      <Text style={[styles.note, { color: c.muted }]}>
        Keep the phone flat and away from metal or magnets. If the dial looks wrong, move the phone in a figure eight.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 8 },
  sub: { fontSize: 15 },
  dial: { width: 260, height: 260, borderRadius: 130, borderWidth: 1, marginTop: 16, alignItems: 'center', justifyContent: 'center' },
  face: { position: 'absolute', width: 260, height: 260, alignItems: 'center', justifyContent: 'flex-start' },
  north: { position: 'absolute', top: 10, fontSize: 16, fontWeight: '700' },
  kaaba: { position: 'absolute', top: 30, fontSize: 24 },
  pointer: { position: 'absolute', top: -7, width: 14, height: 14, borderRadius: 3, transform: [{ rotate: '45deg' }] },
  button: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  status: { fontSize: 20, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  note: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 8 },
});
