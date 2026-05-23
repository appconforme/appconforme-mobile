import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

export type KpiTone = 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'orange' | 'neutral';

interface Props {
  value: string | number;
  label: string;
  icon?: IconName;
  tone?: KpiTone;
  /** Visual style: 'card' (com border + bg branco) ou 'inline' (sem border, bg do tom). */
  variant?: 'card' | 'inline';
}

const TONE: Record<KpiTone, { fg: string; iconBg: string }> = {
  primary: { fg: theme.color.primary,    iconBg: theme.color.primarySoft },
  success: { fg: theme.color.successFg,  iconBg: theme.color.successBg },
  warning: { fg: theme.color.warningFg,  iconBg: theme.color.warningBg },
  danger:  { fg: theme.color.dangerFg,   iconBg: theme.color.dangerBg },
  accent:  { fg: theme.color.accentFg,   iconBg: theme.color.accentBg },
  orange:  { fg: theme.color.orangeFg,   iconBg: theme.color.orangeBg },
  neutral: { fg: theme.color.text,       iconBg: theme.color.neutralBg },
};

export function KpiCard({ value, label, icon, tone = 'primary', variant = 'card' }: Props) {
  const t = TONE[tone];
  return (
    <View style={[styles.wrap, variant === 'card' ? styles.cardVariant : styles.inlineVariant]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: t.iconBg }]}>
          <Icon name={icon} size={18} color={t.fg} strokeWidth={2.2} />
        </View>
      ) : null}
      <Text style={[styles.value, { color: t.fg }]}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    flex: 1,
  },
  cardVariant: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  inlineVariant: {
    backgroundColor: 'transparent',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: theme.fontSize['3xl'],
    fontFamily: theme.fontFamily.bold,
    lineHeight: theme.lineHeight['3xl'],
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    textAlign: 'center',
    fontFamily: theme.fontFamily.medium,
  },
});
