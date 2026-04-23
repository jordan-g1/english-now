import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingStep from '../../components/OnboardingStep';

export default function NotAloneScreen() {
  return (
    <OnboardingStep
      step={2} totalSteps={18}
      title="You're not alone."
      onContinue={() => router.push('/onboarding/goal')}
      continueLabel="That's me →"
    >
      <View style={styles.statBlock}>
        <Text style={styles.bigStat}>95%</Text>
        <Text style={styles.statDesc}>of English learners never become fluent</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Not because they aren't smart. Not because they don't study hard enough.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Because they spend years on grammar and vocabulary — and almost zero time actually <Text style={styles.bold}>speaking</Text>.
        </Text>
      </View>

      <View style={[styles.card, styles.cardHighlight]}>
        <Text style={styles.cardHighlightText}>
          Speaking is a skill. Like any skill, you only get better by doing it. 🎯
        </Text>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  statBlock: { alignItems: 'center', paddingVertical: 16 },
  bigStat: { fontSize: 72, fontWeight: '900', color: '#2563EB', lineHeight: 80 },
  statDesc: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  card: {
    backgroundColor: '#f8f7ff',
    borderRadius: 14,
    padding: 16,
  },
  cardText: { fontSize: 15, color: '#374151', lineHeight: 24 },
  bold: { fontWeight: '700', color: '#111827' },
  cardHighlight: { backgroundColor: '#EFF6FF' },
  cardHighlightText: { fontSize: 15, color: '#2563EB', lineHeight: 24, fontWeight: '600' },
});
