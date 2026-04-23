import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
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

const GOALS = [
  { label: 'Work & career',     icon: '💼' },
  { label: 'Travel',            icon: '✈️' },
  { label: 'Social confidence', icon: '💬' },
  { label: 'Exam prep',         icon: '📝' },
];

const LANGUAGES = [
  'Spanish', 'Portuguese', 'French', 'German', 'Italian',
  'Russian', 'Mandarin Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Turkish', 'Dutch', 'Polish', 'Swedish',
  'Vietnamese', 'Thai', 'Indonesian', 'Ukrainian', 'Other',
];

type Profile = {
  email: string;
  cefr_level: string | null;
  native_language: string | null;
  goal: string | null;
};

type PickerType = 'level' | 'language' | 'goal' | null;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<PickerType>(null);

  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  async function fetchProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('user_profiles')
      .select('cefr_level, native_language, goal')
      .eq('id', user.id)
      .single();

    setProfile({
      email: user.email ?? '',
      cefr_level: data?.cefr_level ?? null,
      native_language: data?.native_language ?? null,
      goal: data?.goal ?? null,
    });
    setLoading(false);
  }

  async function updateField(field: keyof Omit<Profile, 'email'>, value: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_profiles').update({ [field]: value }).eq('id', user.id);
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
    setPicker(null);
  }

  function signOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/onboarding');
      }},
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}><ActivityIndicator color="#2563EB" /></View>
      </SafeAreaView>
    );
  }

  const currentLevel = CEFR_LEVELS.find((l) => l.label === profile?.cefr_level);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.email}>{profile?.email}</Text>
          {currentLevel && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{currentLevel.label} · {currentLevel.name}</Text>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning</Text>

          <View style={styles.group}>
            <SettingRow
              icon="school-outline"
              label="English level"
              value={currentLevel ? `${currentLevel.label} — ${currentLevel.name}` : 'Not set'}
              onPress={() => setPicker('level')}
            />
            <Divider />
            <SettingRow
              icon="flag-outline"
              label="Native language"
              value={profile?.native_language ?? 'Not set'}
              onPress={() => setPicker('language')}
            />
            <Divider />
            <SettingRow
              icon="trophy-outline"
              label="Goal"
              value={profile?.goal ?? 'Not set'}
              onPress={() => setPicker('goal')}
            />
            <Divider />
            <SettingRow
              icon="mic-outline"
              label="Redo level assessment"
              onPress={() => router.push('/onboarding/level')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.group}>
            <SettingRow
              icon="log-out-outline"
              label="Sign out"
              danger
              onPress={signOut}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.group}>
            <SettingRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => Linking.openURL('https://jordan-g1.github.io/english-now/terms-and-conditions.html')}
            />
            <Divider />
            <SettingRow
              icon="shield-outline"
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://jordan-g1.github.io/english-now/privacy-policy.html')}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Level picker */}
      <BottomSheet visible={picker === 'level'} onClose={() => setPicker(null)} title="English level">
        {CEFR_LEVELS.map((l) => (
          <TouchableOpacity
            key={l.label}
            style={[styles.pickerRow, profile?.cefr_level === l.label && styles.pickerRowSelected]}
            onPress={() => updateField('cefr_level', l.label)}
          >
            <View style={styles.pickerText}>
              <Text style={[styles.pickerLabel, profile?.cefr_level === l.label && styles.pickerLabelSelected]}>
                {l.label} — {l.name}
              </Text>
              <Text style={styles.pickerDesc}>{l.desc}</Text>
            </View>
            {profile?.cefr_level === l.label && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* Language picker */}
      <BottomSheet visible={picker === 'language'} onClose={() => setPicker(null)} title="Native language" scrollable>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.pickerRow, profile?.native_language === lang && styles.pickerRowSelected]}
            onPress={() => updateField('native_language', lang)}
          >
            <Text style={[styles.pickerLabel, profile?.native_language === lang && styles.pickerLabelSelected]}>
              {lang}
            </Text>
            {profile?.native_language === lang && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* Goal picker */}
      <BottomSheet visible={picker === 'goal'} onClose={() => setPicker(null)} title="Your goal">
        {GOALS.map((g) => (
          <TouchableOpacity
            key={g.label}
            style={[styles.pickerRow, profile?.goal === g.label && styles.pickerRowSelected]}
            onPress={() => updateField('goal', g.label)}
          >
            <Text style={styles.pickerIcon}>{g.icon}</Text>
            <Text style={[styles.pickerLabel, profile?.goal === g.label && styles.pickerLabelSelected]}>
              {g.label}
            </Text>
            {profile?.goal === g.label && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, value, onPress, danger }: {
  icon: any; label: string; value?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? '#ef4444' : '#2563EB'} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function BottomSheet({ visible, onClose, title, children, scrollable }: {
  visible: boolean; onClose: () => void; title: string; children: React.ReactNode; scrollable?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        {scrollable ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
            <View style={{ gap: 6, paddingBottom: 16 }}>{children}</View>
          </ScrollView>
        ) : (
          <View style={{ gap: 6 }}>{children}</View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  email: { fontSize: 15, color: '#6b7280', fontWeight: '500' },
  levelBadge: { backgroundColor: '#EFF6FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  levelBadgeText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },

  group: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  settingIconDanger: { backgroundColor: '#fee2e2' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  settingLabelDanger: { color: '#ef4444' },
  settingValue: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 60 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerRowSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  pickerText: { flex: 1 },
  pickerLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  pickerLabelSelected: { color: '#2563EB' },
  pickerDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  pickerIcon: { fontSize: 20 },
});
