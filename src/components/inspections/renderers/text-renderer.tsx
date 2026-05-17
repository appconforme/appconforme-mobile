import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { getTextSchema } from '@/lib/inspections/field-type-schema';
import type { AnswerInput, ItemRendererProps } from './types';

function readValue(value: AnswerInput | null): string {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  return typeof raw === 'string' ? raw : '';
}

function compileRegex(pattern: string | undefined): RegExp | null {
  if (!pattern) return null;
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

export function TextRenderer({ item, value, onChange, disabled }: ItemRendererProps) {
  const schema = getTextSchema(item);
  const current = readValue(value);
  const [regexInvalid, setRegexInvalid] = useState(false);

  const multiline = schema.multiline ?? true;
  const placeholder = schema.placeholder ?? 'Escreva a resposta...';

  function update(next: string) {
    if (next.length === 0) {
      setRegexInvalid(false);
      onChange(null);
      return;
    }
    // Limpa o erro enquanto o usuário ainda digita.
    if (regexInvalid) setRegexInvalid(false);
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: next },
    });
  }

  function onBlur() {
    const re = compileRegex(schema.regex);
    if (!re) {
      setRegexInvalid(false);
      return;
    }
    if (current.length === 0) {
      setRegexInvalid(false);
      return;
    }
    setRegexInvalid(!re.test(current));
  }

  return (
    <View>
      <TextInput
        value={current}
        onChangeText={update}
        onBlur={onBlur}
        editable={!disabled}
        multiline={multiline}
        maxLength={schema.maxLength}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={[
          styles.input,
          multiline ? styles.inputMultiline : styles.inputSingle,
          disabled && styles.disabled,
        ]}
      />
      {regexInvalid ? <Text style={styles.err}>Formato inválido.</Text> : null}
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
    backgroundColor: '#fff',
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  inputSingle: {
    minHeight: 44,
  },
  disabled: { opacity: 0.6, backgroundColor: '#f8fafc' },
  err: { marginTop: 4, fontSize: 12, color: '#dc2626' },
});
