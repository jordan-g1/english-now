import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Linking, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases';

const { height } = Dimensions.get('window');

const BULLETS = [
  'Real conversations, not drills',
  'Grammar corrections after every session',
  'Adapts to your level automatically',
];

const QUOTE = {
  text: '"I went from freezing up in meetings to actually leading them. Two weeks in."',
  author: 'Carlos M., Brazil · B1 → B2',
};

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);

  useEffect(() => {
    getOfferings().then(setOfferings).catch(() => {});
  }, []);

  async function handlePurchase() {
    setLoading(true);
    try {
      if (offerings) {
        const pkg = offerings.availablePackages.find((p: any) =>
          selected === 'monthly' ? p.packageType === 'MONTHLY' : p.packageType === 'ANNUAL'
        );
        if (!pkg) throw new Error('Package not found');
        await purchasePackage(pkg);
      }
      router.replace('/auth');
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const info = await restorePurchases();
      if (typeof info.entitlements.active['premium'] !== 'undefined') {
        router.replace('/auth');
      } else {
        Alert.alert('No subscription found', 'No active subscription was found for this account.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not restore purchases.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <View style={styles.socialProof}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.socialText}>50,000+ learners improving daily</Text>
        </View>

        <View>
          <Text style={styles.headline}>Choose your{'\n'}plan.</Text>
          <Text style={styles.subheadline}>
            Start speaking better English from your very first session.
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{QUOTE.text}</Text>
          <Text style={styles.quoteAuthor}>{QUOTE.author}</Text>
        </View>

        <View style={styles.bullets}>
          {BULLETS.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Plan toggle */}
        <View style={styles.plans}>
          <TouchableOpacity
            style={[styles.plan, selected === 'monthly' && styles.planSelected]}
            onPress={() => setSelected('monthly')}
            activeOpacity={0.85}
          >
            {selected === 'monthly' && <View style={styles.selectedDot} />}
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>MOST POPULAR</Text>
            </View>
            <Text style={[styles.planLabel, selected === 'monthly' && styles.planLabelSelected]}>Monthly</Text>
            <Text style={[styles.planPrice, selected === 'monthly' && styles.planPriceSelected]}>$19.95</Text>
            <Text style={[styles.planPer, selected === 'monthly' && styles.planPerSelected]}>per month · 50% off</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.plan, selected === 'yearly' && styles.planSelected]}
            onPress={() => setSelected('yearly')}
            activeOpacity={0.85}
          >
            {selected === 'yearly' && <View style={styles.selectedDot} />}
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>BEST VALUE</Text>
            </View>
            <Text style={[styles.planLabel, selected === 'yearly' && styles.planLabelSelected]}>Yearly</Text>
            <Text style={[styles.planPrice, selected === 'yearly' && styles.planPriceSelected]}>$119.95</Text>
            <Text style={[styles.planPer, selected === 'yearly' && styles.planPerSelected]}>$10.00 / mo · 75% off</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handlePurchase} disabled={loading} activeOpacity={0.9}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaBtnText}>
                {selected === 'yearly' ? 'Start for $119.95 / year' : 'Start for $19.95 / month'}
              </Text>
              <Text style={styles.ctaBtnSub}>Cancel anytime in the App Store</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Restore + legal */}
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={handleRestore} disabled={loading}>
            <Text style={styles.legalLink}>Restore</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => router.push('/auth')} disabled={loading}>
            <Text style={styles.legalLink}>Sign in</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://jordan-g1.github.io/english-now/terms-and-conditions.html')}>
            <Text style={styles.legalLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://jordan-g1.github.io/english-now/privacy-policy.html')}>
            <Text style={styles.legalLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },

  hero: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 28,
    gap: 24,
  },
  socialProof: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { color: '#FBBF24', fontSize: 14, letterSpacing: 1 },
  socialText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500' },
  headline: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 22,
    marginTop: 10,
  },
  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#3B82F6',
  },
  quoteText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  quoteAuthor: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  bullets: { gap: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 12,
  },

  plans: { flexDirection: 'row', gap: 10 },
  plan: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 2,
  },
  planSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  planBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  planBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
  planLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  planLabelSelected: { color: '#1E40AF' },
  planPrice: { fontSize: 22, fontWeight: '800', color: '#9CA3AF' },
  planPriceSelected: { color: '#111827' },
  planPer: { fontSize: 11, color: '#9CA3AF' },
  planPerSelected: { color: '#6B7280' },
  selectedDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },

  ctaBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ctaBtnSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },

  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: { color: '#9CA3AF', fontSize: 12 },
  legalDot: { color: '#D1D5DB', fontSize: 12 },
});
