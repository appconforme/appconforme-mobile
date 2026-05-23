import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon } from '@/components/ui/icon';

export type GroupTone = 'danger' | 'warning' | 'success' | 'info' | 'neutral';

interface Props {
  label: string;
  count: number;
  tone: GroupTone;
  onSeeAll?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const TONE_BG: Record<GroupTone, { bg: string; fg: string }> = {
  danger:  { bg: theme.color.dangerBg,  fg: theme.color.dangerFg },
  warning: { bg: theme.color.warningBg, fg: theme.color.warningFg },
  success: { bg: theme.color.successBg, fg: theme.color.successFg },
  info:    { bg: theme.color.infoBg,    fg: theme.color.infoFg },
  neutral: { bg: theme.color.neutralBg, fg: theme.color.neutralFg },
};

export function TaskGroupHeader({ label, count, tone, onSeeAll, collapsed, onToggle }: Props) {
  const t = TONE_BG[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Pressable
        onPress={onToggle}
        style={styles.left}
        hitSlop={6}
        accessibilityRole="button"
      >
        {onToggle ? (
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronDown'} size={16} color={t.fg} />
        ) : null}
        <Text style={[styles.label, { color: t.fg }]}>{label} ({count})</Text>
      </Pressable>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={6}>
          <Text style={[styles.seeAll, { color: t.fg }]}>Ver tudo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: theme.fontSize.base, fontFamily: theme.fontFamily.semibold },
  seeAll: { fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.semibold },
});
