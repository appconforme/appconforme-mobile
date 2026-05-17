import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { getDateSchema } from '@/lib/inspections/field-type-schema';
import type { AnswerInput, ItemRendererProps } from './types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function readValue(value: AnswerInput | null): string {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  return typeof raw === 'string' ? raw : '';
}

/**
 * MVP mobile: input texto "AAAA-MM-DD". Sem date picker nativo —
 * adicionar `@react-native-community/datetimepicker` ficou pra depois.
 */
export function DateRenderer({ item, value, onChange, disabled }: ItemRendererProps) {
  const schema = getDateSchema(item);
  const persisted = readValue(value);
  const [draft, setDraft] = useState<string>(persisted);
  const [touched, setTouched] = useState<boolean>(false);

  const trimmed = draft.trim();
  const isValidFormat = ISO_DATE.test(trimmed);
  const formatError = touched && trimmed !== '' && !isValidFormat;

  // Validação min/max só quando o formato é válido.
  let rangeError: string | null = null;
  if (isValidFormat) {
    const minOk = !schema.min || trimmed >= schema.min;
    const maxOk = !schema.max || trimmed <= schema.max;
    if (!minOk || !maxOk) {
      rangeError = 'Data fora da faixa permitida.';
    }
  }

  function commit(raw: string) {
    const t = raw.trim();
    if (t === '') {
      onChange(null);
      return;
    }
    if (!ISO_DATE.test(t)) return;
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: t },
    });
  }

  return (
    <View>
      <TextInput
        value={draft}
        onChangeText={(t) => {
          setDraft(t);
          if (ISO_DATE.test(t.trim()) || t.trim() === '') commit(t);
        }}
        onBlur={() => {
          setTouched(true);
          commit(draft);
        }}
        editable={!disabled}
        placeholder="AAAA-MM-DD"
        placeholderTextColor="#94a3b8"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, disabled && styles.disabled]}
      />
      {formatError ? (
        <Text style={styles.err}>Formato inválido. Use AAAA-MM-DD.</Text>
      ) : rangeError ? (
        <Text style={styles.err}>{rangeError}</Text>
      ) : null}
    </View>
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
    width: 200,
  },
  disabled: { opacity: 0.6, backgroundColor: '#f8fafc' },
  err: { marginTop: 4, fontSize: 12, color: '#dc2626' },
});
