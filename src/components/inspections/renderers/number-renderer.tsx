import { StyleSheet, TextInput } from 'react-native';
import type { AnswerInput, ItemRendererProps } from './types';

function readValue(value: AnswerInput | null): string {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'string' && raw.trim() !== '') return raw;
  return '';
}

export function NumberRenderer({ item, value, onChange, disabled }: ItemRendererProps) {
  const current = readValue(value);

  function update(next: string) {
    const trimmed = next.trim();
    if (trimmed === '') {
      onChange(null);
      return;
    }
    const parsed = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(parsed)) return;
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: parsed },
    });
  }

  return (
    <TextInput
      value={current}
      onChangeText={update}
      editable={!disabled}
      keyboardType="numeric"
      placeholder="0"
      placeholderTextColor="#94a3b8"
      style={[styles.input, disabled && styles.disabled]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 44,
    backgroundColor: '#fff',
    width: 180,
  },
  disabled: { opacity: 0.6, backgroundColor: '#f8fafc' },
});
