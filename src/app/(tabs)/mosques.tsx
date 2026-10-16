import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Image as RNImage, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSettings } from '@/lib/SettingsContext';
import { radius, useColors } from '@/lib/theme';

type Mosque = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  image: string | null;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const SEARCH_RADIUS_METERS = 15000;

// Distance in kilometres between two points on the Earth.
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Finds places of worship tagged as Muslim near a point, from OpenStreetMap (free, no key needed).
async function findMosques(lat: number, lon: number): Promise<Mosque[]> {
  const area = `(around:${SEARCH_RADIUS_METERS},${lat},${lon})`;
  const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"]${area};way["amenity"="place_of_worship"]["religion"="muslim"]${area};);out center tags 60;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
  if (!res.ok) throw new Error('lookup failed');
  const data = (await res.json()) as { elements: OverpassElement[] };

  return data.elements
    .map((el): Mosque | null => {
      const mLat = el.lat ?? el.center?.lat;
      const mLon = el.lon ?? el.center?.lon;
      if (mLat === undefined || mLon === undefined) return null;
      const t = el.tags ?? {};
      const street = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
      const address = [street, t['addr:city'], t['addr:postcode']].filter(Boolean).join(', ') || null;
      return {
        id: el.id,
        name: t.name ?? 'Mosque (name not listed)',
        lat: mLat,
        lon: mLon,
        distanceKm: distanceKm(lat, lon, mLat, mLon),
        address,
        phone: t.phone ?? t['contact:phone'] ?? null,
        website: t.website ?? t['contact:website'] ?? null,
        image: t.image ?? null,
      };
    })
    .filter((m): m is Mosque => m !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Turns a US zip code into a point using OpenStreetMap's place search.
async function zipToPoint(zip: string): Promise<{ lat: number; lon: number }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&postalcode=${encodeURIComponent(zip)}`
  );
  if (!res.ok) throw new Error('zip lookup failed');
  const data = (await res.json()) as { lat: string; lon: string }[];
  if (data.length === 0) throw new Error('zip not found');
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

export default function MosquesScreen() {
  const c = useColors();
  const { settings } = useSettings();
  const [zip, setZip] = useState('');
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Runs one lookup and shows its results, or a friendly error.
  async function run(task: () => Promise<Mosque[]>) {
    setLoading(true);
    setError(null);
    try {
      setMosques(await task());
    } catch (e) {
      setMosques(null);
      setError(
        e instanceof Error && e.message === 'zip not found'
          ? 'No place found for that zip code. Check it and try again.'
          : "Couldn't load mosques. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function useMyLocation() {
    if (settings.location) {
      const { latitude, longitude } = settings.location;
      return run(() => findMosques(latitude, longitude));
    }
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      setError('Allow location to find mosques near you, or search by zip code.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return run(() => findMosques(pos.coords.latitude, pos.coords.longitude));
  }

  function searchZip() {
    const clean = zip.trim();
    if (!/^\d{5}$/.test(clean)) {
      setError('Enter a 5-digit US zip code.');
      return;
    }
    return run(async () => {
      const { lat, lon } = await zipToPoint(clean);
      return findMosques(lat, lon);
    });
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>Mosques near you</Text>
      <Text style={[styles.sub, { color: c.muted }]}>
        Find a mosque by your location or zip code. Details come from OpenStreetMap, so some may be missing.
      </Text>

      <Pressable onPress={useMyLocation} style={[styles.button, { backgroundColor: c.accent }]}>
        <Text style={styles.buttonText}>Use my location</Text>
      </Pressable>

      <View style={styles.zipRow}>
        <TextInput
          value={zip}
          onChangeText={setZip}
          onSubmitEditing={searchZip}
          placeholder="Zip code"
          placeholderTextColor={c.muted}
          keyboardType="number-pad"
          maxLength={5}
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
        />
        <Pressable onPress={searchZip} style={[styles.zipButton, { backgroundColor: c.accentSoft }]}>
          <Text style={[styles.zipButtonText, { color: c.accent }]}>Search</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={c.accent} /> : null}
      {error ? <Text style={[styles.error, { color: c.text }]}>{error}</Text> : null}
      {mosques && mosques.length === 0 ? (
        <Text style={[styles.sub, { color: c.muted }]}>
          No mosques are listed within 15 km of that place. Try a bigger city or a nearby zip code.
        </Text>
      ) : null}

      {mosques?.map((m) => (
        <View key={m.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {m.image ? <RNImage source={{ uri: m.image }} style={styles.photo} /> : null}
          <Text style={[styles.name, { color: c.text }]}>{m.name}</Text>
          <Text style={[styles.meta, { color: c.muted }]}>
            {m.distanceKm.toFixed(1)} km away{m.address ? ` · ${m.address}` : ''}
          </Text>
          <Text style={[styles.meta, { color: c.muted }]}>Jumu’ah times: not listed. Call the mosque to ask.</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`)}
              style={[styles.chip, { backgroundColor: c.accentSoft }]}
            >
              <Text style={[styles.chipText, { color: c.accent }]}>Directions</Text>
            </Pressable>
            {m.phone ? (
              <Pressable onPress={() => Linking.openURL(`tel:${m.phone}`)} style={[styles.chip, { backgroundColor: c.accentSoft }]}>
                <Text style={[styles.chipText, { color: c.accent }]}>Call</Text>
              </Pressable>
            ) : null}
            {m.website?.startsWith('http') ? (
              <Pressable onPress={() => Linking.openURL(m.website!)} style={[styles.chip, { backgroundColor: c.accentSoft }]}>
                <Text style={[styles.chipText, { color: c.accent }]}>Website</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 8 },
  sub: { fontSize: 15, lineHeight: 21 },
  button: { paddingVertical: 14, borderRadius: radius.button, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  zipRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, height: 48, borderRadius: radius.button, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
  zipButton: { paddingHorizontal: 18, borderRadius: radius.button, justifyContent: 'center' },
  zipButtonText: { fontSize: 16, fontWeight: '600' },
  error: { fontSize: 15, fontWeight: '600' },
  card: { borderRadius: radius.card, borderWidth: 1, padding: 16, gap: 6, overflow: 'hidden' },
  photo: { width: '100%', height: 160, borderRadius: radius.button, marginBottom: 6 },
  name: { fontSize: 18, fontWeight: '700' },
  meta: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill },
  chipText: { fontSize: 14, fontWeight: '600' },
});
