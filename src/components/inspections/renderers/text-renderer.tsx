import { StyleSheet, TextInput } from 'react-native';
import type { AnswerInput, ItemRendererProps } from './types';

function readValue(value: AnswerInput | null): string {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  return typeof raw === 'string' ? raw : '';
}

export function TextRenderer({ item, value, onChange, disabled }: ItemRendererProps) {
  const current = readValue(value);

  function update(next: string) {
    if (next.length === 0) {
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
    <TextInput
      value={current}
      onChangeText={update}
      editable={!disabled}
      multiline
      placeholder="Escreva a resposta..."
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
    minHeight: 64,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  disabled: { opacity: 0.6, backgroundColor: '#f8fafc' },
});
