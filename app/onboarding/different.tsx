import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingStep from '../../components/OnboardingStep';

const POINTS = [
  { icon: 'mic-outline',             color: '#2563EB', bg: '#EFF6FF', title: 'You speak, not tap',        desc: 'Real voice conversations — not fill-in-the-blank exercises.' },
  { icon: 'chatbubble-ellipses-outline', color: '#8B5CF6', bg: '#F5F3FF', title: 'AI that actually listens',  desc: 'Responds naturally to what you say. No scripted paths.' },
  { icon: 'shield-checkmark-outline', color: '#16A34A', bg: '#F0FDF4', title: 'Corrections without shame', desc: 'Mistakes are shown at the end — not mid-sentence. You stay in flow.' },
  { icon: 'trending-up-outline',      color: '#F97316', bg: '#FFF7ED', title: 'Gets harder as you grow',   desc: 'Your tutor adapts to your level automatically.' },
];

export default function DifferentScreen() {
  return (
    <OnboardingStep
      step={11} totalSteps={18}
      title="This is different."
      subtitle="Here's what makes EnglishNow actually work."
      onContinue={() => router.push('/onboarding/commitment')}
      continueLabel="I'm in →"
    >
      {POINTS.map((p) => (
        <View key={p.title} style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: p.bg }]}>
            <Ionicons name={p.icon as any} size={22} color={p.color} />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.desc}>{p.desc}</Text>
          </View>
        </View>
      ))}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: { flex: 1, paddingTop: 2 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
});
