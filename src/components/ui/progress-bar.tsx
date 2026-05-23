import { StyleSheet, View } from 'react-native';
import { theme } from '@/theme';

interface Props {
  value: number; // 0..1
  height?: number;
  color?: string;
  trackColor?: string;
  rounded?: boolean;
}

export function ProgressBar({
  value,
  height = 6,
  color = theme.color.primary,
  trackColor = theme.color.bgSubtle,
  rounded = true,
}: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor, borderRadius: rounded ? height / 2 : 0 },
      ]}
    >
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: color, borderRadius: rounded ? height / 2 : 0 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
