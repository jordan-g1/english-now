import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SCENARIOS = [
  { label: 'Job Interview',  icon: 'briefcase-outline',  accent: '#2563EB', bg: '#EFF6FF' },
  { label: 'Ordering Food',  icon: 'restaurant-outline', accent: '#F97316', bg: '#FFF7ED' },
  { label: 'Small Talk',     icon: 'sunny-outline',      accent: '#EAB308', bg: '#FEFCE8' },
  { label: 'Doctor Visit',   icon: 'medkit-outline',     accent: '#EF4444', bg: '#FEF2F2' },
  { label: 'Shopping',       icon: 'bag-outline',        accent: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Open Chat',      icon: 'chatbubbles-outline',accent: '#16A34A', bg: '#F0FDF4' },
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function Slide1() {
  return (
    <View style={styles.slide}>
      <View style={styles.visual}>
        <View style={styles.tutorCard}>
          <View style={styles.tutorHeader}>
            <View style={styles.tutorAvatar}>
              <Ionicons name="person" size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tutorName}>AI Tutor</Text>
              <View style={styles.tutorOnlineRow}>
                <View style={styles.tutorOnlineDot} />
                <Text style={styles.tutorOnlineText}>Ready to practice</Text>
              </View>
            </View>
            <View style={styles.scenarioBadge}>
              <Text style={styles.scenarioBadgeText}>Job Interview</Text>
            </View>
          </View>

          <View style={styles.tutorBubble}>
            <Text style={styles.tutorBubbleText}>
              "Tell me about yourself — what do you do for work?"
            </Text>
          </View>

          <View style={styles.yourTurnRow}>
            <View style={styles.yourTurnDivider} />
            <Text style={styles.yourTurnLabel}>Your turn to respond</Text>
            <View style={styles.yourTurnDivider} />
          </View>

          <View style={styles.tutorMicRow}>
            <View style={styles.tutorMicBtn}>
              <Ionicons name="mic" size={28} color="#fff" />
            </View>
            <View style={styles.tutorWaveform}>
              {[14, 22, 18, 30, 24, 18, 26, 14, 20, 28, 16, 22].map((h, i) => (
                <View key={i} style={[styles.tutorBar, { height: h, opacity: i < 5 ? 1 : 0.25 }]} />
              ))}
            </View>
          </View>

          <Text style={styles.tutorHint}>Hold to speak · Release to send</Text>
        </View>
      </View>
      <Text style={styles.headline}>Speak English{'\n'}with confidence</Text>
      <Text style={styles.sub}>Real conversations with an AI tutor that actually talks back — no scripts, no drills.</Text>
    </View>
  );
}

function Slide2() {
  return (
    <View style={styles.slide}>
      <View style={styles.visual}>
        <View style={styles.correctionCard}>
          <View style={styles.correctionRow}>
            <View style={styles.tagRed}><Text style={styles.tagRedText}>You said</Text></View>
            <Text style={styles.correctionOriginal}>"I go to store yesterday"</Text>
          </View>
          <View style={styles.correctionDivider} />
          <View style={styles.correctionRow}>
            <View style={styles.tagGreen}><Text style={styles.tagGreenText}>Better</Text></View>
            <Text style={styles.correctionFixed}>"I went to the store yesterday"</Text>
          </View>
          <View style={styles.correctionWhy}>
            <Text style={styles.correctionWhyLabel}>WHY</Text>
            <Text style={styles.correctionWhyText}>Use past tense "went" for completed actions.</Text>
          </View>
        </View>
      </View>
      <Text style={styles.headline}>Know exactly{'\n'}what to fix</Text>
      <Text style={styles.sub}>After every session you'll see your mistakes and how to say it better — clearly explained.</Text>
    </View>
  );
}

function Slide3() {
  return (
    <View style={styles.slide}>
      <View style={styles.visual}>
        <View style={styles.levelCard}>
          <Text style={styles.levelCardLabel}>YOUR LEVEL</Text>
          <View style={styles.levelBarWrap}>
            {LEVELS.map((l, i) => (
              <View key={l} style={[styles.levelSegment, i < LEVELS.length - 1 && { marginRight: 4 }]}>
                <View style={[styles.levelFill, i <= 2 && styles.levelFillActive]} />
                <Text style={[styles.levelText, i === 2 && styles.levelTextActive]}>{l}</Text>
              </View>
            ))}
          </View>
          <View style={styles.levelStats}>
            <View style={styles.levelStat}>
              <Text style={styles.levelStatNum}>47</Text>
              <Text style={styles.levelStatLabel}>sessions</Text>
            </View>
            <View style={styles.levelStatDivider} />
            <View style={styles.levelStat}>
              <Text style={styles.levelStatNum}>+2</Text>
              <Text style={styles.levelStatLabel}>levels up</Text>
            </View>
            <View style={styles.levelStatDivider} />
            <View style={styles.levelStat}>
              <Text style={styles.levelStatNum}>30</Text>
              <Text style={styles.levelStatLabel}>day streak</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.headline}>Built around{'\n'}your level</Text>
      <Text style={styles.sub}>From A1 beginner to C2 fluent — your tutor adapts to exactly where you are and pushes you forward.</Text>
    </View>
  );
}

function Slide4() {
  return (
    <View style={styles.slide}>
      <View style={styles.visual}>
        <View style={styles.scenarioGrid}>
          {SCENARIOS.map((s) => (
            <View key={s.label} style={styles.scenarioCard}>
              <View style={[styles.scenarioIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={24} color={s.accent} />
              </View>
              <Text style={styles.scenarioLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.headline}>Ready for any{'\n'}situation</Text>
      <Text style={styles.sub}>Job interviews, travel, the doctor's office — practice what actually comes up in real life.</Text>
    </View>
  );
}

const SLIDES = [Slide1, Slide2, Slide3, Slide4];

export default function SplashScreen() {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function goToPage(i: number) {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setPage(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        style={{ flex: 1 }}
      >
        {SLIDES.map((Slide, i) => (
          <View key={i} style={{ width }}>
            <Slide />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goToPage(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <View style={[styles.dot, i === page && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push('/onboarding/how-it-works')}
          activeOpacity={0.9}
        >
          <Text style={styles.startBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth')}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  slide: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },

  visual: {
    width: '100%',
    alignItems: 'center',
  },

  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingBottom: 8,
  },

  // Slide 1 — tutor card
  tutorCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    gap: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tutorHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tutorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  tutorOnlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  tutorOnlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
  tutorOnlineText: { fontSize: 12, color: '#16A34A', fontWeight: '500' },
  tutorBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tutorBubbleText: { fontSize: 16, color: '#111827', lineHeight: 25, fontStyle: 'italic' },
  tutorMicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  tutorMicBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tutorWaveform: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tutorBar: { width: 4, borderRadius: 2, backgroundColor: '#2563EB' },
  tutorHint: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  scenarioBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scenarioBadgeText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  yourTurnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  yourTurnDivider: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  yourTurnLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },

  // Slide 2 — correction
  correctionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  correctionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' },
  correctionDivider: { height: 1, backgroundColor: '#F3F4F6' },
  tagRed: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagRedText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  tagGreen: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagGreenText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  correctionOriginal: { fontSize: 16, color: '#EF4444', flex: 1, lineHeight: 24 },
  correctionFixed: { fontSize: 16, color: '#16A34A', fontWeight: '700', flex: 1, lineHeight: 24 },
  correctionWhy: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, gap: 5 },
  correctionWhyLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5 },
  correctionWhyText: { fontSize: 14, color: '#374151', lineHeight: 22 },

  // Slide 3 — level
  levelCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  levelCardLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8 },
  levelBarWrap: { flexDirection: 'row', gap: 4 },
  levelSegment: { flex: 1, gap: 8, alignItems: 'center' },
  levelFill: { height: 12, width: '100%', borderRadius: 6, backgroundColor: '#E5E7EB' },
  levelFillActive: { backgroundColor: '#2563EB' },
  levelText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  levelTextActive: { color: '#2563EB', fontWeight: '800' },
  levelStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  levelStat: { alignItems: 'center', gap: 3 },
  levelStatNum: { fontSize: 32, fontWeight: '800', color: '#111827' },
  levelStatLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  levelStatDivider: { width: 1, height: 40, backgroundColor: '#F3F4F6' },

  // Slide 4 — scenarios
  scenarioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  scenarioCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  scenarioIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  scenarioLabel: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 14,
    backgroundColor: '#fff',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  dotActive: { width: 20, backgroundColor: '#2563EB', borderRadius: 3 },

  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signInText: { textAlign: 'center', fontSize: 14, color: '#6B7280' },
  signInBold: { fontWeight: '700', color: '#2563EB' },
});
