import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { SpineVisual } from '@/components/SpineVisual';
import { useAuth } from '@/context/AuthContext';
import { usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';
import { SPINE_TYPES, SpineType } from '@/lib/exercises';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { signUp } = useAuth();
  const { updateProfile } = usePosture();

  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedSpineType, setSelectedSpineType] = useState<SpineType>('kyphosis');
  const [postureGoal, setPostureGoal] = useState('');
  const [painAreas, setPainAreas] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please complete all account fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }
    setErrorMsg(null);
    setStep((current) => current + 1);
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    setErrorMsg(null);

    // 1. Register with Supabase Auth
    const { session, error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error);
      return;
    }

    // 2. Save health profile & spine type to context + Supabase
    updateProfile({
      name: name.trim(),
      age: age.trim(),
      height: height.trim(),
      weight: weight.trim(),
      postureGoal: postureGoal.trim() || 'Improve overall alignment & comfort',
      painAreas: painAreas.trim(),
      injuries: '',
      conditions: '',
      mobilityLimitations: '',
      spineType: selectedSpineType,
    });

    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressStepRow}>
            {[1, 2, 3, 4].map((num) => (
              <View
                key={num}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: num <= step ? colors.primary : colors.muted,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.stepText, { color: colors.mutedForeground }]}>Step {step} of 4</Text>
        </View>

        {errorMsg && (
          <View style={[styles.errorCard, { backgroundColor: colors.accent, borderColor: colors.destructive }]}>
            <Icon name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.accentForeground }]}>{errorMsg}</Text>
          </View>
        )}

        {/* STEP 1: Account Information */}
        {step === 1 && (
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>CREATE ACCOUNT</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome to Posture Monitor</Text>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>
              Let's create your account and personalize your posture routine.
            </Text>

            <View style={styles.formGroup}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>FULL NAME</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Icon name="user" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Alex Morgan"
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL ADDRESS</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Icon name="mail" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PASSWORD</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Icon name="lock" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleNextStep}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Continue</Text>
              <Icon name="arrow-right" size={18} color={colors.primaryForeground} />
            </Pressable>
          </View>
        )}

        {/* STEP 2: Physical Details */}
        {step === 2 && (
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>ABOUT YOU</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Your Physical Context</Text>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>
              Basic metrics help us tune your baseline alignment thresholds.
            </Text>

            <View style={styles.formGroup}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>AGE</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="e.g. 28"
                    placeholderTextColor={colors.mutedForeground}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.field, styles.half]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>HEIGHT</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="e.g. 175 cm"
                      placeholderTextColor={colors.mutedForeground}
                      value={height}
                      onChangeText={setHeight}
                    />
                  </View>
                </View>

                <View style={[styles.field, styles.half]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>WEIGHT (OPTIONAL)</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="e.g. 70 kg"
                      placeholderTextColor={colors.mutedForeground}
                      value={weight}
                      onChangeText={setWeight}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.navRow}>
              <Pressable
                onPress={() => setStep(1)}
                style={({ pressed }) => [styles.backBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleNextStep}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { flex: 1, backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Continue</Text>
                <Icon name="arrow-right" size={18} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 3: Spine Posture Classification */}
        {step === 3 && (
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>POSTURE TYPE</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>What's your spine posture?</Text>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>
              Select the posture shape that best describes your back to unlock custom daily exercises.
            </Text>

            <View style={styles.spineList}>
              {SPINE_TYPES.map((type) => {
                const isSelected = selectedSpineType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => setSelectedSpineType(type.id)}
                    style={[
                      styles.spineCard,
                      {
                        backgroundColor: isSelected ? colors.secondary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View style={[styles.spineVisualWrapper, { backgroundColor: isSelected ? colors.card : colors.secondary }]}>
                        <SpineVisual type={type.id} size={34} active={isSelected} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={styles.spineCardTop}>
                          <Text style={[styles.spineCardTitle, { color: colors.foreground }]}>{type.title}</Text>
                          <View style={[styles.badge, { backgroundColor: isSelected ? colors.primary : colors.muted }]}>
                            <Text
                              style={[
                                styles.badgeText,
                                { color: isSelected ? colors.primaryForeground : colors.mutedForeground },
                              ]}
                            >
                              {type.badge}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.spineCardSub, { color: colors.mutedForeground }]}>{type.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.navRow}>
              <Pressable
                onPress={() => setStep(2)}
                style={({ pressed }) => [styles.backBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleNextStep}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { flex: 1, backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Continue</Text>
                <Icon name="arrow-right" size={18} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 4: Goals & Pain Areas */}
        {step === 4 && (
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR GOALS</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Posture Goals</Text>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>
              Tell us what areas you'd like to improve.
            </Text>

            <View style={styles.formGroup}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>POSTURE GOAL</Text>
                <View style={[styles.inputContainer, styles.multilineContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, styles.multilineInput, { color: colors.foreground }]}
                    placeholder="e.g. Reduce neck tension from desk work"
                    placeholderTextColor={colors.mutedForeground}
                    value={postureGoal}
                    onChangeText={setPostureGoal}
                    multiline
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PAIN / TENSION AREAS (OPTIONAL)</Text>
                <View style={[styles.inputContainer, styles.multilineContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, styles.multilineInput, { color: colors.foreground }]}
                    placeholder="e.g. Upper back, neck, lower lumbar"
                    placeholderTextColor={colors.mutedForeground}
                    value={painAreas}
                    onChangeText={setPainAreas}
                    multiline
                  />
                </View>
              </View>
            </View>

            <View style={styles.navRow}>
              <Pressable
                onPress={() => setStep(3)}
                style={({ pressed }) => [styles.backBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleFinishOnboarding}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { flex: 1, backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <>
                    <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Finish Setup</Text>
                    <Icon name="check" size={18} color={colors.primaryForeground} />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  progressHeader: { marginBottom: 24, gap: 8 },
  progressStepRow: { flexDirection: 'row', gap: 6 },
  progressDot: { flex: 1, height: 6, borderRadius: 3 },
  stepText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7 },
  subTitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 20 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13 },
  formGroup: { gap: 16, marginBottom: 24 },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14 },
  multilineContainer: { height: 80, alignItems: 'flex-start', paddingTop: 12 },
  multilineInput: { height: 56, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  spineList: { gap: 12, marginBottom: 24 },
  spineCard: { padding: 14, borderRadius: 16, borderWidth: 1 },
  spineVisualWrapper: { width: 44, height: 58, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  spineCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spineCardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  spineCardSub: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  navRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});
