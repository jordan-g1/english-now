import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const CEFR_LEVELS = [
  { label: 'A1', name: 'Beginner',           desc: 'I know a few basic words and phrases' },
  { label: 'A2', name: 'Elementary',         desc: 'I can handle simple, familiar topics' },
  { label: 'B1', name: 'Intermediate',       desc: 'I can get by in most everyday situations' },
  { label: 'B2', name: 'Upper Intermediate', desc: 'I can speak fluently on most topics' },
  { label: 'C1', name: 'Advanced',           desc: 'I speak fluently with occasional errors' },
  { label: 'C2', name: 'Mastery',            desc: 'I speak at near-native level' },
];

type Session = {
  id: string;
  scenario: string;
  exchange_count: number;
  created_at: string;
};

type Correction = {
  id: string;
  original: string;
  corrected: string;
  explanation: string;
  created_at: string;
};

const SCENARIO_LABELS: Record<string, string> = {
  free:       'Open Chat',
  restaurant: 'Ordering Food',
  interview:  'Job Interview',
  smalltalk:  'Small Talk',
  doctor:     'Doctor Visit',
  shopping:   'Shopping',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

function calcStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
  let streak = 0;
  const d = new Date();
  // if nothing today, allow yesterday to keep streak alive
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function ProgressScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCorrections, setShowAllCorrections] = useState(false);
  const [cefrLevel, setCefrLevel] = useState<string | null>(null);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: s }, { data: c }, { data: profile }] = await Promise.all([
      supabase.from('sessions').select('id, scenario, exchange_count, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('corrections').select('id, original, corrected, explanation, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('cefr_level').eq('id', user.id).single(),
    ]);

    setSessions(s ?? []);
    setCorrections(c ?? []);
    setCefrLevel(profile?.cefr_level ?? null);
    setLoading(false);
  }

  const streak = calcStreak(sessions);
  const totalExchanges = sessions.reduce((sum, s) => sum + s.exchange_count, 0);

  const last7 = getLast7Days();
  const sessionsByDay = last7.map((day) =>
    sessions.filter((s) => new Date(s.created_at).toDateString() === day.toDateString()).length
  );
  const maxSessions = Math.max(...sessionsByDay, 1);

  const visibleCorrections = showAllCorrections ? corrections : corrections.slice(0, 5);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator color="#2563EB" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} day streak</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="mic-outline"     color="#2563EB" value={String(sessions.length)}   label="Sessions" />
          <StatCard icon="chatbubble-outline" color="#3b82f6" value={String(totalExchanges)} label="Exchanges" />
          <StatCard icon="create-outline"  color="#f97316" value={String(corrections.length)} label="Corrections" />
        </View>

        {/* This week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This week</Text>
          <View style={styles.chartCard}>
            <View style={styles.bars}>
              {last7.map((day, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${(sessionsByDay[i] / maxSessions) * 100}%` },
                        sessionsByDay[i] === 0 && styles.barEmpty,
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{DAY_LABELS[day.getDay()]}</Text>
                  {sessionsByDay[i] > 0 && (
                    <Text style={styles.barCount}>{sessionsByDay[i]}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Corrections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Corrections to review</Text>
          {corrections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>No corrections yet — keep practicing!</Text>
            </View>
          ) : (
            <>
              {visibleCorrections.map((c) => (
                <View key={c.id} style={styles.correctionCard}>
                  <View style={styles.correctionRow}>
                    <View style={styles.wrongTag}><Text style={styles.wrongTagText}>Said</Text></View>
                    <Text style={styles.correctionOriginal}>"{c.original}"</Text>
                  </View>
                  <View style={styles.correctionRow}>
                    <View style={styles.rightTag}><Text style={styles.rightTagText}>Better</Text></View>
                    <Text style={styles.correctionFixed}>"{c.corrected}"</Text>
                  </View>
                  <Text style={styles.correctionExplanation}>{c.explanation}</Text>
                </View>
              ))}
              {corrections.length > 5 && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setShowAllCorrections(!showAllCorrections)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllCorrections ? 'Show less' : `Show all ${corrections.length} corrections`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent sessions</Text>
            {sessions.slice(0, 5).map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionScenario}>{SCENARIO_LABELS[s.scenario] ?? s.scenario}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Ionicons name="chatbubble-outline" size={13} color="#9ca3af" />
                  <Text style={styles.sessionExchanges}>{s.exchange_count}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Level settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your level</Text>
          <TouchableOpacity style={styles.levelRow} onPress={() => setShowLevelPicker(true)}>
            <View>
              <Text style={styles.levelLabel}>
                {cefrLevel
                  ? `${cefrLevel} — ${CEFR_LEVELS.find(l => l.label === cefrLevel)?.name ?? ''}`
                  : 'Not set'}
              </Text>
              <Text style={styles.levelSub}>Tap to change</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Level picker modal */}
      <Modal visible={showLevelPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLevelPicker(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Change your level</Text>
          {CEFR_LEVELS.map((l) => (
            <TouchableOpacity
              key={l.label}
              style={[styles.levelOption, cefrLevel === l.label && styles.levelOptionSelected]}
              onPress={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                await supabase.from('user_profiles').update({ cefr_level: l.label }).eq('id', user.id);
                setCefrLevel(l.label);
                setShowLevelPicker(false);
                Alert.alert('Level updated', `Your tutor will now speak at ${l.label} (${l.name}) level.`);
              }}
            >
              <View style={styles.levelOptionText}>
                <Text style={[styles.levelOptionLabel, cefrLevel === l.label && styles.levelOptionLabelSelected]}>
                  {l.label} — {l.name}
                </Text>
                <Text style={styles.levelOptionDesc}>{l.desc}</Text>
              </View>
              {cefrLevel === l.label && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ icon, color, value, label }: { icon: any; color: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  streakBadge: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  streakText: { fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { width: '100%', flex: 1, justifyContent: 'flex-end' },
  barFill: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
    minHeight: 4,
  },
  barEmpty: { backgroundColor: '#e5e7eb', minHeight: 4 },
  barLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  barCount: { fontSize: 10, color: '#2563EB', fontWeight: '700' },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },

  correctionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  correctionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrongTag: { backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  wrongTagText: { fontSize: 11, color: '#ef4444', fontWeight: '700' },
  rightTag: { backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  rightTagText: { fontSize: 11, color: '#16a34a', fontWeight: '700' },
  correctionOriginal: { fontSize: 14, color: '#ef4444', flex: 1 },
  correctionFixed: { fontSize: 14, color: '#16a34a', fontWeight: '600', flex: 1 },
  correctionExplanation: { fontSize: 13, color: '#6b7280', lineHeight: 18 },

  showMoreBtn: { alignItems: 'center', paddingVertical: 10 },
  showMoreText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  levelLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  levelSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F9FAFB',
  },
  levelOptionSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  levelOptionText: { flex: 1 },
  levelOptionLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  levelOptionLabelSelected: { color: '#2563EB' },
  levelOptionDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionLeft: { gap: 2 },
  sessionScenario: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sessionDate: { fontSize: 12, color: '#9ca3af' },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionExchanges: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
});
