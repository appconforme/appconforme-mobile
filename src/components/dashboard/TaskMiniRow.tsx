/**
 * Linha de tarefa compacta usada no Dashboard e na lista "Minhas tarefas"
 * (grupos colapsáveis). Pixel-perfect ao mockup "Tela Principal.png".
 */
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { StatusPill, type PillTone } from '@/components/ui/status-pill';

interface Props {
  title: string;
  area?: string | null;
  status: string;
  tone: PillTone;
  due?: string;
  icon?: IconName;
  iconTone?: 'primary' | 'success' | 'warning' | 'danger' | 'orange' | 'accent';
  onPress?: () => void;
  showChevron?: boolean;
}

const ICON_TONE_BG: Record<NonNullable<Props['iconTone']>, { bg: string; fg: string }> = {
  primary: { bg: theme.color.primarySoft, fg: theme.color.primary },
  success: { bg: theme.color.successBg,  fg: theme.color.successFg },
  warning: { bg: theme.color.warningBg,  fg: theme.color.warningFg },
  danger:  { bg: theme.color.dangerBg,   fg: theme.color.dangerFg },
  orange:  { bg: theme.color.orangeBg,   fg: theme.color.orangeFg },
  accent:  { bg: theme.color.accentBg,   fg: theme.color.accentFg },
};

export function TaskMiniRow({
  title,
  area,
  status,
  tone,
  due,
  icon = 'ClipboardList',
  iconTone,
  onPress,
  showChevron = true,
}: Props) {
  const tBg = iconTone ? ICON_TONE_BG[iconTone] : { bg: theme.color.primarySoft, fg: theme.color.primary };

  const inner = (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: tBg.bg }]}>
        <Icon name={icon} size={18} color={tBg.fg} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {area ? <Text style={styles.area} numberOfLines={1}>Área: {area}</Text> : null}
        {due ? <Text style={styles.due} numberOfLines={1}>{due}</Text> : null}
      </View>
      <StatusPill label={status} tone={tone} />
      {onPress && showChevron ? (
        <Icon name="ChevronRight" size={18} color={theme.color.textSubtle} />
      ) : null}
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 1 },
  title: {
    fontSize: theme.fontSize.md,
    color: theme.color.text,
    fontFamily: theme.fontFamily.semibold,
  },
  area: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.regular,
  },
  due: {
    fontSize: theme.fontSize.sm,
    color: theme.color.dangerFg,
    fontFamily: theme.fontFamily.medium,
  },
});
