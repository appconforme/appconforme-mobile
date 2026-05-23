import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
}

export const TextField = forwardRef<TextInput, Props>(function TextField(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    required,
    secureTextEntry,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const borderColor = hasError
    ? theme.color.dangerFg
    : focused
    ? theme.color.primary
    : theme.color.border;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View style={[styles.field, { borderColor, backgroundColor: theme.color.surface }]}>
        {leftIcon ? (
          <Icon name={leftIcon} size={18} color={focused ? theme.color.primary : theme.color.textMuted} />
        ) : null}
        <TextInput
          ref={ref}
          {...rest}
          placeholderTextColor={theme.color.textSubtle}
          secureTextEntry={secureTextEntry}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={styles.input}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Icon name={rightIcon} size={18} color={theme.color.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.color.text,
    marginBottom: 6,
  },
  required: { color: theme.color.dangerFg },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: theme.radius.md,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.color.text,
    fontFamily: theme.fontFamily.regular,
    paddingVertical: 0,
  },
  hint: { marginTop: 6, fontSize: theme.fontSize.sm, color: theme.color.textMuted },
  error: { marginTop: 6, fontSize: theme.fontSize.sm, color: theme.color.dangerFg, fontFamily: theme.fontFamily.medium },
});
