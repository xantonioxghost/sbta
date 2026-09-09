import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { SectionLabel } from '@/components/SectionLabel';
import { HealthProfile, usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
};

function ProfileField({ label, placeholder, value, onChangeText, multiline = false, keyboardType = 'default' }: FieldProps) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { profile, updateProfile } = usePosture();
  const [draft, setDraft] = useState<HealthProfile>(profile);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof HealthProfile, value: string) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    updateProfile(draft);
    setSaved(true);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 112 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <SectionLabel>Private to this phone</SectionLabel>
        <Text style={[styles.title, { color: colors.foreground }]}>Health profile</Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>A little context helps you understand your posture patterns. Add only what feels useful to you.</Text>
      </View>

      <SectionLabel>About you</SectionLabel>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ProfileField label="Name" placeholder="What should we call you?" value={draft.name} onChangeText={(value) => update('name', value)} />
        <View style={styles.row}>
          <View style={styles.half}><ProfileField label="Age" placeholder="Years" value={draft.age} onChangeText={(value) => update('age', value)} keyboardType="numeric" /></View>
          <View style={styles.half}><ProfileField label="Height" placeholder="e.g. 172 cm" value={draft.height} onChangeText={(value) => update('height', value)} /></View>
        </View>
        <ProfileField label="Weight" placeholder="Optional · e.g. 68 kg" value={draft.weight} onChangeText={(value) => update('weight', value)} />
      </View>

      <SectionLabel>Posture context</SectionLabel>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ProfileField label="Posture goal" placeholder="e.g. Reduce desk-related neck tension" value={draft.postureGoal} onChangeText={(value) => update('postureGoal', value)} multiline />
        <ProfileField label="Pain areas" placeholder="e.g. Neck, upper back, lower back" value={draft.painAreas} onChangeText={(value) => update('painAreas', value)} multiline />
        <ProfileField label="Past injuries" placeholder="Optional · anything relevant to your posture" value={draft.injuries} onChangeText={(value) => update('injuries', value)} multiline />
      </View>

      <SectionLabel>Medical considerations</SectionLabel>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ProfileField label="Conditions" placeholder="Optional · conditions you want to keep in mind" value={draft.conditions} onChangeText={(value) => update('conditions', value)} multiline />
        <ProfileField label="Mobility limitations" placeholder="Optional · movements or positions to avoid" value={draft.mobilityLimitations} onChangeText={(value) => update('mobilityLimitations', value)} multiline />
        <View style={[styles.notice, { backgroundColor: colors.accent }]}>
          <Icon name="alert-circle" size={16} color={colors.destructive} />
          <Text style={[styles.noticeText, { color: colors.accentForeground }]}>This profile is for personal tracking, not diagnosis or medical advice. Talk with a qualified professional about pain, injury, or mobility concerns.</Text>
        </View>
      </View>

      <Pressable testID="save-profile-button" onPress={save} style={({ pressed }) => [styles.save, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
        <Icon name={saved ? 'check' : 'check'} size={17} color={colors.primaryForeground} />
        <Text style={[styles.saveText, { color: colors.primaryForeground }]}>{saved ? 'Profile saved' : 'Save profile'}</Text>
      </Pressable>
      <Text style={[styles.privacy, { color: colors.mutedForeground }]}>Your profile is stored locally on this phone. It is not uploaded or shared.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 22, marginBottom: 26 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.6, marginTop: 8 },
  intro: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 10, maxWidth: 345 },
  group: { marginHorizontal: 22, borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 10, marginBottom: 27 },
  field: { marginBottom: 15 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginBottom: 7 },
  input: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, height: 44, fontFamily: 'Inter_400Regular', fontSize: 13 },
  multiline: { height: 76, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  notice: { flexDirection: 'row', gap: 9, padding: 12, borderRadius: 13, marginTop: 2 },
  noticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  save: { marginHorizontal: 22, height: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  privacy: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginHorizontal: 36, marginTop: 12, lineHeight: 16 },
});