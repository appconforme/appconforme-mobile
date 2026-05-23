import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

export type ChipTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface Props {
  label: string;
  count?: number;
  active?: boolean;
  tone?: ChipTone;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const TONE: Record<ChipTone, { fg: string; bg: string; activeBg: string; activeFg: string; countBg: string; countFg: string }> = {
  default: {
    fg: theme.color.textBody, bg: theme.color.bgSubtle, activeBg: theme.color.primary, activeFg: theme.color.textOnPrimary,
    countBg: theme.color.surface, countFg: theme.color.text,
  },
  primary: {
    fg: theme.color.primary, bg: theme.color.primarySoft, activeBg: theme.color.primary, activeFg: theme.color.textOnPrimary,
    countBg: theme.color.primary, countFg: theme.color.textOnPrimary,
  },
  success: {
    fg: theme.color.successFg, bg: theme.color.successBg, activeBg: theme.color.successFg, activeFg: theme.color.textOnPrimary,
    countBg: theme.color.successFg, countFg: theme.color.textOnPrimary,
  },
  warning: {
    fg: theme.color.warningFg, bg: theme.color.warningBg, activeBg: theme.color.warningFg, activeFg: theme.color.textOnPrimary,
    countBg: theme.color.warningFg, countFg: theme.color.textOnPrimary,
  },
  danger: {
    fg: theme.color.dangerFg, bg: theme.color.dangerBg, activeBg: theme.color.dangerFg, activeFg: theme.color.textOnPrimary,
    countBg: theme.color.dangerFg, countFg: theme.color.textOnPrimary,
  },
  neutral: {
    fg: theme.color.neutralFg, bg: theme.color.neutralBg, activeBg: theme.color.text, activeFg: theme.color.textOnPrimary,
    countBg: theme.color.text, countFg: theme.color.textOnPrimary,
  },
};

export function Chip({ label, count, active, tone = 'default', icon, onPress, style }: Props) {
  const t = TONE[tone];
  const fg = active ? t.activeFg : t.fg;
  const bg = active ? t.activeBg : t.bg;

  const content = (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      {typeof count === 'number' ? (
        <View style={[styles.count, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : t.countBg }]}>
          <Text style={[styles.countText, { color: active ? t.activeFg : t.countFg }]}>{count}</Text>
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.full,
    gap: 6,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.1,
  },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
  },
});
