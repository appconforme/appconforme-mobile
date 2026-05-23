import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface BaseProps {
  children?: React.ReactNode;
  padded?: boolean | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface CardProps extends BaseProps {
  onPress?: never;
}

interface PressableCardProps extends BaseProps, Omit<PressableProps, 'children' | 'style'> {
  onPress: PressableProps['onPress'];
}

const PADDING: Record<'sm' | 'md' | 'lg', number> = {
  sm: theme.spacing[3],
  md: theme.spacing[4],
  lg: theme.spacing[5],
};

function resolvePad(p: BaseProps['padded']): number {
  if (!p) return 0;
  if (p === true) return PADDING.md;
  return PADDING[p];
}

export function Card(props: CardProps | PressableCardProps) {
  const { children, padded = 'md', bordered = true, elevated, style } = props;
  const containerStyle: StyleProp<ViewStyle> = [
    styles.card,
    bordered && styles.bordered,
    elevated && theme.shadow.sm,
    { padding: resolvePad(padded) },
    style,
  ];

  if ('onPress' in props && props.onPress) {
    const { onPress, ...rest } = props as PressableCardProps;
    return (
      <Pressable
        {...rest}
        onPress={onPress}
        style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  pressed: { backgroundColor: theme.color.bgSubtle },
});
