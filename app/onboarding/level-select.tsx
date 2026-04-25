import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const CEFR_LEVELS = [
  { label: 'A1', name: 'Beginner',           subtitle: 'I know a few basic words and phrases' },
  { label: 'A2', name: 'Elementary',         subtitle: 'I can handle simple, familiar topics' },
  { label: 'B1', name: 'Intermediate',       subtitle: 'I can get by in most everyday situations' },
  { label: 'B2', name: 'Upper Intermediate', subtitle: 'I can speak fluently on most topics' },
];

export default function LevelSelectScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={4} totalSteps={18}
      title="Select your level"
      subtitle="Choose the level that feels closest to where you are."
      canContinue={!!selected}
      onContinue={() => {
        setOnboarding({ level: selected! });
        router.push('/onboarding/how-long');
      }}
    >
      {CEFR_LEVELS.map((o) => (
        <OptionCard
          key={o.label}
          label={`${o.label} — ${o.name}`}
          subtitle={o.subtitle}
          selected={selected === o.label}
          onPress={() => setSelected(o.label)}
        />
      ))}
    </OnboardingStep>
  );
}
