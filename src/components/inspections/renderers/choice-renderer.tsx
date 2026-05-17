import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getChoiceSchema } from '@/lib/inspections/field-type-schema';
import type { InspectionItem } from '@/lib/inspections/types';
import type { AnswerInput, ItemRendererProps } from './types';

interface ChoiceOption {
  label: string;
  value: string;
}

function readOptions(item: InspectionItem): ChoiceOption[] {
  const customSchema = getChoiceSchema(item);
  if (customSchema.options && customSchema.options.length > 0) {
    return customSchema.options.map((opt) => ({
      label: opt.label,
      value: opt.value,
    }));
  }
  if (!item.optionsJson?.options) return [];
  return item.optionsJson.options.map((opt, idx) => ({
    label: opt.label,
    value: opt.value ?? opt.label ?? String(idx),
  }));
}

function readSingle(value: AnswerInput | null): string | null {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

function readMulti(value: AnswerInput | null): string[] {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === 'string');
}

interface ChoiceRendererProps extends ItemRendererProps {
  multiple?: boolean;
}

export function ChoiceRenderer({
  item,
  value,
  onChange,
  disabled,
  multiple,
}: ChoiceRendererProps) {
  const options = readOptions(item);

  if (options.length === 0) {
    return (
      <Text style={styles.error}>
        Item sem opções configuradas. Edite o checklist.
      </Text>
    );
  }

  if (multiple) {
    const current = readMulti(value);

    function toggle(opt: string) {
      if (disabled) return;
      const next = current.includes(opt)
        ? current.filter((v) => v !== opt)
        : [...current, opt];
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
      <View style={styles.list}>
        {options.map((opt) => {
          const checked = current.includes(opt.value);
          return (
            <Row
              key={opt.value}
              label={opt.label}
              checked={checked}
              disabled={disabled}
              onPress={() => toggle(opt.value)}
              shape="square"
            />
          );
        })}
      </View>
    );
  }

  const current = readSingle(value);

  function pick(opt: string) {
    if (disabled) return;
    if (current === opt) {
      onChange(null);
      return;
    }
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: opt },
    });
  }

  return (
    <View style={styles.list}>
      {options.map((opt) => {
        const checked = current === opt.value;
        return (
          <Row
            key={opt.value}
            label={opt.label}
            checked={checked}
            disabled={disabled}
            onPress={() => pick(opt.value)}
            shape="round"
          />
        );
      })}
    </View>
  );
}

interface RowProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  onPress: () => void;
  shape: 'round' | 'square';
}

function Row({ label, checked, disabled, onPress, shape }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        checked && styles.rowActive,
        pressed && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
    >
      <View
        style={[
          shape === 'round' ? styles.radio : styles.checkbox,
          checked && (shape === 'round' ? styles.radioOn : styles.checkboxOn),
        ]}
      >
        {checked && shape === 'round' ? <View style={styles.radioDot} /> : null}
        {checked && shape === 'square' ? (
          <Text style={styles.check}>✓</Text>
        ) : null}
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  error: { fontSize: 12.5, color: '#dc2626' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  rowActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  rowPressed: { backgroundColor: '#f1f5f9' },
  rowDisabled: { opacity: 0.5 },
  rowLabel: { flex: 1, fontSize: 14, color: '#0f172a' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioOn: { borderColor: '#2563eb' },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563eb' },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  check: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
