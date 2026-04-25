import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../lib/supabase';
import { getOnboarding } from '../lib/onboardingStore';

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  async function handleApple() {
    setLoadingApple(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (error) throw error;
      if (data.user && credential.fullName?.givenName) {
        await supabase.auth.updateUser({
          data: {
            full_name: `${credential.fullName.givenName} ${credential.fullName.familyName ?? ''}`.trim(),
          },
        });
      }
      const user = data.user;
      if (user) {
        const { data: existing } = await supabase.from('user_profiles').select('id').eq('id', user.id).single();
        if (!existing) {
          const ob = getOnboarding();
          await supabase.from('user_profiles').insert({
            id: user.id,
            cefr_level: ob.level ?? null,
            native_language: ob.language ?? null,
            goal: ob.goal ?? null,
          });
          router.replace('/onboarding/name');
          return;
        }
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', e.message ?? 'Apple sign in failed.');
      }
    } finally {
      setLoadingApple(false);
    }
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('No ID token returned from Google.');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      const user = data.user;
      if (user) {
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        if (!existing) {
          const ob = getOnboarding();
          await supabase.from('user_profiles').insert({
            id: user.id,
            cefr_level: ob.level ?? null,
            native_language: ob.language ?? null,
            goal: ob.goal ?? null,
          });
          router.replace('/onboarding/name');
          return;
        }
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Error', e.message ?? 'Google sign in failed.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  }

  async function handleEmail() {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const user = data.user;
        if (!user) {
          // Email confirmation is on — user needs to verify before signing in
          Alert.alert(
            'Check your email',
            `We sent a confirmation link to ${email}. Please verify your email then sign in.`,
          );
          return;
        }
        const ob = getOnboarding();
        await supabase.from('user_profiles').insert({
          id: user.id,
          cefr_level: ob.level ?? null,
          native_language: ob.language ?? null,
          goal: ob.goal ?? null,
        });
        router.replace('/onboarding/name');
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.top}>
          <Text style={styles.logo}>🗣️</Text>
          <Text style={styles.title}>EnglishNow</Text>
          <Text style={styles.subtitle}>Practice English through real conversation</Text>
        </View>

        <View style={styles.buttons}>
          {/* Apple */}
          <TouchableOpacity
            style={[styles.socialBtn, styles.appleBtn]}
            onPress={handleApple}
            disabled={loadingApple}
            activeOpacity={0.85}
          >
            {loadingApple ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <Text style={[styles.socialBtnText, styles.appleBtnText]}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity
            style={[styles.socialBtn, styles.googleBtn]}
            onPress={handleGoogle}
            disabled={loadingGoogle}
            activeOpacity={0.85}
          >
            {loadingGoogle ? (
              <ActivityIndicator color="#374151" size="small" />
            ) : (
              <>
                <AntDesign name="google" size={18} color="#EA4335" />
                <Text style={[styles.socialBtnText, styles.googleBtnText]}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email toggle */}
          {!showEmail ? (
            <TouchableOpacity
              style={[styles.socialBtn, styles.emailBtn]}
              onPress={() => setShowEmail(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={20} color="#374151" />
              <Text style={[styles.socialBtnText, styles.emailBtnText]}>Continue with Email</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emailForm}>
              <Text style={styles.formTitle}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleEmail} disabled={loading} activeOpacity={0.9}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                <Text style={styles.toggleText}>
                  {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { flex: 1, justifyContent: 'space-between', padding: 24 },

  top: { alignItems: 'center', paddingTop: 40, gap: 8 },
  logo: { fontSize: 56 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },

  buttons: { gap: 12, paddingBottom: 16 },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 10,
  },
  appleBtn: { backgroundColor: '#000' },
  appleBtnText: { color: '#fff' },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  googleBtnText: { color: '#374151' },
  emailBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  emailBtnText: { color: '#374151' },
  socialBtnText: { fontSize: 15, fontWeight: '600' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },

  emailForm: { gap: 10 },
  formTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggleBtn: { alignItems: 'center', paddingVertical: 6 },
  toggleText: { color: '#2563EB', fontSize: 14, fontWeight: '500' },

  skipBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  skipText: { color: '#9ca3af', fontSize: 13 },
});
