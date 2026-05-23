import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'tip';

interface Props {
  title?: string;
  message: string;
  tone?: BannerTone;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

const TONE: Record<BannerTone, { bg: string; fg: string; icon: IconName }> = {
  info:    { bg: theme.color.infoBg,    fg: theme.color.infoFg,    icon: 'Info' },
  success: { bg: theme.color.successBg, fg: theme.color.successFg, icon: 'CheckCircle2' },
  warning: { bg: theme.color.warningBg, fg: theme.color.warningFg, icon: 'AlertTriangle' },
  danger:  { bg: theme.color.dangerBg,  fg: theme.color.dangerFg,  icon: 'AlertCircle' },
  tip:     { bg: theme.color.infoBg,    fg: theme.color.infoFg,    icon: 'Lightbulb' },
};

export function Banner({ title, message, tone = 'info', icon, style }: Props) {
  const t = TONE[tone];
  const iconName = icon ?? t.icon;
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }, style]}>
      <Icon name={iconName} size={18} color={t.fg} strokeWidth={2.2} />
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: t.fg }]}>{title}</Text> : null}
        <Text style={[styles.msg, { color: t.fg }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: theme.radius.lg,
    alignItems: 'flex-start',
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.semibold,
  },
  msg: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    lineHeight: theme.lineHeight.base,
  },
});
