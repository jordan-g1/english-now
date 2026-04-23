import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingStep from '../../components/OnboardingStep';

const COMPARISON = [
  { app: 'Grammar apps', what: 'Reading & writing drills', icon: '📖' },
  { app: 'Vocab apps',   what: 'Memorizing word lists',   icon: '🗂️' },
  { app: 'EnglishNow',   what: 'Real spoken conversations', icon: '🗣️', highlight: true },
];

export default function RealReasonScreen() {
  return (
    <OnboardingStep
      step={6} totalSteps={18}
      title="The method matters more than the effort."
      onContinue={() => router.push('/onboarding/language')}
      continueLabel="Makes sense →"
    >
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Most learners work hard. The problem is that <Text style={styles.bold}>nobody gives you a safe place to actually practice speaking</Text>.
        </Text>
      </View>

      <View style={styles.table}>
        {COMPARISON.map((row) => (
          <View key={row.app} style={[styles.row, row.highlight && styles.rowHighlight]}>
            <Text style={styles.rowIcon}>{row.icon}</Text>
            <View style={styles.rowText}>
              <Text style={[styles.rowApp, row.highlight && styles.rowAppHighlight]}>{row.app}</Text>
              <Text style={[styles.rowWhat, row.highlight && styles.rowWhatHighlight]}>{row.what}</Text>
            </View>
            {row.highlight && <Text style={styles.checkmark}>✓</Text>}
          </View>
        ))}
      </View>

      <View style={[styles.card, styles.cardPurple]}>
        <Text style={styles.cardPurpleText}>
          You don't get confident speaking English by studying it. You get confident by speaking it. 💬
        </Text>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f8f7ff', borderRadius: 14, padding: 16 },
  cardText: { fontSize: 15, color: '#374151', lineHeight: 24 },
  bold: { fontWeight: '700', color: '#111827' },
  table: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  rowHighlight: { backgroundColor: '#2563EB' },
  rowIcon: { fontSize: 22 },
  rowText: { flex: 1 },
  rowApp: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  rowAppHighlight: { color: '#BFDBFE' },
  rowWhat: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 1 },
  rowWhatHighlight: { color: '#fff' },
  checkmark: { fontSize: 18, color: '#fff', fontWeight: '700' },
  cardPurple: { backgroundColor: '#EFF6FF' },
  cardPurpleText: { fontSize: 15, color: '#2563EB', lineHeight: 24, fontWeight: '600' },
});
