import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onContinue: () => void;
  continueLabel?: string;
  canContinue?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
};

export default function OnboardingStep({
  step,
  totalSteps,
  title,
  subtitle,
  onContinue,
  continueLabel = 'Continue',
  canContinue = true,
  scrollable = false,
  children,
}: Props) {
  const progress = step / totalSteps;

  const body = (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.bodySlot}>{children}</View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {scrollable ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {body}
        </ScrollView>
      ) : (
        body
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={onContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueBtnText}>{continueLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type OptionProps = {
  label: string;
  icon?: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionCard({ label, icon, subtitle, selected, onPress }: OptionProps) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
          <Ionicons name={icon as any} size={20} color={selected ? '#fff' : '#2563EB'} />
        </View>
      )}
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>{subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#111827' }, // kept for compat
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 4 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', lineHeight: 37, marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 24, lineHeight: 22 },
  bodySlot: { flex: 1, gap: 10 },
  footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
  continueBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  continueBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  optionIconText: { fontSize: 20 },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  optionLabelSelected: { color: '#fff' },
  optionSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  optionSubSelected: { color: '#BFDBFE' },
});
