import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AnswerInput, ItemRendererProps } from './types';

function readValue(value: AnswerInput | null): 'yes' | 'no' | null {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  return raw === 'yes' || raw === 'no' ? raw : null;
}

export function YesNoRenderer({
  item,
  value,
  onChange,
  disabled,
}: ItemRendererProps) {
  const current = readValue(value);

  function pick(next: 'yes' | 'no') {
    if (disabled) return;
    if (current === next) {
      onChange(null);
      return;
    }
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: next },
    });
  }

  return (
    <View style={styles.row}>
      <Pill label="Sim" active={current === 'yes'} disabled={disabled} onPress={() => pick('yes')} />
      <Pill label="Não" active={current === 'no'} disabled={disabled} onPress={() => pick('no')} />
    </View>
  );
}

function Pill({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && !disabled && styles.pillPressed,
        disabled && styles.pillDisabled,
      ]}
    >
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    minWidth: 88,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pillActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  pillPressed: { backgroundColor: '#f1f5f9' },
  pillDisabled: { opacity: 0.5 },
  pillLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  pillLabelActive: { color: '#fff' },
});
