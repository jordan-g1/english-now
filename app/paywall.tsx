import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases';
import { getOnboarding } from '../lib/onboardingStore';

const LEVEL_LABEL: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
  B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery',
};
const NEXT_LEVEL: Record<string, string> = {
  A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'C2',
};
const WEEKS: Record<string, Record<string, number>> = {
  A1: { '5 minutes': 5, '10 minutes': 3, '15+ minutes': 2 },
  A2: { '5 minutes': 7, '10 minutes': 5, '15+ minutes': 3 },
  B1: { '5 minutes': 9, '10 minutes': 6, '15+ minutes': 4 },
  B2: { '5 minutes': 11, '10 minutes': 8, '15+ minutes': 5 },
  C1: { '5 minutes': 14, '10 minutes': 10, '15+ minutes': 7 },
  C2: { '5 minutes': 12, '10 minutes': 8, '15+ minutes': 6 },
};

// Intentionally different from the testimonials shown on plan-ready
// plan-ready shows: Work&career→Carlos, Travel→Yuki, Social→Fatima, Exam→Priya
const PAYWALL_TESTIMONIAL: Record<string, { text: string; author: string }> = {
  'Work & career':    { text: '"My confidence in English meetings went from zero to actually enjoying them. Worth every penny."', author: 'Mei L., China · B1 → B2' },
  'Travel':           { text: '"I used to travel with a phrasebook. Now I just talk to people. It changed everything."', author: 'Fatima A., Morocco · A2 → B1' },
  'Social confidence':{ text: '"Three weeks in and I stopped dreading conversations. Now I actually look forward to them."', author: 'Ahmed K., Egypt · B1 → B2' },
  'Exam prep':        { text: '"Better speaking practice than any course I tried. Passed IELTS on my first attempt."', author: 'Yuki T., Japan · B2 → C1' },
};
const DEFAULT_PAYWALL_TESTIMONIAL = {
  text: '"I\'ve tried Duolingo, Babbel, tutors. Nothing worked until I started actually speaking every day."',
  author: 'Priya S., India · B1 → B2',
};

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);

  const { level = 'B1', goal = 'Work & career', commitment = '10 minutes' } = getOnboarding();
  const currentLevel = Object.keys(LEVEL_LABEL).includes(level) ? level : 'B1';
  const targetLevel = NEXT_LEVEL[currentLevel] ?? 'B2';
  const weeks = WEEKS[currentLevel]?.[commitment] ?? 6;
  const testimonial = PAYWALL_TESTIMONIAL[goal] ?? DEFAULT_PAYWALL_TESTIMONIAL;

  useEffect(() => {
    getOfferings().then(setOfferings).catch(() => {});
  }, []);

  const monthlyPkg = offerings?.availablePackages?.find((p: any) => p.packageType === 'MONTHLY');
  const yearlyPkg  = offerings?.availablePackages?.find((p: any) => p.packageType === 'ANNUAL');

  const monthlyPrice    = monthlyPkg?.product.priceString ?? '$19.99';
  const yearlyPrice     = yearlyPkg?.product.priceString  ?? '$119.99';
  const yearlyPerMonth  = yearlyPkg
    ? `$${(yearlyPkg.product.price / 12).toFixed(2)}/mo`
    : '$10.00/mo';

  async function handlePurchase() {
    if (!offerings) {
      Alert.alert('Not available', 'Could not load subscription options. Please check your connection and try again.');
      return;
    }
    setLoading(true);
    try {
      const pkg = selected === 'monthly' ? monthlyPkg : yearlyPkg;
      if (!pkg) throw new Error('Package not found');
      await purchasePackage(pkg);
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

  const ctaPrice = selected === 'yearly' ? `${yearlyPrice} / year` : `${monthlyPrice} / month`;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>

        {/* Social proof */}
        <View style={styles.socialProof}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.socialText}>4.8 · Loved by English Learners</Text>
        </View>

        {/* Personalized headline */}
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>
            Unlock your{'\n'}{currentLevel} → {targetLevel} plan.
          </Text>
          <Text style={styles.subheadline}>
            {weeks} weeks to {LEVEL_LABEL[targetLevel].toLowerCase()}
            {goal ? ` · built for ${goal.toLowerCase()}` : ''}.
          </Text>
        </View>

        {/* Savings banner */}
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsBannerEmoji}>🎁</Text>
          <Text style={styles.savingsBannerText}>
            Limited offer · <Text style={styles.savingsBannerBold}>Save 50%</Text> on your first year
          </Text>
        </View>

        {/* Testimonial */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{testimonial.text}</Text>
          <Text style={styles.quoteAuthor}>{testimonial.author}</Text>
        </View>

      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>

        {/* Plan cards */}
        <View style={styles.plans}>

          {/* Yearly — default, most popular */}
          <TouchableOpacity
            style={[styles.plan, selected === 'yearly' && styles.planSelected]}
            onPress={() => setSelected('yearly')}
            activeOpacity={0.85}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>MOST POPULAR</Text>
            </View>
            <Text style={[styles.planLabel, selected === 'yearly' && styles.planLabelSelected]}>Yearly</Text>
            <Text style={[styles.planPrice, selected === 'yearly' && styles.planPriceSelected]}>{yearlyPrice}</Text>
            <Text style={[styles.planPer, selected === 'yearly' && styles.planPerSelected]}>{yearlyPerMonth} · Save 50%</Text>
            {selected === 'yearly' && <View style={styles.selectedIndicator} />}
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.plan, selected === 'monthly' && styles.planSelected]}
            onPress={() => setSelected('monthly')}
            activeOpacity={0.85}
          >
            <View style={[styles.planBadge, styles.planBadgeMuted]}>
              <Text style={[styles.planBadgeText, styles.planBadgeTextMuted]}>MONTHLY</Text>
            </View>
            <Text style={[styles.planLabel, selected === 'monthly' && styles.planLabelSelected]}>Monthly</Text>
            <Text style={[styles.planPrice, selected === 'monthly' && styles.planPriceSelected]}>{monthlyPrice}</Text>
            <Text style={[styles.planPer, selected === 'monthly' && styles.planPerSelected]}>per month</Text>
            {selected === 'monthly' && <View style={styles.selectedIndicator} />}
          </TouchableOpacity>

        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handlePurchase} disabled={loading} activeOpacity={0.9}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaBtnText}>Unlock my plan  →</Text>
              <Text style={styles.ctaBtnSub}>{ctaPrice} · Cancel anytime</Text>
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

  // Hero
  hero: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 28,
    gap: 20,
  },
  socialProof: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { color: '#FBBF24', fontSize: 14, letterSpacing: 1 },
  socialText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },

  headlineBlock: { gap: 8 },
  headline: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
  },

  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    alignSelf: 'flex-start',
  },
  savingsBannerEmoji: { fontSize: 16 },
  savingsBannerText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  savingsBannerBold: { color: '#FCD34D', fontWeight: '800' },

  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#3B82F6',
  },
  quoteText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  quoteAuthor: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },

  // Sheet
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
    overflow: 'hidden',
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
  planBadgeMuted: { backgroundColor: '#E5E7EB' },
  planBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
  planBadgeTextMuted: { color: '#9CA3AF' },

  planLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  planLabelSelected: { color: '#1E40AF' },
  planPrice: { fontSize: 22, fontWeight: '800', color: '#374151' },
  planPriceSelected: { color: '#111827' },
  planPer: { fontSize: 11, color: '#6B7280' },
  planPerSelected: { color: '#16A34A', fontWeight: '700' },

  selectedIndicator: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },

  // CTA
  ctaBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  ctaBtnSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },

  // Legal
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: { color: '#9CA3AF', fontSize: 12 },
  legalDot: { color: '#D1D5DB', fontSize: 12 },
});
