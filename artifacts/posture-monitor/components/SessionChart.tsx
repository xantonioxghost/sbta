import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import type { Reading } from '@/context/PostureContext';

export function SessionChart({ readings }: { readings: Reading[] }) {
  const colors = useColors();
  const points = readings.length ? readings.slice(-36) : [];
  const max = Math.max(30, ...points.map((reading) => reading.angle));
  const chartPoints = points.map((reading, index) => {
    const x = points.length === 1 ? 8 : (index / (points.length - 1)) * 216 + 8;
    const y = 92 - (reading.angle / max) * 74;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.cardForeground }]}>Live session</Text>
          <Text style={[styles.subtle, { color: colors.mutedForeground }]}>Deviation over the last few minutes</Text>
        </View>
        <Text style={[styles.legend, { color: colors.primary }]}>● now</Text>
      </View>
      <View style={styles.chart}>
        <View style={[styles.threshold, { backgroundColor: colors.border }]} />
        {points.length > 1 ? (
          <Svg width="232" height="106" viewBox="0 0 232 106">
            <Polyline points={chartPoints} fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>Connect your belt to begin tracking</Text>
        )}
      </View>
      <View style={styles.axis}>
        <Text style={[styles.axisText, { color: colors.mutedForeground }]}>0°</Text>
        <Text style={[styles.axisText, { color: colors.mutedForeground }]}>15°</Text>
        <Text style={[styles.axisText, { color: colors.mutedForeground }]}>30°</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 18, marginHorizontal: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  subtle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  legend: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  chart: { height: 106, marginTop: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  threshold: { position: 'absolute', left: 0, right: 0, top: 47, height: 1 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  axisText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
});