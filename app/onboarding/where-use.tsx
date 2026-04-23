import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: 'At work',                icon: '🏢', subtitle: 'Meetings, emails, colleagues' },
  { label: 'Traveling',              icon: '✈️', subtitle: 'Airports, hotels, new places' },
  { label: 'Online',                 icon: '💻', subtitle: 'Social media, gaming, forums' },
  { label: 'With friends or family', icon: '👨‍👩‍👧', subtitle: 'People close to me speak English' },
];

export default function WhereUseScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={8} totalSteps={18}
      title="Where do you use English most?"
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ where_use: selected! }); router.push('/onboarding/challenge'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
