import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

export function initializePurchases(userId?: string | null) {
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  Purchases.configure({
    apiKey: RC_API_KEY_IOS,
    appUserID: userId ?? null,
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: any) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases() {
  return await Purchases.restorePurchases();
}

export async function checkSubscription(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active['premium'] !== 'undefined';
  } catch {
    return false;
  }
}
