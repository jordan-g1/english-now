import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    const trimmed = name.trim();
    if (!trimmed) {
      router.replace('/(tabs)');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').update({ first_name: trimmed }).eq('id', user.id);
      }
    } catch (_) {
      // non-fatal — name is just a nice-to-have
    } finally {
      setLoading(false);
      router.replace('/(tabs)');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>What's your first name?</Text>
          <Text style={styles.sub}>So we can make things a little more personal.</Text>

          <TextInput
            style={styles.input}
            placeholder="Your first name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, (!name.trim() || loading) && styles.btnMuted]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Saving…' : 'Continue'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
            <Text style={styles.skip}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, paddingHorizontal: 24 },

  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  emoji: { fontSize: 48, marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, lineHeight: 38, letterSpacing: -0.3 },
  sub: { fontSize: 16, color: colors.textSub, lineHeight: 24, marginBottom: 8 },

  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },

  footer: {
    paddingBottom: 36,
    gap: 14,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  btnMuted: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skip: { textAlign: 'center', fontSize: 14, color: colors.textMuted },
});
