import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>🗣️</Text>
        </View>
        <Text style={styles.headline}>Speak English{'\n'}with confidence</Text>
        <Text style={styles.sub}>
          Practice real conversations with AI.{'\n'}No judgment. No embarrassment.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/onboarding/how-it-works')}>
          <Text style={styles.startBtnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth')}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        {/* DEV ONLY — remove before shipping */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.devText}>⚡ Bypass onboarding</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/onboarding/generating')}>
          <Text style={styles.devText}>⚡ Skip to generating</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 44 },
  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 48,
  },
  sub: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 26 },
  footer: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signInText: { textAlign: 'center', fontSize: 14, color: '#6b7280' },
  signInBold: { fontWeight: '700', color: '#2563EB' },
  devText: { textAlign: 'center', fontSize: 13, color: '#d1d5db' },
});
