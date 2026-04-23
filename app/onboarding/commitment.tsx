import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: '5 minutes',   icon: '⚡', subtitle: 'Quick daily practice — better than nothing' },
  { label: '10 minutes',  icon: '🔥', subtitle: 'The sweet spot for steady improvement' },
  { label: '15+ minutes', icon: '🏆', subtitle: 'Serious about getting fluent fast' },
];

export default function CommitmentScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={12} totalSteps={18}
      title="How much can you practice daily?"
      subtitle="Even 5 minutes a day makes a real difference."
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ commitment: selected! }); router.push('/onboarding/success'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
