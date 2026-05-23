/**
 * Stepper horizontal pixel-perfect aos mockups `Nova Ocorrência - *.png`.
 * 4 etapas conectadas por linha; etapa concluída fica com checkmark.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon } from '@/components/ui/icon';

interface Step {
  id: number;
  label: string;
}

interface Props {
  steps: ReadonlyArray<Step>;
  active: number;
  completed: ReadonlyArray<number>;
  onSelect?: (id: number) => void;
}

export function OccurrenceStepper({ steps, active, completed, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      {steps.map((s, i) => {
        const isActive = s.id === active;
        const isDone = completed.includes(s.id);
        const status: 'active' | 'done' | 'idle' = isDone ? 'done' : isActive ? 'active' : 'idle';
        const last = i === steps.length - 1;
        return (
          <View key={s.id} style={styles.stepWrap}>
            <Pressable
              onPress={() => onSelect?.(s.id)}
              disabled={!onSelect}
              style={styles.dotCol}
            >
              <View
                style={[
                  styles.dot,
                  status === 'active' && styles.dotActive,
                  status === 'done' && styles.dotDone,
                ]}
              >
                {status === 'done' ? (
                  <Icon name="Check" size={14} color={theme.color.textOnPrimary} strokeWidth={3} />
                ) : (
                  <Text style={[styles.dotNum, status === 'active' && { color: theme.color.textOnPrimary }]}>
                    {s.id}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  status === 'active' && { color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
                  status === 'done' && { color: theme.color.text, fontFamily: theme.fontFamily.medium },
                ]}
                numberOfLines={1}
              >
                {s.label}
              </Text>
            </Pressable>
            {!last ? (
              <View style={[styles.line, status === 'done' && styles.lineDone]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing[2],
  },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  dotCol: { flex: 1, alignItems: 'center', gap: 6 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { borderColor: theme.color.primary, backgroundColor: theme.color.primary },
  dotDone:   { borderColor: theme.color.primary, backgroundColor: theme.color.primary },
  dotNum:    { fontSize: 12, fontFamily: theme.fontFamily.bold, color: theme.color.textMuted },
  label: {
    fontSize: 11,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.regular,
    textAlign: 'center',
  },
  line: {
    height: 2,
    backgroundColor: theme.color.border,
    flex: 0.5,
    marginTop: 14,
    marginHorizontal: -10,
  },
  lineDone: { backgroundColor: theme.color.primary },
});
