import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { getOnboarding } from '../../lib/onboardingStore';

const STEPS = [
  'Analyzing your English level...',
  'Setting up your personalized scenarios...',
  'Calibrating difficulty for your goals...',
  'Preparing your AI tutor...',
  'Almost ready...',
];

export default function GeneratingScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = useState(0);
  const data = getOnboarding();

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3200,
      useNativeDriver: false,
    }).start();

    const intervals = STEPS.map((_, i) =>
      setTimeout(() => setStepIndex(i), i * 700)
    );

    const done = setTimeout(() => router.push('/paywall'), 3600);

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, []);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🗣️</Text>
        <Text style={styles.title}>Building your{'\n'}personalized tutor</Text>

        {data.goal && (
          <View style={styles.summaryRow}>
            <Tag label={data.goal} />
            {data.level && <Tag label={data.level} />}
            {data.language && <Tag label={data.language} />}
          </View>
        )}

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>

        <Text style={styles.stepText}>{STEPS[stepIndex]}</Text>
      </View>
    </SafeAreaView>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', textAlign: 'center', lineHeight: 38 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tag: { backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tagText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 3 },
  stepText: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
});
