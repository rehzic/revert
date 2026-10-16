import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PLAYLIST_ID } from '@/content/videos';
import { radius, useColors } from '@/lib/theme';

// Web version of VideoCard: the phone's video player doesn't run in a browser,
// so this card opens the video on YouTube instead.
function playlistUrl(index: number) {
  return `https://www.youtube.com/playlist?list=${PLAYLIST_ID}&index=${index + 1}`;
}

export function VideoCard({ index, label }: { index: number | null; label: string }) {
  const c = useColors();
  if (index !== null) {
    return (
      <Pressable
        onPress={() => Linking.openURL(playlistUrl(index))}
        style={[styles.frame, styles.placeholder, { backgroundColor: c.accentSoft, borderColor: c.border, borderWidth: 1 }]}
      >
        <Text style={[styles.icon, { color: c.accent }]}>▶</Text>
        <Text style={[styles.title, { color: c.text }]}>Watch the {label} video</Text>
        <Text style={[styles.sub, { color: c.muted }]}>Opens on YouTube</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.frame, styles.placeholder, { backgroundColor: c.accentSoft, borderColor: c.border, borderWidth: 1 }]}>
      <Text style={[styles.icon, { color: c.accent }]}>▶</Text>
      <Text style={[styles.title, { color: c.text }]}>{label} video coming soon</Text>
      <Text style={[styles.sub, { color: c.muted }]}>Follow the steps below in the meantime.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.card, overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 4, padding: 16 },
  icon: { fontSize: 32 },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13 },
});
