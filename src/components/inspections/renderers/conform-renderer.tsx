import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AnswerInput, ItemRendererProps } from './types';

type ConformValue = 'conform' | 'not_conform';

function readValue(value: AnswerInput | null): ConformValue | null {
  const raw = (value?.answerValue as { value?: unknown } | undefined)?.value;
  return raw === 'conform' || raw === 'not_conform' ? raw : null;
}

export function ConformRenderer({
  item,
  value,
  onChange,
  disabled,
}: ItemRendererProps) {
  const current = readValue(value);

  function pick(next: ConformValue) {
    if (disabled) return;
    if (current === next) {
      onChange(null);
      return;
    }
    onChange({
      checklistItemId: item.id,
      answerType: item.type,
      answerValue: { value: next },
      isConform: next === 'conform',
    });
  }

  return (
    <View style={styles.row}>
      <Pill
        label="Conforme"
        tone="conform"
        active={current === 'conform'}
        disabled={disabled}
        onPress={() => pick('conform')}
      />
      <Pill
        label="Não conforme"
        tone="non-conform"
        active={current === 'not_conform'}
        disabled={disabled}
        onPress={() => pick('not_conform')}
      />
    </View>
  );
}

interface PillProps {
  label: string;
  tone: 'conform' | 'non-conform';
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}

function Pill({ label, tone, active, disabled, onPress }: PillProps) {
  const activeBg = tone === 'conform' ? '#16a34a' : '#dc2626';
  const idleFg = tone === 'conform' ? '#15803d' : '#991b1b';
  const idleBg = tone === 'conform' ? '#dcfce7' : '#fee2e2';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? activeBg : idleBg,
          borderColor: active ? activeBg : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.pillLabel,
          { color: active ? '#fff' : idleFg },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    minWidth: 120,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pillLabel: { fontSize: 14, fontWeight: '600' },
});
