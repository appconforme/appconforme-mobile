import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import {
  type OccurrenceSeverity,
  SEVERITY_LABEL,
  SEVERITY_TONE,
} from '@/lib/occurrences/types';

interface Props {
  value: OccurrenceSeverity | null;
  onChange: (v: OccurrenceSeverity) => void;
}

const TONE_BG: Record<NonNullable<ReturnType<typeof toneFor>>, { bg: string; fg: string }> = {
  success: { bg: theme.color.successBg, fg: theme.color.successFg },
  warning: { bg: theme.color.warningBg, fg: theme.color.warningFg },
  danger:  { bg: theme.color.dangerBg,  fg: theme.color.dangerFg },
  neutral: { bg: theme.color.neutralBg, fg: theme.color.neutralFg },
};

function toneFor(s: OccurrenceSeverity) {
  return SEVERITY_TONE[s];
}

const ORDER: OccurrenceSeverity[] = ['low', 'medium', 'high', 'critical'];

export function SegmentedSeverity({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {ORDER.map((s) => {
        const t = TONE_BG[toneFor(s)];
        const active = value === s;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            style={[
              styles.cell,
              { backgroundColor: active ? t.bg : theme.color.surface, borderColor: active ? t.fg : theme.color.border },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: t.fg }]} />
            <Text style={[styles.label, { color: active ? t.fg : theme.color.textBody, fontFamily: active ? theme.fontFamily.semibold : theme.fontFamily.medium }]}>
              {SEVERITY_LABEL[s]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: theme.fontSize.base },
});
