import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingStep from '../../components/OnboardingStep';

const COMPARISON = [
  { app: 'Grammar apps', what: 'Reading & writing drills', icon: 'book-outline',   muted: true  },
  { app: 'Vocab apps',   what: 'Memorizing word lists',   icon: 'list-outline',    muted: true  },
  { app: 'EnglishNow',   what: 'Real spoken conversations', icon: 'mic-outline',   muted: false },
];

export default function RealReasonScreen() {
  return (
    <OnboardingStep
      step={6} totalSteps={18}
      title="The method matters more than the effort."
      onContinue={() => router.push('/onboarding/language')}
      continueLabel="Makes sense →"
    >
      <Text style={styles.setupText}>
        Most learners work hard. The problem is that{' '}
        <Text style={styles.bold}>nobody gives you a safe place to actually practice speaking</Text>.
      </Text>

      <View style={styles.table}>
        {COMPARISON.map((row, i) => (
          <View key={row.app} style={[styles.row, !row.muted && styles.rowWinner]}>
            <View style={[styles.iconWrap, !row.muted && styles.iconWrapWinner]}>
              <Ionicons name={row.icon as any} size={18} color={row.muted ? '#9CA3AF' : '#2563EB'} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowApp, !row.muted && styles.rowAppWinner]}>{row.app}</Text>
              <Text style={[styles.rowWhat, !row.muted && styles.rowWhatWinner]}>{row.what}</Text>
            </View>
            {row.muted ? (
              <Ionicons name="close-circle" size={20} color="#D1D5DB" />
            ) : (
              <View style={styles.winnerBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.conclusionCard}>
        <Ionicons name="bulb-outline" size={20} color="#2563EB" style={{ marginTop: 1 }} />
        <Text style={styles.conclusionText}>
          You don't get confident speaking English by studying it. You get confident by <Text style={styles.conclusionBold}>speaking it</Text>.
        </Text>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  setupText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  bold: { fontWeight: '700', color: '#111827' },

  table: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rowWinner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapWinner: { backgroundColor: '#DBEAFE' },
  rowText: { flex: 1 },
  rowApp: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 1 },
  rowAppWinner: { color: '#2563EB' },
  rowWhat: { fontSize: 15, fontWeight: '600', color: '#374151' },
  rowWhatWinner: { color: '#111827', fontWeight: '700' },
  winnerBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  conclusionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
  },
  conclusionText: { flex: 1, fontSize: 15, color: '#1D4ED8', lineHeight: 24 },
  conclusionBold: { fontWeight: '800' },
});
