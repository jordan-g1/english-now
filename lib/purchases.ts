// RevenueCat is mocked for Expo Go development.
// Replace with real implementation when doing a dev build.
// TODO: swap mock for real when dev account + provisioning is ready

export const RC_API_KEY = 'appl_YOUR_REVENUECAT_API_KEY';

export function initializePurchases(userId?: string) {
  console.log('RevenueCat mock: initializePurchases', userId);
}

export async function getOfferings() {
  return null;
}

export async function purchasePackage(_pkg: any) {
  return {};
}

export async function restorePurchases() {
  return { entitlements: { active: {} } };
}

export async function checkSubscription(): Promise<boolean> {
  // Set to true to bypass paywall during development
  return true;
}
