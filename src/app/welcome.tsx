import { router } from 'expo-router';
import { useRef } from 'react';
import { Image, PanResponder, StyleSheet, Text, View } from 'react-native';

// Opening screen: the logo in the middle. Swipe left or up (or tap) to enter the app.
export default function WelcomeScreen() {
  const openApp = () => router.replace('/(tabs)');
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50 || g.dy < -50) openApp();
      },
    })
  ).current;

  return (
    <View style={styles.screen} {...panResponder.panHandlers}>
      <Image source={require('../../assets/revert-logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.hint}>Swipe left or up to open</Text>
      <Text onPress={openApp} style={styles.tap}>
        or tap here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4F5EA', padding: 24 },
  logo: { width: 240, height: 288 },
  hint: { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#0F2A22' },
  tap: { marginTop: 10, padding: 8, fontSize: 15, color: '#00875A', textDecorationLine: 'underline' },
});
