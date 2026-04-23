import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: 'Work & career',      icon: '💼', subtitle: 'Interviews, meetings, presentations' },
  { label: 'Travel',             icon: '✈️', subtitle: 'Navigate airports, hotels, restaurants' },
  { label: 'Social confidence',  icon: '💬', subtitle: 'Make friends, small talk, dating' },
  { label: 'Exam prep',          icon: '📝', subtitle: 'IELTS, TOEFL, Cambridge' },
];

export default function GoalScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={3} totalSteps={18}
      title="What's your main goal?"
      subtitle="We'll tailor your practice sessions around this."
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ goal: selected! }); router.push('/onboarding/level'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
