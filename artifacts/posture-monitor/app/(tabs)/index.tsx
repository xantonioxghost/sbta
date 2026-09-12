import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PostureGauge } from '@/components/PostureGauge';
import { SectionLabel } from '@/components/SectionLabel';
import { SessionChart } from '@/components/SessionChart';
import { usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';

function formatDuration(start: number | null) {
  if (!start) return '00:00';
  const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { angle, readings, status, connectionMode, preferences, sessionStartedAt, alertActive, calibrationStep, connect, disconnect, calibrate } = usePosture();
  const [duration, setDuration] = React.useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => setDuration(formatDuration(sessionStartedAt)), 1000);
    return () => clearInterval(timer);
  }, [sessionStartedAt]);

  const isConnected = status === 'connected';
  const goodCount = readings.filter((reading) => reading.good).length;
  const goodPercent = readings.length ? Math.round((goodCount / readings.length) * 100) : 100;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>POSTURE MONITOR</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Stay aligned.</Text>
        </View>
        <Pressable testID="settings-button" onPress={() => router.push('/(tabs)/settings')} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
          <Icon name="sliders" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <Pressable testID="connection-card" onPress={isConnected ? disconnect : connect} style={({ pressed }) => [styles.connection, { backgroundColor: isConnected ? colors.secondary : colors.card, borderColor: isConnected ? colors.primary : colors.border, opacity: pressed ? 0.86 : 1 }]}>
        <View style={[styles.connectionDot, { backgroundColor: status === 'searching' ? colors.accentForeground : isConnected ? colors.primary : colors.mutedForeground }]} />
        <View style={styles.connectionCopy}>
          <Text style={[styles.connectionTitle, { color: colors.foreground }]}>
            {status === 'searching'
              ? 'Searching for ESP32 Bluetooth…'
              : isConnected
                ? connectionMode === 'simulator'
                  ? 'Demo Mode connected (Simulated)'
                  : 'PostureBelt ESP32 connected'
                : 'PostureBelt not connected'}
          </Text>
          <Text style={[styles.connectionSub, { color: colors.mutedForeground }]}>
            {isConnected
              ? `Tracking for ${duration}`
              : status === 'searching'
                ? 'Select your PostureBelt ESP32 in browser popup'
                : connectionMode === 'simulator'
                  ? 'Tap to start Demo Simulator'
                  : 'Tap to pair with your ESP32 via Bluetooth'}
          </Text>
        </View>
        <Icon name={isConnected ? 'x' : 'bluetooth'} size={19} color={isConnected ? colors.mutedForeground : colors.primary} />
      </Pressable>

      <View style={styles.sectionHeader}>
        <SectionLabel>Right now</SectionLabel>
        <Text style={[styles.threshold, { color: colors.mutedForeground }]}>Limit {preferences.threshold}°</Text>
      </View>
      <View style={[styles.gaugeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PostureGauge angle={angle} threshold={preferences.threshold} />
        {alertActive && (
          <View style={[styles.alert, { backgroundColor: colors.accent }]}>
            <Icon name="bell" size={15} color={colors.destructive} />
            <Text style={[styles.alertText, { color: colors.accentForeground }]}>Take a breath and gently reset your shoulders</Text>
          </View>
        )}
      </View>

      <View style={styles.metrics}>
        <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>{goodPercent}%</Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>good posture</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>{Math.round(angle)}°</Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>current tilt</Text>
        </View>
      </View>

      <SessionChart readings={readings} />

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <SectionLabel>Baseline</SectionLabel>
          <Text style={[styles.actionTitle, { color: colors.foreground }]}>Reset your straight posture</Text>
          <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>{calibrationStep ? `Hold still… ${calibrationStep}` : 'Sit or stand tall, then calibrate'}</Text>
        </View>
        <Pressable testID="calibrate-button" disabled={!isConnected || calibrationStep > 0} onPress={calibrate} style={({ pressed }) => [styles.calibrate, { backgroundColor: isConnected ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 }]}>
          <Icon name="crosshair" size={17} color={isConnected ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.calibrateText, { color: isConnected ? colors.primaryForeground : colors.mutedForeground }]}>{calibrationStep ? 'Calibrating' : 'Calibrate'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, marginBottom: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3, marginBottom: 7 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.7 },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  connection: { marginHorizontal: 22, borderRadius: 18, borderWidth: 1, padding: 15, flexDirection: 'row', alignItems: 'center' },
  connectionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  connectionCopy: { flex: 1 },
  connectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  connectionSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, marginTop: 28, marginBottom: 10 },
  threshold: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  gaugeCard: { marginHorizontal: 22, borderRadius: 24, borderWidth: 1, alignItems: 'center', paddingTop: 18, paddingBottom: 18 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 13, marginTop: 8, marginHorizontal: 18 },
  alertText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  metrics: { flexDirection: 'row', gap: 12, marginHorizontal: 22, marginTop: 12 },
  metric: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 15 },
  metricValue: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  metricLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  actions: { marginHorizontal: 22, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  actionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 7 },
  actionSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  calibrate: { paddingHorizontal: 13, paddingVertical: 11, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  calibrateText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});
