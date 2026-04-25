import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { colors, TAB_BAR_HEIGHT } from '../../lib/theme';
import { getPhraseOfTheDay } from '../../lib/phrases';

const TIPS = [
  { emoji: '💡', tip: 'Use "Could you…" instead of "Can you…" for polite requests. It sounds more professional.' },
  { emoji: '🗣️', tip: '"Make" vs "Do" — use "make" for creating things (make a plan, make a mistake), "do" for tasks and actions (do homework, do the dishes).' },
  { emoji: '⏱️', tip: 'Use present perfect ("I have eaten") for past actions with a connection to now. Use simple past ("I ate") for finished events at a specific time.' },
  { emoji: '🤝', tip: 'Small talk tip: after answering a question, bounce it back. "I\'m from Spain — how about you?" keeps conversations going naturally.' },
  { emoji: '📢', tip: 'Filler phrases like "That\'s a good question" or "Let me think about that" give you time to gather your thoughts without awkward silence.' },
  { emoji: '✍️', tip: '"Since" vs "For" — use "since" with a point in time (since Monday), "for" with a duration (for three years).' },
  { emoji: '💬', tip: 'Agreeing politely: "Absolutely", "Exactly", "That\'s a fair point" sound more natural than just "Yes" in professional settings.' },
  { emoji: '🔑', tip: 'Avoid starting sentences with "I think that I…" — just say "I think…". Removing the extra "that" sounds more fluent.' },
  { emoji: '🌍', tip: '"Interested in" (noun/gerund) vs "Interesting for" (incorrect) — you are interested IN something, not interesting for it.' },
  { emoji: '📖', tip: '"Borrow" vs "Lend" — you borrow FROM someone, you lend TO someone. "Can I borrow your pen?" ✓  "Can you lend me your pen?" ✓' },
  { emoji: '🎯', tip: 'To sound more confident, avoid over-hedging. "I think maybe it could possibly be…" → "I think it\'s…" is cleaner and more persuasive.' },
  { emoji: '😊', tip: 'Use "I was wondering if…" to make requests softer and more polite than "Do you…" or "Can you…"' },
];

function getTipOfTheDay() {
  const index = Math.floor(Date.now() / 86400000) % TIPS.length;
  return TIPS[index];
}

const SCENARIOS = [
  { id: 'free',       label: 'Open Chat',      sub: 'Talk about anything',    emoji: '💬', accent: '#16A34A', accentBg: '#F0FDF4' },
  { id: 'interview',  label: 'Job Interview',  sub: 'Impress & get hired',    emoji: '💼', accent: '#2563EB', accentBg: '#EFF6FF' },
  { id: 'smalltalk',  label: 'Small Talk',     sub: 'Meet new people',        emoji: '☀️', accent: '#EAB308', accentBg: '#FEFCE8' },
  { id: 'restaurant', label: 'Ordering Food',  sub: 'Restaurants & cafes',    emoji: '🍽️', accent: '#F97316', accentBg: '#FFF7ED' },
  { id: 'doctor',     label: 'Doctor Visit',   sub: 'Explain symptoms',       emoji: '🏥', accent: '#EF4444', accentBg: '#FEF2F2' },
  { id: 'shopping',   label: 'Shopping',       sub: 'Ask & negotiate',        emoji: '🛍️', accent: '#8B5CF6', accentBg: '#F5F3FF' },
];

const SCENARIO_LABELS: Record<string, string> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s.label]));

function getGreeting(firstName: string | null) {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return firstName ? `${time}, ${firstName}` : time;
}

function getEncouragement(totalSessions: number, practicedToday: boolean, streak: number): string {
  if (totalSessions === 0) return "Let's start with your first conversation. Pick any scenario below.";
  if (practicedToday && streak >= 3) return `🔥 ${streak}-day streak — you're on a roll. Keep it up!`;
  if (practicedToday) return 'Great session today! See you tomorrow.';
  if (streak >= 2) return `You've practiced ${streak} days in a row — don't break it now.`;
  if (streak === 1) return 'You practiced yesterday — keep the streak alive!';
  return 'Ready to practice today? Pick a scenario and jump in.';
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Correction = { id: string; original: string; corrected: string; explanation: string; created_at: string };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [streak, setStreak] = useState(0);
  const [practicedToday, setPracticedToday] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [cefrLevel, setCefrLevel] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [practicedDays, setPracticedDays] = useState<Set<string>>(new Set());
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [correctionsDismissed, setCorrectionsDismissed] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);
  const [loading, setLoading] = useState(true);

  const phrase = getPhraseOfTheDay();
  const tip = getTipOfTheDay();
  const last7 = getLast7Days();

  useFocusEffect(useCallback(() => {
    setCorrectionsDismissed(false);
    fetchData();
  }, []));

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: sessions }, { data: profile }, { data: corrections }] = await Promise.all([
      supabase.from('sessions').select('scenario, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('user_profiles').select('cefr_level, first_name').eq('id', user.id).single(),
      supabase.from('corrections').select('id, original, corrected, explanation, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    ]);

    if (sessions) {
      const days = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
      let count = 0;
      const d = new Date();
      if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
      while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
      setStreak(count);
      setPracticedDays(days);
      setTotalSessions(sessions.length);
      setPracticedToday(sessions.some((s) => new Date(s.created_at).toDateString() === new Date().toDateString()));
    }

    setCefrLevel(profile?.cefr_level ?? null);
    setFirstName((profile as any)?.first_name ?? null);
    setCorrections(corrections ?? []);
    setLoading(false);
  }

  function startScenario(id: string) {
    router.push({ pathname: '/pre-session', params: { scenario: id } });
  }

  const encouragement = getEncouragement(totalSessions, practicedToday, streak);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSub} />
            </View>
          </View>
          <View style={styles.skeletonEncouragement} />
        </View>
        <View style={styles.primarySection}>
          <View style={styles.skeletonPrimaryCard} />
        </View>
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <View style={styles.skeletonSectionLabel} />
          <View style={styles.skeletonStatsStrip} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting(firstName)}</Text>
              {cefrLevel && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{cefrLevel}</Text>
                  <Text style={styles.levelBadgeDot}>·</Text>
                  <Text style={styles.levelBadgeLabel}>English level</Text>
                </View>
              )}
            </View>
            {streak > 0 && (
              <View style={styles.streakPill}>
                <Text style={styles.streakPillText}>🔥 {streak}</Text>
              </View>
            )}
          </View>
          <Text style={styles.encouragement}>{encouragement}</Text>
        </View>

        {/* Primary action */}
        <View style={styles.primarySection}>
          {!practicedToday ? (
            <TouchableOpacity style={styles.practiceCard} onPress={() => startScenario('free')} activeOpacity={0.9}>
              <View style={styles.practiceCardDecorA} />
              <View style={styles.practiceCardDecorB} />
              <Text style={styles.practiceCardEyebrow}>
                {totalSessions === 0 ? "Let's go 🎉" : 'Daily practice'}
              </Text>
              <Text style={styles.practiceCardTitle}>
                {totalSessions === 0 ? 'Start your first\nconversation' : "Start today's\nsession"}
              </Text>
              <Text style={styles.practiceCardSub}>
                {totalSessions === 0
                  ? 'Your AI tutor is ready. No judgement, just practice.'
                  : 'Open conversation with your AI tutor'}
              </Text>
              <View style={styles.practiceCardBtn}>
                <Ionicons name="mic" size={15} color={colors.primary} />
                <Text style={styles.practiceCardBtnText}>{totalSessions === 0 ? 'Let\'s go' : 'Begin'}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.doneCard}>
              <Text style={styles.doneCardEmoji}>🎉</Text>
              <View style={styles.doneCardText}>
                <Text style={styles.doneCardTitle}>Done for today!</Text>
                <Text style={styles.doneCardSub}>
                  {streak > 1 ? `${streak}-day streak — you're crushing it.` : 'Great start — come back tomorrow!'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats strip — only shown once there's something to show */}
        {totalSessions > 0 && (
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{totalSessions}</Text>
              <Text style={styles.statLabel}>sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{practicedDays.size}</Text>
              <Text style={styles.statLabel}>days practiced</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{streak}</Text>
              <Text style={styles.statLabel}>day streak</Text>
            </View>
          </View>
        )}

        {/* Scenarios */}
        <View style={styles.scenarioSection}>
          <Text style={styles.sectionLabel}>Practice scenarios</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scenarioScroll}
          >
            {SCENARIOS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.scenarioCard}
                onPress={() => startScenario(s.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.scenarioEmojiWrap, { backgroundColor: s.accentBg }]}>
                  <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
                </View>
                <Text style={styles.scenarioCardLabel}>{s.label}</Text>
                <Text style={styles.scenarioCardSub}>{s.sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Week streak */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>This week</Text>
          <View style={styles.weekCard}>
            {last7.map((day, i) => {
              const practiced = practicedDays.has(day.toDateString());
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <View key={i} style={styles.dayCol}>
                  <View style={[
                    styles.dayDot,
                    practiced && styles.dayDotFilled,
                    isToday && !practiced && styles.dayDotToday,
                    isToday && practiced && styles.dayDotTodayFilled,
                  ]}>
                    {practiced
                      ? <Ionicons name="checkmark" size={13} color="#fff" />
                      : <Text style={[styles.dayLetter, isToday && styles.dayLetterToday]}>{DAY_LETTERS[day.getDay()]}</Text>
                    }
                  </View>
                  {isToday && <View style={styles.todayDot} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Corrections from last session */}
        {corrections.length > 0 && !correctionsDismissed && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>From your last session</Text>
            <View style={styles.correctionsCard}>
              {corrections.map((c, i) => (
                <View key={c.id}>
                  <TouchableOpacity
                    style={styles.correctionItem}
                    onPress={() => setSelectedCorrection(c)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.correctionLines}>
                      <View style={styles.correctionRow}>
                        <View style={styles.wrongTag}><Text style={styles.wrongTagText}>Said</Text></View>
                        <Text style={styles.correctionOriginal} numberOfLines={1}>"{c.original}"</Text>
                      </View>
                      <View style={styles.correctionRow}>
                        <View style={styles.rightTag}><Text style={styles.rightTagText}>Better</Text></View>
                        <Text style={styles.correctionFixed} numberOfLines={1}>"{c.corrected}"</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                  {i < corrections.length - 1 && <View style={styles.correctionDivider} />}
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setCorrectionsDismissed(true)}
                style={styles.correctionsDismiss}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.correctionsDismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Phrase of the day */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Phrase of the day</Text>
          <View style={styles.phraseCard}>
            <Text style={styles.phraseQuote}>"</Text>
            <Text style={styles.phraseText}>{phrase.phrase}</Text>
            <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
            <View style={styles.phraseDivider} />
            <View style={styles.phraseExampleRow}>
              <Text style={styles.phraseExampleLabel}>EXAMPLE  </Text>
              <Text style={styles.phraseExample}>{phrase.example}</Text>
            </View>
          </View>
        </View>

        {/* Quick tip */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick tip</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text style={styles.tipText}>{tip.tip}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Correction detail modal */}
      <Modal visible={!!selectedCorrection} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedCorrection(null)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Correction</Text>
            <TouchableOpacity onPress={() => setSelectedCorrection(null)} style={styles.modalClose}>
              <Ionicons name="close" size={20} color={colors.textSub} />
            </TouchableOpacity>
          </View>
          {selectedCorrection && (
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <View style={styles.wrongTag}><Text style={styles.wrongTagText}>You said</Text></View>
                <Text style={styles.modalOriginal}>"{selectedCorrection.original}"</Text>
              </View>
              <View style={styles.modalRow}>
                <View style={styles.rightTag}><Text style={styles.rightTagText}>Better</Text></View>
                <Text style={styles.modalCorrected}>"{selectedCorrection.corrected}"</Text>
              </View>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>Why</Text>
                <Text style={styles.explanationText}>{selectedCorrection.explanation}</Text>
              </View>
              <Text style={styles.modalDate}>
                From {new Date(selectedCorrection.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.modalDismissBtn} onPress={() => setSelectedCorrection(null)}>
            <Text style={styles.modalDismissBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { gap: 6 },
  greeting: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  levelBadgeText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  levelBadgeDot: { fontSize: 13, color: colors.textMuted },
  levelBadgeLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  streakPill: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  streakPillText: { fontSize: 13, fontWeight: '700', color: '#EA580C' },
  encouragement: {
    fontSize: 15,
    color: colors.textSub,
    lineHeight: 22,
  },

  // Primary action
  primarySection: { paddingHorizontal: 16, marginBottom: 20 },
  practiceCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 24,
    gap: 8,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  practiceCardDecorA: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -60,
  },
  practiceCardDecorB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: 20,
  },
  practiceCardEyebrow: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
  practiceCardTitle: { fontSize: 28, fontWeight: '800', color: '#fff', lineHeight: 34, marginTop: 2 },
  practiceCardSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 20, marginBottom: 6 },
  practiceCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  practiceCardBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },

  doneCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  doneCardEmoji: { fontSize: 32 },
  doneCardText: { flex: 1 },
  doneCardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  doneCardSub: { fontSize: 13, color: colors.textSub, marginTop: 3, lineHeight: 19 },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: 4 },

  // Scenarios
  scenarioSection: { marginBottom: 24 },
  scenarioScroll: { paddingHorizontal: 16, gap: 10 },
  scenarioCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioEmoji: { fontSize: 24 },
  scenarioCardLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  scenarioCardSub: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, paddingHorizontal: 16 },

  // Week calendar
  section: { marginBottom: 24 },
  weekCard: {
    backgroundColor: '#F0F6FF',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: 16,
  },
  dayCol: { alignItems: 'center', gap: 8 },
  dayLetter: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  dayLetterToday: { color: colors.primary, fontWeight: '800' },
  dayDot: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#DDE8FB',
  },
  dayDotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayDotToday: { borderColor: colors.primary, borderWidth: 2, backgroundColor: '#fff' },
  dayDotTodayFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  todayDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },

  // Corrections
  correctionsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  correctionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  correctionLines: { flex: 1, gap: 7 },
  correctionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrongTag: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  wrongTagText: { fontSize: 10, color: colors.error, fontWeight: '700' },
  rightTag: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  rightTagText: { fontSize: 10, color: colors.success, fontWeight: '700' },
  correctionOriginal: { fontSize: 13, color: colors.error, flex: 1 },
  correctionFixed: { fontSize: 13, color: colors.success, fontWeight: '600', flex: 1 },
  correctionDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  correctionsDismiss: { paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  correctionsDismissText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  // Phrase
  phraseCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 18,
    gap: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  phraseQuote: { fontSize: 36, fontWeight: '800', color: '#FDE68A', lineHeight: 32, marginBottom: -4 },
  phraseText: { fontSize: 18, fontWeight: '700', color: '#78350F', lineHeight: 26 },
  phraseMeaning: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  phraseDivider: { height: 1, backgroundColor: '#FDE68A', marginVertical: 4 },
  phraseExampleRow: { flexDirection: 'row', flexWrap: 'wrap' },
  phraseExampleLabel: { fontSize: 11, fontWeight: '700', color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.5 },
  phraseExample: { fontSize: 13, color: '#92400E', fontStyle: 'italic', flex: 1 },

  // Tip
  tipCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tipEmoji: { fontSize: 24, marginTop: 1 },
  tipText: { flex: 1, fontSize: 14, color: '#166534', lineHeight: 22, fontWeight: '500' },

  // Skeletons
  skeletonTitle: { width: 180, height: 28, borderRadius: 8, backgroundColor: '#E5E7EB' },
  skeletonSub: { width: 100, height: 14, borderRadius: 6, backgroundColor: '#F3F4F6', marginTop: 6 },
  skeletonEncouragement: { width: '70%', height: 14, borderRadius: 6, backgroundColor: '#F3F4F6' },
  skeletonPrimaryCard: { height: 160, borderRadius: 22, backgroundColor: '#DBEAFE' },
  skeletonSectionLabel: { width: 120, height: 11, borderRadius: 5, backgroundColor: '#F3F4F6' },
  skeletonStatsStrip: { height: 70, borderRadius: 16, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  modalBody: { gap: 12 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalOriginal: { fontSize: 15, color: colors.error, flex: 1 },
  modalCorrected: { fontSize: 15, color: colors.success, fontWeight: '600', flex: 1 },
  explanationBox: { backgroundColor: colors.bg, borderRadius: 12, padding: 14, gap: 4 },
  explanationLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  explanationText: { fontSize: 14, color: colors.textSub, lineHeight: 22 },
  modalDate: { fontSize: 12, color: colors.textMuted },
  modalDismissBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  modalDismissBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
