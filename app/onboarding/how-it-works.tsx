import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingStep from '../../components/OnboardingStep';

const STEPS = [
  { icon: 'mic-outline',      color: '#2563EB', bg: '#EFF6FF', title: 'Press & hold to speak', desc: 'Have a real back-and-forth conversation in English — just like talking to a person.' },
  { icon: 'chatbubble-outline', color: '#8B5CF6', bg: '#F5F3FF', title: 'AI responds naturally',  desc: 'Your AI tutor replies in English and keeps the conversation going at your level.' },
  { icon: 'checkmark-circle-outline', color: '#16A34A', bg: '#F0FDF4', title: 'Get corrections at the end', desc: 'See exactly what you said wrong and how to fix it — without interrupting the flow.' },
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
              <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
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
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: { flex: 1, width: 2, backgroundColor: '#F3F4F6', marginTop: 4, marginBottom: -4 },
  cardRight: { flex: 1, paddingBottom: 24, paddingTop: 4 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#6B7280', lineHeight: 21 },
});
