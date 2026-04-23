import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { sessionStore } from '../lib/sessionStore';
import { supabase } from '../lib/supabase';

const SCENARIO_LABELS: Record<string, string> = {
  free:       'Open Chat',
  restaurant: 'Ordering Food',
  interview:  'Job Interview',
  smalltalk:  'Small Talk',
  doctor:     'Doctor Visit',
  shopping:   'Shopping',
};

export default function SessionSummaryScreen() {
  const { scenario, messages, corrections } = sessionStore.get();

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    saveSession();
    fetchStreak();
  }, []);

  async function fetchStreak() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('sessions').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!data) return;
    const days = new Set(data.map((s) => new Date(s.created_at).toDateString()));
    let count = 0;
    const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
    setStreak(count);
  }

  async function saveSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: session } = await supabase
        .from('sessions')
        .insert({ user_id: user.id, scenario, exchange_count: userTurns })
        .select('id')
        .single();

      if (session && corrections.length > 0) {
        await supabase.from('corrections').insert(
          corrections.map((c) => ({
            user_id: user.id,
            session_id: session.id,
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
          }))
        );
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }
  const scenarioLabel = SCENARIO_LABELS[scenario] ?? 'Conversation';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Session Complete!</Text>
          <Text style={styles.subtitle}>{scenarioLabel}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="chatbubble-outline" value={String(userTurns)} label="Exchanges" color="#2563EB" />
          <StatCard icon="create-outline" value={String(corrections.length)} label="Corrections" color="#f97316" />
          <StatCard icon="flame-outline" value={String(streak)} label="Day streak" color="#ef4444" />
        </View>

        {/* Corrections */}
        {corrections.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Corrections</Text>
            {corrections.map((c, i) => (
              <View key={i} style={styles.correctionCard}>
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
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.noCorrectionsCard}>
              <Text style={styles.noCorrectionsEmoji}>🎉</Text>
              <Text style={styles.noCorrectionsText}>No corrections this session — great job!</Text>
            </View>
          </View>
        )}

        {/* Transcript preview */}
        {messages.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conversation recap</Text>
            {messages.map((m, i) => (
              <View key={i} style={styles.transcriptRow}>
                <Text style={styles.transcriptRole}>{m.role === 'user' ? 'You' : 'AI'}</Text>
                <Text style={styles.transcriptText} numberOfLines={2}>{m.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.practiceAgainBtn}
          onPress={() => router.replace({ pathname: '/conversation', params: { scenario } })}
        >
          <Text style={styles.practiceAgainText}>Practice Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, color }: {
  icon: any; value: string; label: string; color: string;
}) {
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
  content: { padding: 20 },

  header: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6b7280' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
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

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },

  correctionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
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

  noCorrectionsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  noCorrectionsEmoji: { fontSize: 32 },
  noCorrectionsText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },

  transcriptRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transcriptRole: { fontSize: 12, fontWeight: '700', color: '#2563EB', width: 28 },
  transcriptText: { fontSize: 13, color: '#6b7280', flex: 1 },

  footer: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  practiceAgainBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  practiceAgainText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  homeBtn: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  homeBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
});
