import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

export type PillTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' | 'orange';
export type PillSize = 'sm' | 'md';

interface Props {
  label: string;
  tone?: PillTone;
  size?: PillSize;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TONE: Record<PillTone, { bg: string; fg: string }> = {
  success: { bg: theme.color.successBg, fg: theme.color.successFg },
  warning: { bg: theme.color.warningBg, fg: theme.color.warningFg },
  danger:  { bg: theme.color.dangerBg,  fg: theme.color.dangerFg },
  info:    { bg: theme.color.infoBg,    fg: theme.color.infoFg },
  neutral: { bg: theme.color.neutralBg, fg: theme.color.neutralFg },
  accent:  { bg: theme.color.accentBg,  fg: theme.color.accentFg },
  orange:  { bg: theme.color.orangeBg,  fg: theme.color.orangeFg },
};

export function StatusPill({ label, tone = 'neutral', size = 'sm', dot, style }: Props) {
  const t = TONE[tone];
  const pad = size === 'md' ? { paddingV: 5, paddingH: 10, fontSize: theme.fontSize.base } : { paddingV: 3, paddingH: 8, fontSize: theme.fontSize.xs };
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: t.bg,
          paddingVertical: pad.paddingV,
          paddingHorizontal: pad.paddingH,
        },
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text style={[styles.label, { color: t.fg, fontSize: pad.fontSize }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: {
    fontFamily: theme.fontFamily.semibold,
    letterSpacing: 0.1,
  },
});
