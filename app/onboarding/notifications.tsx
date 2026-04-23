import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const PERKS = [
  { icon: '🔥', text: 'Daily streak reminders so you never break the chain' },
  { icon: '📈', text: 'Weekly progress reports showing how far you\'ve come' },
  { icon: '💬', text: 'Practice nudges when you haven\'t spoken in a while' },
];

export default function NotificationsScreen() {
  function allow() {
    // TODO: expo-notifications permission request
    router.push('/onboarding/generating');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(16 / 18) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.bell}>🔔</Text>
        <Text style={styles.title}>Don't break your streak</Text>
        <Text style={styles.subtitle}>
          Users who enable notifications are <Text style={styles.bold}>3x more likely</Text> to stick with their practice.
        </Text>

        <View style={styles.perks}>
          {PERKS.map((p, i) => (
            <View key={i} style={styles.perk}>
              <Text style={styles.perkIcon}>{p.icon}</Text>
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.allowBtn} onPress={allow}>
          <Text style={styles.allowBtnText}>Allow notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/onboarding/generating')}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: '#111827' },
  progressTrack: { flex: 1, height: 4, backgroundColor: '#EFF6FF', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  bell: { fontSize: 52 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', lineHeight: 37 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 24 },
  bold: { fontWeight: '700', color: '#111827' },
  perks: { gap: 10, marginTop: 4 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8f7ff', borderRadius: 12, padding: 14 },
  perkIcon: { fontSize: 22 },
  perkText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  allowBtn: { backgroundColor: '#2563EB', paddingVertical: 17, borderRadius: 16, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  allowBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { color: '#9ca3af', fontSize: 14 },
});
