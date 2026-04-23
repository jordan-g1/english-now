import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { setOnboarding } from '../../lib/onboardingStore';

const LANGUAGES = [
  'Spanish', 'Portuguese', 'French', 'German', 'Italian',
  'Russian', 'Mandarin Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Turkish', 'Dutch', 'Polish', 'Swedish',
  'Vietnamese', 'Thai', 'Indonesian', 'Ukrainian', 'Other',
];

export default function LanguageScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(7 / 18) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>What's your native language?</Text>
        <Text style={styles.subtitle}>This helps your tutor understand your background.</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.langRow, selected === lang && styles.langRowSelected]}
            onPress={() => setSelected(lang)}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, selected === lang && styles.langTextSelected]}>{lang}</Text>
            {selected === lang && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={() => { setOnboarding({ language: selected! }); router.push('/onboarding/where-use'); }}
          disabled={!selected}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
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
  titleWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', lineHeight: 37, marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 8 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f7ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langRowSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  langText: { fontSize: 15, fontWeight: '500', color: '#111827' },
  langTextSelected: { color: '#fff', fontWeight: '700' },
  check: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
  continueBtn: { backgroundColor: '#2563EB', paddingVertical: 17, borderRadius: 16, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  continueBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
