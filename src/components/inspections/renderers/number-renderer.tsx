import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native';
import { getNumberSchema } from '@/lib/inspections/field-type-schema';
import type { AnswerInput, ItemRendererProps } from './types';

function readValue(value: AnswerInput | null): string {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'string' && raw.trim() !== '') return raw;
  return '';
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function NumberRenderer({ item, value, onChange, disabled }: ItemRendererProps) {
  const schema = getNumberSchema(item);
  const current = readValue(value);
  const parsed = parseNumber(current);

  let rangeError: string | null = null;
  if (parsed !== null) {
    if (typeof schema.min === 'number' && parsed < schema.min) {
      rangeError = `Mínimo permitido: ${schema.min}`;
    } else if (typeof schema.max === 'number' && parsed > schema.max) {
      rangeError = `Máximo permitido: ${schema.max}`;
    }
  }

  function update(next: string) {
    const trimmed = next.trim();
    if (trimmed === '') {
      onChange(null);
      return;
    }
    const parsedNext = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(parsedNext)) return;
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: parsedNext },
    });
  }

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          value={current}
          onChangeText={update}
          editable={!disabled}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94a3b8"
          style={[styles.input, disabled && styles.disabled]}
        />
        {schema.unit ? <Text style={styles.unit}>{schema.unit}</Text> : null}
      </View>
      {rangeError ? <Text style={styles.err}>{rangeError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  unit: { fontSize: 13, color: '#475569', fontWeight: '500' },
  disabled: { opacity: 0.6, backgroundColor: '#f8fafc' },
  err: { marginTop: 4, fontSize: 12, color: '#dc2626' },
});
