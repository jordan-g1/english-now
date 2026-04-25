import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { AudioModule, useAudioRecorder, useAudioPlayer, useAudioPlayerStatus, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { sessionStore, type Message, type Correction } from '../lib/sessionStore';

const SCENARIO_LABELS: Record<string, string> = {
  free:        'Open Chat',
  restaurant:  'Ordering Food',
  interview:   'Job Interview',
  smalltalk:   'Small Talk',
  doctor:      'Doctor Visit',
  shopping:    'Shopping',
};

const SCENARIO_OPENERS: Record<string, string> = {
  free:       "Hey! I'm here to chat. What's on your mind?",
  restaurant: "Good evening! Welcome in. I'll be your server tonight — can I start you off with something to drink?",
  interview:  "Hi, thanks for coming in today! I've had a look at your resume. So — tell me a little about yourself.",
  smalltalk:  "Hey! Crazy weather lately, right? Did you do anything fun this weekend?",
  doctor:     "Hello! I'm Dr. Smith. What brings you in today?",
  shopping:   "Hi there! Welcome. Are you looking for anything in particular today?",
};

type Status = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';

const STATUS_LABEL: Record<Status, string> = {
  idle:        'Hold to speak',
  recording:   'Listening...',
  transcribing:'Transcribing...',
  thinking:    'Thinking...',
  speaking:    'Speaking...',
};

export default function ConversationScreen() {
  const { scenario = 'free' } = useLocalSearchParams<{ scenario: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [typeMode, setTypeMode] = useState(false);
  const [typeInput, setTypeInput] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    sessionStore.reset();
    sessionStore.set({ scenario });

    const opener: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      text: SCENARIO_OPENERS[scenario] ?? SCENARIO_OPENERS.free,
    };
    setMessages([opener]);

    return () => {
      try { player.remove(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  useEffect(() => {
    if (playerStatus.didJustFinish && status === 'speaking') {
      setStatus('idle');
      AudioModule.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    }
  }, [playerStatus.didJustFinish]);

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 500, useNativeDriver: true }),
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
      const { status: permStatus } = await AudioModule.requestRecordingPermissionsAsync();
      if (permStatus !== 'granted') {
        Alert.alert('Microphone permission required', 'Please allow microphone access in your device settings.');
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      await recorder.record();
      setStatus('recording');
      startPulse();
    } catch (e) {
      console.error('Recording error:', e);
      Alert.alert('Microphone error', 'Could not start recording. Please try again.');
    }
  }

  async function stopRecording() {
    if (status !== 'recording') return;
    stopPulse();
    setStatus('transcribing');

    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) throw new Error('No audio recorded');

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Transcribe
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe', {
        body: { audio: base64, mimeType: 'audio/m4a' },
      });

      if (transcribeError) throw new Error(transcribeError.message);

      const userText: string = transcribeData.text?.trim();
      if (!userText) {
        setStatus('idle');
        return;
      }

      await processUserInput(userText);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  async function sendTyped() {
    const text = typeInput.trim();
    if (!text || isProcessing) return;
    setTypeInput('');
    await processUserInput(text);
  }

  async function processUserInput(userText: string) {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: userText };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      sessionStore.set({ messages: updated });
      return updated;
    });

    setStatus('thinking');

    const chatHistory = [...messages, userMessage].map((m) => ({ role: m.role, content: m.text }));

    const { data: { user } } = await supabase.auth.getUser();
    const { data: chatData, error: chatError } = await supabase.functions.invoke('chat', {
      body: { messages: chatHistory, scenario, userId: user?.id ?? null },
    });

    if (chatError) {
      Alert.alert('Error', 'Could not get a response. Please try again.');
      setStatus('idle');
      return;
    }

    const reply: string = chatData.reply ?? '';
    const correction = chatData.correction ?? null;

    const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: reply };

    setMessages((prev) => {
      const updated = [...prev, aiMessage];
      sessionStore.set({ messages: updated });
      return updated;
    });

    if (correction) {
      const taggedCorrection = { ...correction, messageId: userMessage.id };
      setCorrections((prev) => {
        const updated = [...prev, taggedCorrection];
        sessionStore.set({ corrections: updated });
        return updated;
      });
    }

    setStatus('speaking');
    await AudioModule.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

    const { data: speakData, error: speakError } = await supabase.functions.invoke('speak', {
      body: { text: reply },
    });

    if (!speakError && speakData?.audio) {
      const audioPath = `${FileSystem.cacheDirectory}tts_response.mp3`;
      await FileSystem.writeAsStringAsync(audioPath, speakData.audio, { encoding: 'base64' });
      player.replace({ uri: audioPath });
      player.play();
    } else {
      setStatus('idle');
      await AudioModule.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    }
  }

  function endSession() {
    Alert.alert('End session?', 'You\'ll see your corrections and summary.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'End session',
        style: 'destructive',
        onPress: () => {
          try { player.remove(); } catch (_) {}
          router.replace('/session-summary');
        },
      },
    ]);
  }

  const isProcessing = status === 'transcribing' || status === 'thinking' || status === 'speaking';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={endSession} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.scenarioLabel}>{SCENARIO_LABELS[scenario] ?? 'Conversation'}</Text>
        <TouchableOpacity onPress={endSession} style={styles.endBtn}>
          <Text style={styles.endBtnText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const correction = corrections.find((c) => c.messageId === msg.id);
          return (
            <View key={msg.id} style={styles.messageGroup}>
              <View style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI,
                ]}>
                  {msg.text}
                </Text>
              </View>
              {correction && (
                <View style={styles.correctionCard}>
                  <View style={styles.correctionHeader}>
                    <Ionicons name="bulb-outline" size={13} color="#D97706" />
                    <Text style={styles.correctionLabel}>Suggestion</Text>
                  </View>
                  <Text style={styles.correctionCorrected}>"{correction.corrected}"</Text>
                  <Text style={styles.correctionExplanation}>{correction.explanation}</Text>
                </View>
              )}
            </View>
          );
        })}
        {isProcessing && (
          <View style={[styles.bubble, styles.bubbleAI]}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Mic / type area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {typeMode ? (
          <View style={styles.typeArea}>
            <TextInput
              style={styles.typeInput}
              value={typeInput}
              onChangeText={setTypeInput}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              multiline
              editable={!isProcessing}
              onSubmitEditing={sendTyped}
              returnKeyType="send"
            />
            <View style={styles.typeRow}>
              <TouchableOpacity onPress={() => { setTypeMode(false); setTypeInput(''); }} style={styles.typeCancelBtn}>
                <Ionicons name="mic-outline" size={18} color="#2563EB" />
                <Text style={styles.typeCancelText}>Use mic</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeSendBtn, (!typeInput.trim() || isProcessing) && styles.typeSendBtnDisabled]}
                onPress={sendTyped}
                disabled={!typeInput.trim() || isProcessing}
              >
                {isProcessing
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="arrow-up" size={18} color="#fff" />
                }
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.micArea}>
            <Text style={styles.statusLabel}>{STATUS_LABEL[status]}</Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  status === 'recording' && styles.micBtnRecording,
                  isProcessing && styles.micBtnDisabled,
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                activeOpacity={0.85}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Ionicons name={status === 'recording' ? 'stop' : 'mic'} size={36} color="#fff" />
                )}
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity onPress={() => setTypeMode(true)} style={styles.typeToggleBtn}>
              <Text style={styles.typeToggleText}>Type instead</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF6FF',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  endBtn: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  endBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },


  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 10 },

  messageGroup: { gap: 6 },

  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: '#111827' },

  correctionCard: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    gap: 4,
  },
  correctionHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  correctionLabel: { fontSize: 11, fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.4 },
  correctionCorrected: { fontSize: 14, fontWeight: '600', color: '#111827' },
  correctionExplanation: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  micArea: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  statusLabel: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  micBtnRecording: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  micBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowColor: '#9ca3af',
  },
  typeToggleBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  typeToggleText: { fontSize: 13, color: '#9ca3af' },

  typeArea: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
  },
  typeInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  typeCancelText: { fontSize: 13, color: '#2563EB', fontWeight: '500' },
  typeSendBtn: {
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSendBtnDisabled: { backgroundColor: '#d1d5db' },
});
