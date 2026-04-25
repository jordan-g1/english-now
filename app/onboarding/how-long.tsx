import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: 'Less than a year', icon: 'leaf-outline' },
  { label: '1–3 years',        icon: 'library-outline' },
  { label: '3+ years',         icon: 'school-outline' },
  { label: 'All my life',      icon: 'globe-outline', subtitle: "It's a second language at home" },
];

export default function HowLongScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={5} totalSteps={18}
      title="How long have you been learning English?"
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ how_long: selected! }); router.push('/onboarding/real-reason'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
