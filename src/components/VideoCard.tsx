import { StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';

import { PLAYLIST_ID } from '@/content/videos';
import { radius, useColors } from '@/lib/theme';

// Embeds the official YouTube player for one video in the playlist, so the video stays on YouTube.
function playlistEmbedUrl(index: number) {
  return `https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&index=${index}&playsinline=1&rel=0`;
}

export function VideoCard({ index, label }: { index: number | null; label: string }) {
  const c = useColors();
  if (index !== null) {
    return (
      <View style={styles.frame}>
        <WebView
          source={{ uri: playlistEmbedUrl(index) }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={styles.web}
        />
      </View>
    );
  }
  return (
    <View style={[styles.frame, styles.placeholder, { backgroundColor: c.accentSoft, borderColor: c.border }]}>
      <Text style={[styles.icon, { color: c.accent }]}>▶</Text>
      <Text style={[styles.title, { color: c.text }]}>{label} video coming soon</Text>
      <Text style={[styles.sub, { color: c.muted }]}>Follow the steps below in the meantime.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.card, overflow: 'hidden', backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000' },
  placeholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 4, padding: 16 },
  icon: { fontSize: 32 },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13 },
});
