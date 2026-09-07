import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

type Props = { angle: number; threshold: number };

export function PostureGauge({ angle, threshold }: Props) {
  const colors = useColors();
  const good = angle <= threshold;
  const stateColor = good ? colors.primary : colors.destructive;
  const rotation = Math.max(-24, Math.min(24, angle * (angle >= 0 ? 1 : -1)));
  const circumference = 2 * Math.PI * 94;
  const progress = Math.min(1, angle / 30);

  return (
    <View style={styles.wrap}>
      <Svg width={238} height={238} viewBox="0 0 238 238">
        <Circle cx="119" cy="119" r="94" fill="none" stroke={colors.muted} strokeWidth="14" />
        <Circle
          cx="119"
          cy="119"
          r="94"
          fill="none"
          stroke={stateColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference * (1 - Math.max(0.05, progress))}`}
          transform="rotate(-90 119 119)"
        />
        <Path d="M119 29v-10M119 219v-10M29 119H19M219 119h-10" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
        <Line x1="119" y1="119" x2="119" y2="51" stroke={stateColor} strokeWidth="5" strokeLinecap="round" transform={`rotate(${rotation} 119 119)`} />
        <Circle cx="119" cy="119" r="9" fill={stateColor} />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.angle, { color: colors.foreground }]}>{Math.round(angle)}°</Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>deviation</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: good ? colors.secondary : colors.accent }]}>
        <Feather name={good ? 'check' : 'activity'} size={14} color={stateColor} />
        <Text style={[styles.statusText, { color: stateColor }]}>{good ? 'Good posture' : 'Ease back'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 260, height: 284, alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', top: 93 },
  angle: { fontFamily: 'Inter_700Bold', fontSize: 44, letterSpacing: -1 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 2 },
  statusPill: { position: 'absolute', bottom: 0, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});