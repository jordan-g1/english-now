import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingStep from '../../components/OnboardingStep';

const STEPS = [
  { emoji: '🎙️', title: 'Press & hold to speak', desc: 'Have a real back-and-forth conversation in English — just like talking to a person.' },
  { emoji: '🤖', title: 'AI responds naturally',  desc: 'Your AI tutor replies in English and keeps the conversation going at your level.' },
  { emoji: '✅', title: 'Get corrections at the end', desc: "See exactly what you said wrong and how to fix it — without interrupting the flow." },
];

export default function HowItWorksScreen() {
  return (
    <OnboardingStep
      step={1} totalSteps={18}
      title="Here's how it works"
      onContinue={() => router.push('/onboarding/not-alone')}
    >
      <View style={styles.cards}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.emoji}>{s.emoji}</Text>
              {i < STEPS.length - 1 && <View style={styles.connector} />}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 0, marginTop: 8 },
  card: { flexDirection: 'row', gap: 16, minHeight: 90 },
  cardLeft: { alignItems: 'center', width: 48 },
  emoji: { fontSize: 30, width: 48, textAlign: 'center' },
  connector: { flex: 1, width: 2, backgroundColor: '#ede9fe', marginTop: 6, marginBottom: -6 },
  cardRight: { flex: 1, paddingBottom: 24 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#6b7280', lineHeight: 21 },
});
