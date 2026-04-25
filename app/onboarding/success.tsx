import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: 'Have a conversation without freezing', icon: 'chatbubbles-outline', subtitle: 'Speak naturally when the moment comes' },
  { label: 'Get a promotion or new job',           icon: 'briefcase-outline',  subtitle: 'English is holding my career back' },
  { label: 'Travel and feel independent',          icon: 'globe-outline',      subtitle: "Handle anything that comes up abroad" },
  { label: 'Pass an English exam',                 icon: 'trophy-outline',     subtitle: 'IELTS, TOEFL, or similar' },
];

export default function SuccessScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={13} totalSteps={18}
      title="What does success look like for you?"
      subtitle="Picture it — what would change if your English was fluent?"
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ success_vision: selected! }); router.push('/onboarding/proof'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
