import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

const VARIANTS: Record<
  ButtonVariant,
  { bg: string; fg: string; pressed: string; border?: string }
> = {
  primary: { bg: '#2563eb', fg: '#fff', pressed: '#1d4ed8' },
  secondary: {
    bg: '#fff',
    fg: '#0f172a',
    pressed: '#f1f5f9',
    border: '#e2e8f0',
  },
  danger: { bg: '#dc2626', fg: '#fff', pressed: '#b91c1c' },
  ghost: { bg: 'transparent', fg: '#2563eb', pressed: '#f1f5f9' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: pressed && !isDisabled ? v.pressed : v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.label, { color: v.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  label: { fontSize: 15, fontWeight: '600' },
});
