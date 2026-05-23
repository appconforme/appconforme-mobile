/**
 * Seletor de severidade — 4 botões com dot colorido, pixel-perfect ao mockup.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import type { OccurrenceSeverity } from '@/lib/occurrences/types';

const ITEMS: ReadonlyArray<{ id: OccurrenceSeverity; label: string; color: string }> = [
  { id: 'low',      label: 'Baixa',   color: theme.color.successFg },
  { id: 'medium',   label: 'Média',   color: theme.color.warningFg },
  { id: 'high',     label: 'Alta',    color: theme.color.orangeFg },
  { id: 'critical', label: 'Crítica', color: theme.color.dangerFg },
];

interface Props {
  value: OccurrenceSeverity | null;
  onChange: (v: OccurrenceSeverity) => void;
}

export function SeveritySelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {ITEMS.map((it) => {
        const active = value === it.id;
        return (
          <Pressable
            key={it.id}
            onPress={() => onChange(it.id)}
            style={[
              styles.btn,
              active && { borderColor: it.color, backgroundColor: theme.color.surface },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: it.color }]} />
            <Text style={[styles.label, active && { color: it.color, fontFamily: theme.fontFamily.semibold }]}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.bg,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: theme.fontSize.base, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium },
});
