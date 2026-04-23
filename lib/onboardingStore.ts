export type OnboardingData = {
  goal?: string;
  level?: string;
  language?: string;
  how_long?: string;
  where_use?: string;
  challenge?: string;
  tried_apps?: string;
  commitment?: string;
  success_vision?: string;
};

const store: OnboardingData = {};

export function setOnboarding(data: Partial<OnboardingData>) {
  Object.assign(store, data);
}

export function getOnboarding(): OnboardingData {
  return store;
}
