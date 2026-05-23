/**
 * Linha de lista padrão — usada em Perfil, configurações, etc.
 * Suporta ícone à esquerda, título + subtítulo, valor à direita, chevron.
 */
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

interface Props {
  icon?: IconName;
  iconTone?: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'orange' | 'neutral';
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ICON_TONE_BG: Record<NonNullable<Props['iconTone']>, { bg: string; fg: string }> = {
  primary: { bg: theme.color.primarySoft, fg: theme.color.primary },
  success: { bg: theme.color.successBg,  fg: theme.color.successFg },
  warning: { bg: theme.color.warningBg,  fg: theme.color.warningFg },
  danger:  { bg: theme.color.dangerBg,   fg: theme.color.dangerFg },
  accent:  { bg: theme.color.accentBg,   fg: theme.color.accentFg },
  orange:  { bg: theme.color.orangeBg,   fg: theme.color.orangeFg },
  neutral: { bg: theme.color.neutralBg,  fg: theme.color.neutralFg },
};

export function ListRow({
  icon,
  iconTone = 'primary',
  title,
  subtitle,
  rightLabel,
  rightElement,
  onPress,
  showChevron = true,
  destructive,
  style,
}: Props) {
  const tone = destructive ? ICON_TONE_BG.danger : ICON_TONE_BG[iconTone];
  const titleColor = destructive ? theme.color.dangerFg : theme.color.text;

  const content = (
    <View style={[styles.row, style]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: tone.bg }]}>
          <Icon name={icon} size={18} color={tone.fg} strokeWidth={2} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {rightElement ? rightElement : null}
      {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      {onPress && showChevron && !rightElement ? (
        <Icon name="ChevronRight" size={20} color={theme.color.textSubtle} />
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.color.surface,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 1 },
  title: { fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.medium },
  sub: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.regular },
  rightLabel: { fontSize: theme.fontSize.base, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium },
});
