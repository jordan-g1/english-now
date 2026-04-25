import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getOnboarding } from '../../lib/onboardingStore';

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
const CHALLENGE_INSIGHT: Record<string, { text: string; emoji: string; color: string; bg: string }> = {
  'Speaking confidence':     { text: 'Most users with this challenge feel noticeably less anxious after just 3–5 sessions.', emoji: '💪', color: '#7C3AED', bg: '#F5F3FF' },
  'Finding the right words': { text: "Context-based practice (not word lists) is the fastest way to fix this. That's exactly how EnglishNow works.", emoji: '🔑', color: '#D97706', bg: '#FFFBEB' },
  'Grammar mistakes':        { text: 'Corrections after each session mean you learn from mistakes without losing your flow.', emoji: '✏️', color: '#0891B2', bg: '#ECFEFF' },
  'Pronunciation':           { text: 'Speaking out loud every single day is the most effective pronunciation exercise there is.', emoji: '🎙️', color: '#16A34A', bg: '#F0FDF4' },
};
const GOAL_TESTIMONIAL: Record<string, { quote: string; name: string; detail: string }> = {
  'Work & career':    { quote: "I went from dreading English meetings to actually leading them. Three weeks in, my manager noticed the difference.", name: 'Carlos M.', detail: 'Brazil · B1 → B2' },
  'Travel':           { quote: "My last trip was completely different. I could handle everything myself — hotels, restaurants, getting lost. No panic.", name: 'Yuki T.', detail: 'Japan · A2 → B1' },
  'Social confidence':{ quote: "I stopped avoiding conversations with native speakers. Now I actually look forward to them.", name: 'Fatima A.', detail: 'Morocco · B1 → B2' },
  'Exam prep':        { quote: "The speaking practice here is better than any exam prep course I've tried. I passed IELTS on my first attempt.", name: 'Priya S.', detail: 'India · B2 → C1' },
};
const DEFAULT_TESTIMONIAL = { quote: "I've tried every app. EnglishNow is the only one where I'm actually speaking, not just tapping buttons.", name: 'Ahmed K.', detail: 'Egypt · B1 → B2' };
const GOAL_SCENARIOS: Record<string, { label: string; emoji: string }[]> = {
  'Work & career':    [{ label: 'Job Interview', emoji: '💼' }, { label: 'Small Talk', emoji: '☀️' }, { label: 'Open Chat', emoji: '💬' }],
  'Travel':           [{ label: 'Ordering Food', emoji: '🍽️' }, { label: 'Doctor Visit', emoji: '🏥' }, { label: 'Shopping', emoji: '🛍️' }],
  'Social confidence':[{ label: 'Small Talk', emoji: '☀️' }, { label: 'Open Chat', emoji: '💬' }, { label: 'Ordering Food', emoji: '🍽️' }],
  'Exam prep':        [{ label: 'Open Chat', emoji: '💬' }, { label: 'Job Interview', emoji: '💼' }, { label: 'Small Talk', emoji: '☀️' }],
};
const DEFAULT_SCENARIOS = [
  { label: 'Open Chat', emoji: '💬' },
  { label: 'Small Talk', emoji: '☀️' },
  { label: 'Job Interview', emoji: '💼' },
];
const FEATURES = [
  { icon: 'mic-outline',               label: 'Real voice conversations with your AI tutor' },
  { icon: 'checkmark-circle-outline',  label: 'Personalised corrections after every session' },
  { icon: 'trending-up-outline',       label: 'Difficulty adapts to your level automatically' },
  { icon: 'flame-outline',             label: 'Streak tracking to keep you consistent' },
  { icon: 'globe-outline',             label: 'Tuned to your native language & common mistakes' },
  { icon: 'time-outline',              label: 'Sessions that fit around your schedule' },
];
const TIMELINE_STEPS = (currentLevel: string, targetLevel: string, week2: number, weeks: number) => [
  { emoji: '📍', color: '#9CA3AF', title: `Now — ${currentLevel}, ${LEVEL_LABEL[currentLevel]}`, sub: 'Your starting point.' },
  { emoji: '🎙️', color: '#3B82F6', title: 'Week 1 — First real sessions', sub: 'Build the habit. Speak from day one.' },
  { emoji: '📈', color: '#8B5CF6', title: `Week ${week2} — Fluency building`, sub: 'Vocabulary clicks. Hesitation drops.' },
  { emoji: '🏆', color: '#16A34A', title: `~${weeks} weeks — Reach ${targetLevel}`, sub: `${LEVEL_LABEL[targetLevel]}. Confident in real situations.`, last: true },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function PlanReadyScreen() {
  const { level = 'B1', goal = 'Work & career', commitment = '10 minutes', language, challenge } = getOnboarding();
  const currentLevel = Object.keys(LEVEL_LABEL).includes(level) ? level : 'B1';
  const targetLevel = NEXT_LEVEL[currentLevel] ?? 'B2';
  const weeks = WEEKS[currentLevel]?.[commitment] ?? 6;
  const testimonial = GOAL_TESTIMONIAL[goal] ?? DEFAULT_TESTIMONIAL;
  const scenarios = GOAL_SCENARIOS[goal] ?? DEFAULT_SCENARIOS;
  const insight = challenge ? CHALLENGE_INSIGHT[challenge] : null;
  const week2 = Math.max(3, Math.round(weeks * 0.5));
  const timelineSteps = TIMELINE_STEPS(currentLevel, targetLevel, week2, weeks);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeEmoji}>✨</Text>
            <Text style={styles.heroBadgeText}>Your plan is ready</Text>
          </View>

          <Text style={styles.heroEmoji}>🎉</Text>

          <Text style={styles.heroTitle}>
            {currentLevel} → {targetLevel}
          </Text>
          <Text style={styles.heroSub}>
            Built for <Text style={styles.heroSubBold}>{goal.toLowerCase()}</Text>
            {language ? `, tuned for ${language} speakers` : ''}.
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatEmoji}>📅</Text>
              <Text style={styles.heroStatNum}>{weeks}</Text>
              <Text style={styles.heroStatLabel}>weeks to {targetLevel}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatEmoji}>⏱️</Text>
              <Text style={styles.heroStatNum}>{commitment.replace(' minutes', 'm')}</Text>
              <Text style={styles.heroStatLabel}>per day</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatEmoji}>🎯</Text>
              <Text style={styles.heroStatNum}>{scenarios.length}</Text>
              <Text style={styles.heroStatLabel}>scenarios</Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Insight callout */}
          {insight && (
            <View style={[styles.insightCard, { backgroundColor: insight.bg, borderColor: insight.color + '30' }]}>
              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
              <Text style={[styles.insightText, { color: insight.color }]}>{insight.text}</Text>
            </View>
          )}

          {/* Roadmap */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Your roadmap</Text>
            <View style={styles.timeline}>
              {timelineSteps.map((step, i) => (
                <TimelineStep
                  key={i}
                  emoji={step.emoji}
                  color={step.color}
                  title={step.title}
                  sub={step.sub}
                  last={step.last}
                />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Scenarios */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Your focus scenarios</Text>
            <Text style={styles.blockSub}>Picked for: <Text style={styles.blockSubBold}>{goal}</Text></Text>
            <View style={styles.scenarioRow}>
              {scenarios.map((s) => (
                <View key={s.label} style={styles.scenarioCard}>
                  <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
                  <Text style={styles.scenarioLabel}>{s.label}</Text>
                  <Text style={styles.scenarioSub}>Ready day 1</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Testimonial */}
          <View style={styles.block}>
            <Text style={styles.quoteMarkText}>"</Text>
            <Text style={styles.quoteText}>{testimonial.quote}</Text>
            <View style={styles.quoteAuthor}>
              <View style={styles.quoteAvatar}>
                <Text style={styles.quoteAvatarText}>{getInitials(testimonial.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quoteName}>{testimonial.name}</Text>
                <Text style={styles.quoteDetail}>{testimonial.detail}</Text>
              </View>
              <View style={styles.quoteStars}>
                {[0,1,2,3,4].map(i => <Ionicons key={i} name="star" size={12} color="#FBBF24" />)}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* What's included */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>What's included</Text>
            {FEATURES.map((f, i) => (
              <View key={f.label} style={[styles.featureRow, i < FEATURES.length - 1 && { marginBottom: 14 }]}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={16} color="#2563EB" />
                </View>
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.replace('/paywall')} activeOpacity={0.9}>
          <Text style={styles.ctaBtnText}>Unlock my plan</Text>
          <Text style={styles.ctaBtnArrow}>→</Text>
        </TouchableOpacity>
        <Text style={styles.ctaSub}>Cancel anytime · Takes 30 seconds</Text>
      </View>
    </SafeAreaView>
  );
}

function TimelineStep({ emoji, color, title, sub, last }: {
  emoji: string; color: string; title: string; sub: string; last?: boolean;
}) {
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <Text style={styles.timelineDotEmoji}>{emoji}</Text>
        </View>
        {!last && <View style={styles.timelineConnector} />}
      </View>
      <View style={[styles.timelineContent, !last && { paddingBottom: 20 }]}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 16 },

  // Hero
  hero: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 26,
    paddingTop: 36,
    paddingBottom: 44,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center',
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#2563EB', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  heroBadgeEmoji: { fontSize: 14 },
  heroBadgeText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },

  heroEmoji: { fontSize: 64, marginBottom: 12 },

  heroTitle: { fontSize: 42, fontWeight: '900', color: '#111827', lineHeight: 50, letterSpacing: -1, textAlign: 'center', marginBottom: 8 },
  heroSub: { fontSize: 16, color: '#6B7280', lineHeight: 24, textAlign: 'center', marginBottom: 20 },
  heroSubBold: { color: '#374151', fontWeight: '700' },

  heroStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20, padding: 20,
    width: '100%',
    shadowColor: '#2563EB', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatEmoji: { fontSize: 18, marginBottom: 2 },
  heroStatNum: { fontSize: 26, fontWeight: '900', color: '#111827' },
  heroStatLabel: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  heroStatDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },

  // Body
  body: { paddingHorizontal: 24, paddingTop: 32 },

  block: { gap: 16, marginBottom: 4 },
  blockTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  blockSub: { fontSize: 14, color: '#9CA3AF', marginTop: -8 },
  blockSubBold: { fontWeight: '600', color: '#374151' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 32 },

  // Insight
  insightCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginBottom: 32,
    borderRadius: 16, borderWidth: 1,
    padding: 16,
  },
  insightEmoji: { fontSize: 22, flexShrink: 0, marginTop: 1 },
  insightText: { flex: 1, fontSize: 15, lineHeight: 24, fontWeight: '500' },

  // Timeline
  timeline: { gap: 0 },
  timelineStep: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 36 },
  timelineDot: {
    width: 36, height: 36, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotEmoji: { fontSize: 16 },
  timelineConnector: { flex: 1, width: 2, backgroundColor: '#F3F4F6', marginVertical: 3 },
  timelineContent: { flex: 1, paddingTop: 6 },
  timelineTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  timelineSub: { fontSize: 13, color: '#9CA3AF', marginTop: 3, lineHeight: 20 },

  // Scenarios
  scenarioRow: { flexDirection: 'row', gap: 10 },
  scenarioCard: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 18, padding: 18,
    gap: 8, borderWidth: 1, borderColor: '#F3F4F6',
    alignItems: 'flex-start',
  },
  scenarioEmoji: { fontSize: 28 },
  scenarioLabel: { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  scenarioSub: { fontSize: 12, color: '#16A34A', fontWeight: '600' },

  // Testimonial
  quoteMarkText: { fontSize: 72, fontWeight: '900', color: '#BFDBFE', lineHeight: 60, marginBottom: -4 },
  quoteText: { fontSize: 17, color: '#374151', lineHeight: 28, fontStyle: 'italic' },
  quoteAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  quoteAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  quoteAvatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  quoteName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  quoteDetail: { fontSize: 12, color: '#9CA3AF' },
  quoteStars: { flexDirection: 'row', gap: 2 },

  // Features
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  featureText: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 23 },

  // Footer
  footer: {
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 16,
    backgroundColor: '#fff', gap: 10,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  ctaBtn: {
    backgroundColor: '#2563EB', paddingVertical: 17, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563EB', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  ctaBtnArrow: { color: '#fff', fontSize: 18, fontWeight: '700' },
  ctaSub: { textAlign: 'center', fontSize: 12, color: '#9CA3AF' },
});
