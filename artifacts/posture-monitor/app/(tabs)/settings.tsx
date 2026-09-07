import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel } from '@/components/SectionLabel';
import { usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';

function SettingRow({ icon, title, subtitle, children }: { icon: keyof typeof Feather.glyphMap; title: string; subtitle?: string; children?: React.ReactNode }) {
  const colors = useColors();
  return <View style={[styles.row, { borderBottomColor: colors.border }]}><View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={17} color={colors.primary} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>{subtitle && <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}</View>{children}</View>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { preferences, updatePreferences, status, connect, disconnect } = usePosture();
  const thresholds = [10, 15, 20, 25, 30];
  const delays = [3, 5, 8, 12, 20];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><SectionLabel>Make it yours</SectionLabel><Text style={[styles.title, { color: colors.foreground }]}>Settings</Text></View>

      <SectionLabel>Alerts</SectionLabel>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="target" title="Sensitivity" subtitle={`Alert when deviation exceeds ${preferences.threshold}°`}><Text style={[styles.rowValue, { color: colors.primary }]}>{preferences.threshold}°</Text></SettingRow>
        <View style={styles.chips}>{thresholds.map((value) => <Pressable key={value} onPress={() => updatePreferences({ threshold: value })} style={[styles.chip, { backgroundColor: value === preferences.threshold ? colors.primary : colors.muted }]}><Text style={[styles.chipText, { color: value === preferences.threshold ? colors.primaryForeground : colors.mutedForeground }]}>{value}°</Text></Pressable>)}</View>
        <SettingRow icon="clock" title="Alert delay" subtitle="Time in bad posture before a reminder"><Text style={[styles.rowValue, { color: colors.primary }]}>{preferences.delay}s</Text></SettingRow>
        <View style={styles.chips}>{delays.map((value) => <Pressable key={value} onPress={() => updatePreferences({ delay: value })} style={[styles.chip, { backgroundColor: value === preferences.delay ? colors.primary : colors.muted }]}><Text style={[styles.chipText, { color: value === preferences.delay ? colors.primaryForeground : colors.mutedForeground }]}>{value}s</Text></Pressable>)}</View>
        <SettingRow icon="bell" title="In-app reminders" subtitle="Gentle feedback when you need to reset"><Switch value={preferences.notifications} onValueChange={(value) => updatePreferences({ notifications: value })} trackColor={{ false: colors.muted, true: colors.secondary }} thumbColor={preferences.notifications ? colors.primary : colors.mutedForeground} /></SettingRow>
        <SettingRow icon="smartphone" title="Phone vibration" subtitle="Haptic feedback with reminders"><Switch value={preferences.vibration} onValueChange={(value) => updatePreferences({ vibration: value })} trackColor={{ false: colors.muted, true: colors.secondary }} thumbColor={preferences.vibration ? colors.primary : colors.mutedForeground} /></SettingRow>
      </View>

      <SectionLabel>Wearable</SectionLabel>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="bluetooth" title="PostureBelt" subtitle={status === 'connected' ? 'Connected and tracking' : 'Ready to connect'}><View style={[styles.status, { backgroundColor: status === 'connected' ? colors.secondary : colors.muted }]}><Text style={[styles.statusText, { color: status === 'connected' ? colors.primary : colors.mutedForeground }]}>{status === 'connected' ? 'Active' : 'Offline'}</Text></View></SettingRow>
        <Pressable onPress={status === 'connected' ? disconnect : connect} style={({ pressed }) => [styles.manage, { opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.manageText, { color: colors.primary }]}>{status === 'connected' ? 'Disconnect wearable' : 'Connect wearable'}</Text><Feather name="chevron-right" size={16} color={colors.primary} /></Pressable>
      </View>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Your posture data stays on this phone. No account or cloud connection is needed.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 22, marginBottom: 28 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.6, marginTop: 8 },
  group: { marginHorizontal: 22, borderWidth: 1, borderRadius: 20, overflow: 'hidden', marginTop: 10, marginBottom: 27 },
  row: { minHeight: 68, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, marginLeft: 11 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  rowSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  rowValue: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  chips: { flexDirection: 'row', gap: 7, padding: 14, paddingTop: 0 },
  chip: { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 8 },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  status: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  manage: { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  manageText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  footer: { marginHorizontal: 30, textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17 },
});