import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { initializePurchases, checkSubscription } from '../lib/purchases';

export default function RootLayout() {
  useEffect(() => {
    checkAndRoute();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/onboarding');
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAndRoute() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/onboarding');
      return;
    }

    initializePurchases(session.user.id);

    const isSubscribed = await checkSubscription();
    if (isSubscribed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/paywall');
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="auth" />
      <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
      <Stack.Screen name="pre-session" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="conversation" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="session-summary" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
