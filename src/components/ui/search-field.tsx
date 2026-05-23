import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '@/theme';
import { Icon } from './icon';

interface Props extends Omit<TextInputProps, 'style'> {
  onClear?: () => void;
}

export function SearchField({ value, onClear, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Icon name="Search" size={18} color={theme.color.textMuted} strokeWidth={2} />
      <TextInput
        value={value}
        placeholderTextColor={theme.color.textSubtle}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        {...rest}
      />
      {value && onClear ? (
        <Pressable onPress={onClear} hitSlop={6}>
          <Icon name="X" size={16} color={theme.color.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.color.text,
    paddingVertical: 0,
    fontFamily: theme.fontFamily.regular,
  },
});
