import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingStep from '../../components/OnboardingStep';

export default function ProofScreen() {
  return (
    <OnboardingStep
      step={14} totalSteps={18}
      title="People are loving it"
      subtitle="Join thousands already practicing with EnglishNow."
      onContinue={() => router.push('/onboarding/your-results')}
    >
      <View style={styles.reviewCard}>
        <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
        <Text style={styles.reviewText}>
          "I used to be terrified of speaking English at work. After two weeks with EnglishNow I actually volunteered to lead a meeting. My colleagues were shocked."
        </Text>
        <Text style={styles.reviewer}>— Maria S., Brazil</Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>87%</Text>
            <Text style={styles.statLabel}>feel more confident{'\n'}after 2 weeks</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>40+</Text>
            <Text style={styles.statLabel}>native languages{'\n'}supported</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>real-life{'\n'}scenarios</Text>
          </View>
        </View>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: '#f8f7ff',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  stars: { fontSize: 18 },
  reviewText: { fontSize: 15, color: '#374151', lineHeight: 24, fontStyle: 'italic' },
  reviewer: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  statCard: { backgroundColor: '#f8f7ff', borderRadius: 16, padding: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 26, fontWeight: '800', color: '#2563EB' },
  statLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
  divider: { width: 1, height: 40, backgroundColor: '#e5e7eb' },
});
