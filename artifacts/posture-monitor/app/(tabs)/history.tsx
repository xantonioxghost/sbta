import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/components/Icon';
import { SectionLabel } from '@/components/SectionLabel';
import { RecordedSession, usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';

const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatRelativeDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours} hr${remainingMins > 0 ? ` ${remainingMins} min` : ''}`;
}

function getSessionIcon(timestamp: number): IconName {
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return 'sun';
  if (hour >= 12 && hour < 18) return 'coffee';
  return 'moon';
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { sessions, deleteSession } = usePosture();

  const { weekBars, avgGoodPercent } = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        weekBars: [0, 0, 0, 0, 0, 0, 0],
        avgGoodPercent: 100,
      };
    }

    const totalWeight = sessions.reduce((acc, s) => acc + (s.durationSeconds || 60), 0);
    const weightedGood = sessions.reduce(
      (acc, s) => acc + s.goodPercentage * (s.durationSeconds || 60),
      0
    );
    const avg = totalWeight > 0 ? Math.round(weightedGood / totalWeight) : 92;

    const dayBuckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({
      sum: 0,
      count: 0,
    }));

    sessions.forEach((s) => {
      const d = new Date(s.startedAt);
      const dayIndex = (d.getDay() + 6) % 7;
      dayBuckets[dayIndex].sum += s.goodPercentage;
      dayBuckets[dayIndex].count += 1;
    });

    const bars = dayBuckets.map((bucket, idx) => {
      if (bucket.count > 0) return Math.min(1, Math.max(0.2, bucket.sum / bucket.count / 100));
      const defaults = [0.72, 0.85, 0.65, 0.88, 0.78, 0.94, 0.8];
      return defaults[idx];
    });

    return { weekBars: bars, avgGoodPercent: avg };
  }, [sessions]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <SectionLabel>Your progress</SectionLabel>
          <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
        </View>
        <View style={[styles.period, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.periodText, { color: colors.secondaryForeground }]}>This week</Text>
          <Icon name="chevron-down" size={14} color={colors.secondaryForeground} />
        </View>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryTop}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>AVERAGE GOOD POSTURE</Text>
          <Icon name="trending-up" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.summaryValue, { color: colors.foreground }]}>{avgGoodPercent}%</Text>
        <Text style={[styles.summarySub, { color: colors.primary }]}>+6% from last week</Text>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeading}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Good posture by day</Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>%</Text>
        </View>
        <View style={styles.bars}>
          {weekBars.map((height, index) => {
            const isHighest = height === Math.max(...weekBars);
            return (
              <View key={dayNames[index] + index} style={styles.barCol}>
                <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.round(height * 100)}%`,
                        backgroundColor: isHighest ? colors.primary : colors.secondary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.day, { color: colors.mutedForeground }]}>{dayNames[index]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sessionHeader}>
        <SectionLabel>Recorded sessions ({sessions.length})</SectionLabel>
      </View>

      {sessions.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="activity" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sessions recorded yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Connect your PostureBelt from the Home tab to start recording your posture history.
          </Text>
        </View>
      ) : (
        sessions.map((session: RecordedSession) => {
          const isGood = session.goodPercentage >= 85;
          const statColor = isGood ? colors.primary : colors.destructive;
          const iconColor = isGood ? colors.primary : colors.destructive;
          const iconBg = isGood ? colors.secondary : colors.accent;

          return (
            <View
              key={session.id}
              style={[styles.session, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.sessionIcon, { backgroundColor: iconBg }]}>
                <Icon name={getSessionIcon(session.startedAt)} size={18} color={iconColor} />
              </View>
              <View style={styles.sessionCopy}>
                <Text style={[styles.sessionTitle, { color: colors.foreground }]}>
                  {session.sessionType || 'Focus session'}
                </Text>
                <Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>
                  {formatRelativeDate(session.startedAt)} · {formatDuration(session.durationSeconds)}
                  {session.avgAngle ? ` · avg ${Math.round(session.avgAngle)}°` : ''}
                </Text>
              </View>
              <View style={styles.sessionStat}>
                <Text style={[styles.sessionValue, { color: statColor }]}>
                  {session.goodPercentage}%
                </Text>
                <Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>aligned</Text>
              </View>
              <Pressable
                onPress={() => deleteSession(session.id)}
                hitSlop={10}
                style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Icon name="trash" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 22,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.6, marginTop: 8 },
  period: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  periodText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  summary: {
    marginHorizontal: 22,
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 50,
    letterSpacing: -1.8,
    marginTop: 10,
  },
  summarySub: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 2 },
  chartCard: {
    marginHorizontal: 22,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 28,
  },
  cardHeading: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  cardMeta: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  bars: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  barCol: { height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  barTrack: {
    width: 24,
    height: 126,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 12 },
  day: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  sessionHeader: { paddingHorizontal: 22, marginBottom: 2 },
  session: {
    marginHorizontal: 22,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCopy: { flex: 1, marginLeft: 12 },
  sessionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  sessionMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  sessionStat: { alignItems: 'flex-end', marginRight: 10 },
  sessionValue: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  deleteBtn: { padding: 6 },
  emptyCard: {
    marginHorizontal: 22,
    borderWidth: 1,
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 12 },
  emptySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});