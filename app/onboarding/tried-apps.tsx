import { useState } from 'react';
import { router } from 'expo-router';
import OnboardingStep, { OptionCard } from '../../components/OnboardingStep';
import { setOnboarding } from '../../lib/onboardingStore';

const OPTIONS = [
  { label: "Yes — but they didn't stick",  icon: 'close-circle-outline',   subtitle: 'I tried but stopped using them' },
  { label: 'Yes — and I still use them',   icon: 'phone-portrait-outline',  subtitle: "I'm supplementing with EnglishNow" },
  { label: "No — this is my first",        icon: 'star-outline',            subtitle: "I haven't tried anything yet" },
];

export default function TriedAppsScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingStep
      step={10} totalSteps={18}
      title="Have you tried other language apps?"
      subtitle="No wrong answers — we just want to know your starting point."
      canContinue={!!selected}
      onContinue={() => { setOnboarding({ tried_apps: selected! }); router.push('/onboarding/different'); }}
    >
      {OPTIONS.map((o) => (
        <OptionCard key={o.label} label={o.label} icon={o.icon} subtitle={o.subtitle}
          selected={selected === o.label} onPress={() => setSelected(o.label)} />
      ))}
    </OnboardingStep>
  );
}
