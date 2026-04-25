import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import OnboardingStep from '../../components/OnboardingStep';

const LEVEL_COLORS: Record<string, string> = {
  A1: '#22c55e',
  A2: '#3b82f6',
  B1: '#2563EB',
  B2: '#f97316',
  C1: '#ef4444',
  C2: '#111827',
};

export default function LevelResultScreen() {
  const { level, title, summary, strengths, areas } = useLocalSearchParams<{
    level: string;
    title: string;
    summary: string;
    strengths: string;
    areas: string;
  }>();

  const strengthsList: string[] = (() => { try { return JSON.parse(strengths ?? '[]'); } catch { return []; } })();
  const areasList: string[]    = (() => { try { return JSON.parse(areas    ?? '[]'); } catch { return []; } })();
  const color = LEVEL_COLORS[level] ?? '#2563EB';

  return (
    <OnboardingStep
      step={4} totalSteps={18}
      title="Your level"
      onContinue={() => router.push('/onboarding/how-long')}
      continueLabel="Looks right — continue"
      scrollable
    >
      <View style={[styles.levelBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
        <Text style={[styles.levelCode, { color }]}>{level}</Text>
        <Text style={[styles.levelTitle, { color }]}>{title}</Text>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      {strengthsList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>✓ What you do well</Text>
          {strengthsList.map((s, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.rowText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {areasList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>↗ Areas to improve</Text>
          {areasList.map((a, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.rowText}>{a}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableWrongLevel />
    </OnboardingStep>
  );
}

function TouchableWrongLevel() {
  return (
    <View style={styles.wrongWrap}>
      <Text style={styles.wrongText}>Doesn't feel right? </Text>
      <Text style={styles.wrongLink} onPress={() => router.push('/onboarding/level-select')}>
        Select manually
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
  },
  levelCode: { fontSize: 40, fontWeight: '900' },
  levelTitle: { fontSize: 22, fontWeight: '800' },
  summary: { fontSize: 15, color: '#374151', lineHeight: 24 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 7, flexShrink: 0 },
  rowText: { fontSize: 14, color: '#374151', lineHeight: 22, flex: 1 },
  wrongWrap: { flexDirection: 'row', justifyContent: 'center', paddingTop: 4 },
  wrongText: { fontSize: 13, color: '#9ca3af' },
  wrongLink: { fontSize: 13, color: '#2563EB', fontWeight: '600', textDecorationLine: 'underline' },
});
