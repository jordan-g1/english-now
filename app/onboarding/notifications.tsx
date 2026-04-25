import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PERKS = [
  { icon: 'flame-outline',       color: '#F97316', bg: '#FFF7ED', text: 'Daily streak reminders so you never break the chain' },
  { icon: 'trending-up-outline', color: '#2563EB', bg: '#EFF6FF', text: "Weekly progress reports showing how far you've come" },
  { icon: 'chatbubble-outline',  color: '#8B5CF6', bg: '#F5F3FF', text: "Practice nudges when you haven't spoken in a while" },
];

export default function NotificationsScreen() {
  async function allow() {
    try {
      // expo-notifications must be installed: npx expo install expo-notifications
      // and app.json must include the notifications plugin before this will work.
      // Once installed, uncomment the lines below:
      //
      // const { status } = await import('expo-notifications').then(m =>
      //   m.requestPermissionsAsync()
      // );
      // if (status === 'granted') {
      //   await import('expo-notifications').then(m =>
      //     m.setNotificationChannelAsync?.('default', {
      //       name: 'default',
      //       importance: m.AndroidImportance?.MAX,
      //     })
      //   );
      // }
    } catch (_) {}
    router.push('/onboarding/generating');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(16 / 18) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.bellWrap}>
          <Ionicons name="notifications-outline" size={36} color="#2563EB" />
        </View>
        <Text style={styles.title}>Don't break your streak</Text>
        <Text style={styles.subtitle}>
          Users who enable notifications are <Text style={styles.bold}>3x more likely</Text> to stick with their practice.
        </Text>

        <View style={styles.perks}>
          {PERKS.map((p, i) => (
            <View key={i} style={styles.perk}>
              <View style={[styles.perkIconWrap, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon as any} size={20} color={p.color} />
              </View>
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
  progressTrack: { flex: 1, height: 4, backgroundColor: '#EFF6FF', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  bellWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', lineHeight: 37 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 24 },
  bold: { fontWeight: '700', color: '#111827' },
  perks: { gap: 10, marginTop: 4 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14 },
  perkIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perkText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  allowBtn: { backgroundColor: '#2563EB', paddingVertical: 17, borderRadius: 16, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  allowBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { color: '#9ca3af', fontSize: 14 },
});
