import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../lib/supabase';
import { setOnboarding } from '../../lib/onboardingStore';

const PROMPTS = [
  'Tell me about your daily routine.',
  'Describe your hometown or where you live.',
  'Talk about your favorite hobby or activity.',
  'What do you do for work or school?',
];

const PROMPT = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

type Status = 'idle' | 'recording' | 'analyzing';

export default function LevelScreen() {
  const [status, setStatus] = useState<Status>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }

  function stopPulse() {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }

  async function startRecording() {
    if (status !== 'idle') return;
    try {
      const { status: perm } = await Audio.requestPermissionsAsync();
      if (perm !== 'granted') {
        Alert.alert('Microphone required', 'Please allow microphone access to continue.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setStatus('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      startPulse();
    } catch {
      Alert.alert('Error', 'Could not start recording.');
    }
  }

  async function stopRecording() {
    if (status !== 'recording' || !recording) return;
    stopPulse();
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('analyzing');

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error('No audio');

      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      // Transcribe
      const { data: transcribeData, error: tErr } = await supabase.functions.invoke('transcribe', {
        body: { audio: base64, mimeType: 'audio/m4a' },
      });
      if (tErr) throw new Error(tErr.message);

      const transcript: string = transcribeData.text?.trim();
      if (!transcript) throw new Error('No speech detected');

      // Assess
      const { data: assessData, error: aErr } = await supabase.functions.invoke('assess', {
        body: { transcript },
      });
      if (aErr) throw new Error(aErr.message);

      setOnboarding({ level: assessData.level });

      router.push({
        pathname: '/onboarding/level-result',
        params: {
          level: assessData.level,
          title: assessData.title,
          summary: assessData.summary,
          strengths: JSON.stringify(assessData.strengths),
          areas: JSON.stringify(assessData.areas_to_improve),
        },
      });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(4 / 18) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Let's find your level</Text>
        <Text style={styles.subtitle}>
          Hold the button and speak for 20–30 seconds. The more you say, the more accurate your result.
        </Text>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Talk about:</Text>
          <Text style={styles.promptText}>"{PROMPT}"</Text>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>For the best result:</Text>
          {[
            'Use complete sentences — not just keywords',
            'Vary your vocabulary — avoid repeating simple words',
            'Give details and explain your thoughts',
            'Aim for at least 20 seconds',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>·</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.micArea}>
        {status === 'analyzing' ? (
          <View style={styles.analyzingWrap}>
            <ActivityIndicator color="#2563EB" size="large" />
            <Text style={styles.analyzingText}>Analyzing your English...</Text>
          </View>
        ) : (
          <>
            <View style={styles.timerRow}>
              {status === 'recording' ? (
                <>
                  <View style={styles.recDot} />
                  <Text style={styles.timerText}>
                    {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
                  </Text>
                  {seconds < 20 && (
                    <Text style={styles.timerHint}>Keep going...</Text>
                  )}
                  {seconds >= 20 && (
                    <Text style={styles.timerHintGood}>Release when ready ✓</Text>
                  )}
                </>
              ) : (
                <Text style={styles.statusLabel}>Hold to speak</Text>
              )}
            </View>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.micBtn, status === 'recording' && styles.micBtnRecording]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                activeOpacity={0.85}
              >
                <Text style={styles.micIcon}>{status === 'recording' ? '⏹' : '🎙️'}</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push('/onboarding/level-select')}
        >
          <Text style={styles.skipText}>Skip — select level manually</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: '#111827' },
  progressTrack: { flex: 1, height: 4, backgroundColor: '#EFF6FF', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 4, gap: 20 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', lineHeight: 37 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 24 },
  promptCard: {
    backgroundColor: '#f8f7ff',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  promptLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  promptText: { fontSize: 17, fontWeight: '700', color: '#111827', lineHeight: 26 },
  tips: { gap: 6 },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 2 },
  tipRow: { flexDirection: 'row', gap: 6 },
  tipDot: { fontSize: 14, color: '#9ca3af', lineHeight: 20 },
  tipText: { fontSize: 13, color: '#6b7280', lineHeight: 20, flex: 1 },
  micArea: { alignItems: 'center', paddingBottom: 40, gap: 16 },
  statusLabel: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 24 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  timerText: { fontSize: 16, fontWeight: '700', color: '#111827', fontVariant: ['tabular-nums'] },
  timerHint: { fontSize: 13, color: '#9ca3af' },
  timerHintGood: { fontSize: 13, color: '#22c55e', fontWeight: '600' },
  micBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  micBtnRecording: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
  micIcon: { fontSize: 36 },
  analyzingWrap: { alignItems: 'center', gap: 12 },
  analyzingText: { fontSize: 15, color: '#2563EB', fontWeight: '600' },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'underline' },
});
