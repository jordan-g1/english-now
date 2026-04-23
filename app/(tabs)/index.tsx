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

const SCENARIOS = [
  { id: 'restaurant', label: 'Ordering Food', sub: 'Restaurants, cafes, takeaway', icon: 'restaurant-outline' },
  { id: 'interview',  label: 'Job Interview',  sub: 'Questions, answers, confidence', icon: 'briefcase-outline'  },
  { id: 'smalltalk',  label: 'Small Talk',     sub: 'Weather, weekends, new people', icon: 'sunny-outline'      },
  { id: 'doctor',     label: 'Doctor Visit',   sub: 'Symptoms, appointments, advice', icon: 'medkit-outline'     },
  { id: 'shopping',   label: 'Shopping',       sub: 'Prices, sizes, asking for help', icon: 'bag-outline'        },
];

const SCENARIO_LABELS: Record<string, string> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s.label]));
SCENARIO_LABELS['free'] = 'Open Chat';

const LEVEL_CONTEXT: Record<string, string> = {
  A1: 'You can understand basic phrases and introduce yourself. Keep going — A2 is just around the corner.',
  A2: 'You can handle simple conversations on familiar topics. At B1 you\'ll handle most travel situations.',
  B1: 'You can get by in most everyday situations. B2 means speaking fluently on almost any topic.',
  B2: 'You speak fluently on most topics. At C1 you\'ll sound natural in professional settings.',
  C1: 'You speak at an advanced level with occasional errors. C2 is near-native fluency.',
  C2: 'You\'re at mastery level — focus on naturalness, nuance, and cultural fluency.',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
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
  const [lastSession, setLastSession] = useState<{ scenario: string } | null>(null);
  const [cefrLevel, setCefrLevel] = useState<string | null>(null);
  const [practicedDays, setPracticedDays] = useState<Set<string>>(new Set());
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [correctionDismissed, setCorrectionDismissed] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  const phrase = getPhraseOfTheDay();
  const last7 = getLast7Days();

  useFocusEffect(useCallback(() => {
    setCorrectionDismissed(false);
    fetchData();
  }, []));

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: sessions }, { data: profile }, { data: corrections }] = await Promise.all([
      supabase.from('sessions').select('scenario, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('user_profiles').select('cefr_level').eq('id', user.id).single(),
      supabase.from('corrections').select('id, original, corrected, explanation, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    ]);

    if (sessions) {
      const days = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
      let count = 0;
      const d = new Date();
      if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
      while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
      setStreak(count);
      setPracticedDays(days);
      setPracticedToday(sessions.some((s) => new Date(s.created_at).toDateString() === new Date().toDateString()));
      setLastSession(sessions[0] ?? null);
    }

    setCefrLevel(profile?.cefr_level ?? null);
    setCorrection(corrections?.[0] ?? null);
  }

  function startScenario(id: string) {
    router.push({ pathname: '/pre-session', params: { scenario: id } });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            {cefrLevel && <Text style={styles.levelLine}>{cefrLevel} · English level</Text>}
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 {streak}</Text>
          </View>
        </View>

        {/* Primary action */}
        <View style={styles.primarySection}>
          {!practicedToday ? (
            <TouchableOpacity style={styles.practiceCard} onPress={() => startScenario('free')} activeOpacity={0.9}>
              <View>
                <Text style={styles.practiceCardEyebrow}>Daily practice</Text>
                <Text style={styles.practiceCardTitle}>Start today's session</Text>
                <Text style={styles.practiceCardSub}>Open conversation with your AI tutor</Text>
              </View>
              <View style={styles.practiceCardBtn}>
                <Ionicons name="mic" size={18} color={colors.primary} />
                <Text style={styles.practiceCardBtnText}>Begin</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.doneCard}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <View style={styles.doneCardText}>
                <Text style={styles.doneCardTitle}>Practiced today</Text>
                <Text style={styles.doneCardSub}>
                  {streak > 1 ? `${streak} day streak — keep it up` : 'Great start!'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Week view */}
        <View style={styles.section}>
          <View style={styles.weekCard}>
            {last7.map((day, i) => {
              const practiced = practicedDays.has(day.toDateString());
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <View key={i} style={styles.dayCol}>
                  <Text style={styles.dayLetter}>{DAY_LETTERS[day.getDay()]}</Text>
                  <View style={[
                    styles.dayDot,
                    practiced && styles.dayDotFilled,
                    isToday && !practiced && styles.dayDotToday,
                  ]}>
                    {practiced && <Ionicons name="checkmark" size={10} color="#fff" />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Correction review */}
        {correction && !correctionDismissed && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Review</Text>
            <TouchableOpacity style={styles.correctionCard} onPress={() => setShowCorrectionModal(true)} activeOpacity={0.8}>
              <View style={styles.correctionCardInner}>
                <View style={styles.correctionTags}>
                  <View style={styles.wrongTag}><Text style={styles.wrongTagText}>Said</Text></View>
                  <Text style={styles.correctionOriginal} numberOfLines={1}>"{correction.original}"</Text>
                </View>
                <View style={styles.correctionTags}>
                  <View style={styles.rightTag}><Text style={styles.rightTagText}>Better</Text></View>
                  <Text style={styles.correctionFixed} numberOfLines={1}>"{correction.corrected}"</Text>
                </View>
                <Text style={styles.correctionTap}>Tap for full explanation</Text>
              </View>
              <TouchableOpacity onPress={() => setCorrectionDismissed(true)} style={styles.dismissBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* Phrase of the day */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Phrase of the day</Text>
          <View style={styles.phraseCard}>
            <Text style={styles.phraseText}>"{phrase.phrase}"</Text>
            <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
            <View style={styles.phraseExampleRow}>
              <Text style={styles.phraseExampleLabel}>Example  </Text>
              <Text style={styles.phraseExample}>{phrase.example}</Text>
            </View>
          </View>
        </View>

        {/* Open Chat */}
        {practicedToday && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.openChatRow} onPress={() => startScenario('free')} activeOpacity={0.8}>
              <View style={styles.openChatIcon}>
                <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.openChatText}>
                <Text style={styles.openChatLabel}>Open Chat</Text>
                <Text style={styles.openChatSub}>Talk about anything</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Continue */}
        {lastSession && SCENARIO_LABELS[lastSession.scenario] && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Continue</Text>
            <TouchableOpacity style={styles.row} onPress={() => startScenario(lastSession.scenario)} activeOpacity={0.8}>
              <View style={styles.rowIcon}>
                <Ionicons name="refresh-outline" size={16} color={colors.textSub} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{SCENARIO_LABELS[lastSession.scenario]}</Text>
                <Text style={styles.rowSub}>Last session</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Scenarios</Text>
          <Text style={styles.sectionSub}>Practice real-life situations with your AI tutor</Text>
          <View style={styles.scenarioList}>
            {SCENARIOS.map((s, i) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.row, i < SCENARIOS.length - 1 && styles.rowBorder]}
                onPress={() => startScenario(s.id)}
                activeOpacity={0.7}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name={s.icon as any} size={16} color={colors.textSub} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{s.label}</Text>
                  <Text style={styles.rowSub}>{s.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Level context */}
        {cefrLevel && LEVEL_CONTEXT[cefrLevel] && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your Level</Text>
            <View style={styles.levelContextCard}>
              <View style={styles.levelContextLeft}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{cefrLevel}</Text>
                </View>
              </View>
              <Text style={styles.levelContextText}>{LEVEL_CONTEXT[cefrLevel]}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Correction modal */}
      <Modal visible={showCorrectionModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCorrectionModal(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Correction</Text>
            <TouchableOpacity onPress={() => setShowCorrectionModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={20} color={colors.textSub} />
            </TouchableOpacity>
          </View>
          {correction && (
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <View style={styles.wrongTag}><Text style={styles.wrongTagText}>You said</Text></View>
                <Text style={styles.modalOriginal}>"{correction.original}"</Text>
              </View>
              <View style={styles.modalRow}>
                <View style={styles.rightTag}><Text style={styles.rightTagText}>Better</Text></View>
                <Text style={styles.modalCorrected}>"{correction.corrected}"</Text>
              </View>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>Why</Text>
                <Text style={styles.explanationText}>{correction.explanation}</Text>
              </View>
              <Text style={styles.modalDate}>
                From {new Date(correction.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.modalDismissBtn}
            onPress={() => { setShowCorrectionModal(false); setCorrectionDismissed(true); }}
          >
            <Text style={styles.modalDismissBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text },
  levelLine: { fontSize: 13, color: colors.textMuted, marginTop: 2, fontWeight: '500' },
  streakPill: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakPillText: { fontSize: 13, fontWeight: '700', color: colors.text },

  primarySection: { paddingHorizontal: 16, marginBottom: 16 },
  practiceCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  practiceCardEyebrow: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  practiceCardTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  practiceCardSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  practiceCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  practiceCardBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  doneCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneCardText: { flex: 1 },
  doneCardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  doneCardSub: { fontSize: 13, color: colors.textSub, marginTop: 2 },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: colors.textMuted, marginBottom: 10 },

  weekCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLetter: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayDotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayDotToday: { borderColor: colors.primary, borderWidth: 2 },

  levelContextCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelContextLeft: { paddingTop: 2 },
  levelBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelBadgeText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  levelContextText: { flex: 1, fontSize: 13, color: colors.textSub, lineHeight: 20 },

  correctionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  correctionCardInner: { flex: 1, gap: 6 },
  correctionTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrongTag: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  wrongTagText: { fontSize: 10, color: colors.error, fontWeight: '700' },
  rightTag: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rightTagText: { fontSize: 10, color: colors.success, fontWeight: '700' },
  correctionOriginal: { fontSize: 13, color: colors.error, flex: 1 },
  correctionFixed: { fontSize: 13, color: colors.success, fontWeight: '600', flex: 1 },
  correctionTap: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  dismissBtn: { padding: 2 },

  phraseCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  phraseText: { fontSize: 17, fontWeight: '700', color: colors.text },
  phraseMeaning: { fontSize: 13, color: colors.textSub, lineHeight: 20 },
  phraseExampleRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  phraseExampleLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  phraseExample: { fontSize: 13, color: colors.textSub, fontStyle: 'italic', flex: 1 },

  openChatRow: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  openChatIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  openChatText: { flex: 1 },
  openChatLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  openChatSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  scenarioList: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, backgroundColor: colors.card },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

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
