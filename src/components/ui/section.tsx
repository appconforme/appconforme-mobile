import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface Props {
  title?: string;
  action?: { label: string; onPress: () => void };
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  spacing?: number;
}

export function Section({ title, action, children, style, spacing = theme.spacing[3] }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {(title || action) ? (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {action ? (
            <Pressable onPress={action.onPress} hitSlop={8}>
              {({ pressed }) => (
                <Text style={[styles.action, pressed && { opacity: 0.6 }]}>{action.label}</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={{ gap: spacing }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing[3] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...theme.text.h3,
    color: theme.color.text,
    fontFamily: theme.fontFamily.semibold,
  },
  action: {
    ...theme.text.smallStrong,
    color: theme.color.primary,
    fontFamily: theme.fontFamily.medium,
  },
});
