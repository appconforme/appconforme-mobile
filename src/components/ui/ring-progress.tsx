/**
 * RingProgress — donut com valor central. Usado no banner do Dashboard
 * ("85% Conformidade geral") e em cards de KPI dos Relatórios.
 */
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@/theme';

interface Props {
  value: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showPercent?: boolean;
  textColor?: string;
}

export function RingProgress({
  value,
  size = 72,
  strokeWidth = 8,
  color = theme.color.surface,
  trackColor = 'rgba(255,255,255,0.25)',
  label,
  showPercent = true,
  textColor = theme.color.surface,
}: Props) {
  const v = Math.max(0, Math.min(1, value));
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - v);
  const pct = Math.round(v * 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          // -90° (topo)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {showPercent ? (
          <Text style={[styles.pct, { color: textColor, fontSize: size * 0.28 }]}>{pct}%</Text>
        ) : null}
        {label ? (
          <Text style={[styles.label, { color: textColor, fontSize: size * 0.13 }]} numberOfLines={2}>
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: { fontFamily: theme.fontFamily.bold, letterSpacing: -0.5 },
  label: { fontFamily: theme.fontFamily.medium, opacity: 0.9, textAlign: 'center' },
});
