import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon } from '@/components/ui/icon';
import { StatusPill, type PillTone } from '@/components/ui/status-pill';

interface Props {
  title: string;
  version?: string;
  publishedLabel?: string;
  statusLabel?: string;
  statusTone?: PillTone;
  onPressInfo?: () => void;
}

export function TaskInfoCard({ title, version, publishedLabel, statusLabel, statusTone = 'info', onPressInfo }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon name="ClipboardList" size={22} color={theme.color.primary} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {[version && `Ver. ${version}`, publishedLabel && `Publicado em ${publishedLabel}`]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      {statusLabel ? <StatusPill label={statusLabel} tone={statusTone} /> : null}
      {onPressInfo ? (
        <Pressable onPress={onPressInfo} hitSlop={8} style={styles.infoBtn}>
          <Icon name="Info" size={16} color={theme.color.primary} />
          <Text style={styles.infoText}>Informações</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: theme.color.primarySoft,
    borderRadius: theme.radius.lg,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  sub: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, marginTop: 2 },
  infoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  infoText: { fontSize: theme.fontSize.sm, color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
});
