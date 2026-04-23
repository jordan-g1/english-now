import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Correction = {
  corrected: string;
  explanation: string;
  count: number;
};

export default function PreSessionScreen() {
  const { scenario } = useLocalSearchParams<{ scenario: string }>();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurring();
  }, []);

  async function fetchRecurring() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { proceed(); return; }

    const { data } = await supabase
      .from('corrections')
      .select('corrected, explanation')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data || data.length === 0) { proceed(); return; }

    // Count how many times each corrected form appears
    const counts: Record<string, { explanation: string; count: number }> = {};
    for (const c of data) {
      const key = c.corrected.toLowerCase();
      if (!counts[key]) counts[key] = { explanation: c.explanation, count: 0 };
      counts[key].count++;
    }

    // Only show corrections that have appeared more than once
    const recurring = Object.entries(counts)
      .filter(([, v]) => v.count > 1)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([corrected, v]) => ({ corrected, explanation: v.explanation, count: v.count }));

    if (recurring.length === 0) { proceed(); return; }

    setCorrections(recurring);
    setLoading(false);
  }

  function proceed() {
    router.replace({ pathname: '/conversation', params: { scenario } });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>💡</Text>
        <Text style={styles.title}>Before you start</Text>
        <Text style={styles.subtitle}>
          These are mistakes you've made before. Keep them in mind this session.
        </Text>

        {corrections.map((c, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {c.count}× mistake
                </Text>
              </View>
            </View>
            <Text style={styles.corrected}>✓ "{c.corrected}"</Text>
            <Text style={styles.explanation}>{c.explanation}</Text>
          </View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={proceed}>
          <Text style={styles.startBtnText}>Got it — start conversation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={proceed} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 14 },
  emoji: { fontSize: 44 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22, marginBottom: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row' },
  badge: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, color: '#ef4444', fontWeight: '700' },
  corrected: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  explanation: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: '#9ca3af', fontSize: 13 },
});
