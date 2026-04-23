import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: 'Speaking confidence',    icon: '😰', subtitle: "I freeze up when I need to speak" },
  { label: 'Finding the right words', icon: '🔍', subtitle: "I know what I want to say but can't express it" },
  { label: 'Grammar mistakes',        icon: '📖', subtitle: 'I make errors that embarrass me' },
  { label: 'Pronunciation',           icon: '👄', subtitle: "People don't understand me clearly" },
];

export default function ChallengeScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={9} totalSteps={18}
      title="What holds you back most?"
      subtitle="Be honest — this shapes how your tutor helps you."
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ challenge: selected! }); router.push('/onboarding/tried-apps'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
