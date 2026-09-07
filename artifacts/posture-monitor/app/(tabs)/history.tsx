import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel } from '@/components/SectionLabel';
import { usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';

const bars = [0.7, 0.82, 0.55, 0.88, 0.75, 0.95, 0.76];
const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { readings } = usePosture();
  const goodPercent = readings.length ? Math.round((readings.filter((reading) => reading.good).length / readings.length) * 100) : 94;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <SectionLabel>Your progress</SectionLabel>
          <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
        </View>
        <View style={[styles.period, { backgroundColor: colors.secondary }]}><Text style={[styles.periodText, { color: colors.secondaryForeground }]}>This week</Text><Feather name="chevron-down" size={14} color={colors.secondaryForeground} /></View>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryTop}><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>AVERAGE GOOD POSTURE</Text><Feather name="trending-up" size={18} color={colors.primary} /></View>
        <Text style={[styles.summaryValue, { color: colors.foreground }]}>{goodPercent}%</Text>
        <Text style={[styles.summarySub, { color: colors.primary }]}>+6% from last week</Text>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeading}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Good posture by day</Text><Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>%</Text></View>
        <View style={styles.bars}>
          {bars.map((height, index) => <View key={labels[index] + index} style={styles.barCol}><View style={[styles.barTrack, { backgroundColor: colors.muted }]}><View style={[styles.barFill, { height: `${height * 100}%`, backgroundColor: index === 5 ? colors.primary : colors.secondary }]} /></View><Text style={[styles.day, { color: colors.mutedForeground }]}>{labels[index]}</Text></View>)}
        </View>
      </View>

      <SectionLabel>Recent sessions</SectionLabel>
      <View style={[styles.session, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.sessionIcon, { backgroundColor: colors.secondary }]}><Feather name="sun" size={17} color={colors.primary} /></View>
        <View style={styles.sessionCopy}><Text style={[styles.sessionTitle, { color: colors.foreground }]}>Morning focus</Text><Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>Today · 42 min</Text></View>
        <View style={styles.sessionStat}><Text style={[styles.sessionValue, { color: colors.primary }]}>96%</Text><Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>aligned</Text></View>
      </View>
      <View style={[styles.session, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.sessionIcon, { backgroundColor: colors.accent }]}><Feather name="coffee" size={17} color={colors.destructive} /></View>
        <View style={styles.sessionCopy}><Text style={[styles.sessionTitle, { color: colors.foreground }]}>Afternoon work</Text><Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>Yesterday · 1 hr 18 min</Text></View>
        <View style={styles.sessionStat}><Text style={[styles.sessionValue, { color: colors.destructive }]}>87%</Text><Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>aligned</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.6, marginTop: 8 },
  period: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  periodText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  summary: { marginHorizontal: 22, borderWidth: 1, borderRadius: 22, padding: 20, marginBottom: 14 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 },
  summaryValue: { fontFamily: 'Inter_700Bold', fontSize: 50, letterSpacing: -1.8, marginTop: 10 },
  summarySub: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 2 },
  chartCard: { marginHorizontal: 22, borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 28 },
  cardHeading: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  cardMeta: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  bars: { height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 16 },
  barCol: { height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  barTrack: { width: 24, height: 126, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 12 },
  day: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  session: { marginHorizontal: 22, borderWidth: 1, borderRadius: 18, padding: 13, marginTop: 11, flexDirection: 'row', alignItems: 'center' },
  sessionIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sessionCopy: { flex: 1, marginLeft: 12 },
  sessionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  sessionMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  sessionStat: { alignItems: 'flex-end' },
  sessionValue: { fontFamily: 'Inter_700Bold', fontSize: 16 },
});