import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface VariantStyle {
  bg: string;
  fg: string;
  pressed: string;
  border?: string;
}

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary:   { bg: theme.color.primary,      fg: theme.color.textOnPrimary, pressed: theme.color.primaryHover },
  secondary: { bg: theme.color.surface,      fg: theme.color.text,          pressed: theme.color.bgSubtle,    border: theme.color.border },
  danger:    { bg: theme.raw.red600,         fg: theme.color.textOnPrimary, pressed: theme.raw.red700 },
  ghost:     { bg: theme.color.transparent,  fg: theme.color.primary,       pressed: theme.color.primarySoft },
  outline:   { bg: theme.color.transparent,  fg: theme.color.primary,       pressed: theme.color.primarySoft, border: theme.color.primary },
};

const SIZES: Record<ButtonSize, { paddingV: number; paddingH: number; minHeight: number; fontSize: number; iconSize: number; gap: number }> = {
  sm: { paddingV: 8,  paddingH: 12, minHeight: 36, fontSize: theme.fontSize.md, iconSize: 16, gap: 6 },
  md: { paddingV: 12, paddingH: 16, minHeight: 44, fontSize: theme.fontSize.lg, iconSize: 18, gap: 8 },
  lg: { paddingV: 14, paddingH: 20, minHeight: 52, fontSize: theme.fontSize.lg, iconSize: 20, gap: 10 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  full,
  style,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = !!disabled || !!loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: pressed && !isDisabled ? v.pressed : v.bg,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          minHeight: s.minHeight,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
          opacity: isDisabled ? 0.55 : 1,
          gap: s.gap,
          alignSelf: full ? 'stretch' : 'auto',
          width: full ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <View style={[styles.inner, { gap: s.gap }]}>
          {leftIcon ? <Icon name={leftIcon} size={s.iconSize} color={v.fg} /> : null}
          <Text style={[styles.label, { color: v.fg, fontSize: s.fontSize, fontFamily: theme.fontFamily.semibold }]}>
            {label}
          </Text>
          {rightIcon ? <Icon name={rightIcon} size={s.iconSize} color={v.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  label: { letterSpacing: 0.1 },
});
