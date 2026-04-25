import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingStep from '../../components/OnboardingStep';
import { getOnboarding } from '../../lib/onboardingStore';

const MILESTONES: Record<string, { week1: string; week2: string; month1: string }> = {
  '5 minutes': {
    week1:  'You complete your first real English conversation',
    week2:  'You notice yourself hesitating less',
    month1: 'Speaking feels noticeably easier and more natural',
  },
  '10 minutes': {
    week1:  'You complete 2–3 full conversations',
    week2:  'Your vocabulary in context starts to click',
    month1: 'You handle most everyday situations confidently',
  },
  '15+ minutes': {
    week1:  'You complete 3–5 conversations across different scenarios',
    week2:  'You start thinking in English instead of translating',
    month1: "You're having fluent conversations — people notice the difference",
  },
};

export default function YourResultsScreen() {
  const { commitment, level } = getOnboarding();
  const milestones = MILESTONES[commitment ?? '10 minutes'] ?? MILESTONES['10 minutes'];

  return (
    <OnboardingStep
      step={15} totalSteps={18}
      title="Here's what to expect."
      subtitle={`At ${commitment ?? '10 minutes'} a day, ${level?.toLowerCase() ?? 'intermediate'} level:`}
      onContinue={() => router.push('/onboarding/generating')}
      continueLabel="Let's do this →"
    >
      <Milestone week="After week 1" text={milestones.week1} color="#2563EB" />
      <Milestone week="After week 2" text={milestones.week2} color="#8b5cf6" />
      <Milestone week="After 1 month" text={milestones.month1} color="#a78bfa" last />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          These results are based on users who practiced consistently at your level.
        </Text>
      </View>
    </OnboardingStep>
  );
}

function Milestone({ week, text, color, last }: { week: string; text: string; color: string; last?: boolean }) {
  return (
    <View style={styles.milestone}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        {!last && <View style={[styles.line, { backgroundColor: color + '40' }]} />}
      </View>
      <View style={styles.right}>
        <Text style={[styles.week, { color }]}>{week}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  milestone: { flexDirection: 'row', gap: 14, minHeight: 72 },
  left: { alignItems: 'center', width: 20 },
  dot: { width: 16, height: 16, borderRadius: 8, marginTop: 3 },
  line: { flex: 1, width: 2, marginTop: 4, marginBottom: -8 },
  right: { flex: 1, paddingBottom: 16 },
  week: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  text: { fontSize: 15, color: '#374151', lineHeight: 22 },
  footer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14 },
  footerText: { fontSize: 13, color: '#2563EB', textAlign: 'center', lineHeight: 20 },
});
