import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/theme';
import { Icon, type IconName } from './icon';

interface RightAction {
  icon?: IconName;
  label?: string;
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger';
}

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  rightActions?: RightAction[];
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ title, subtitle, back, rightActions, style }: Props) {
  const router = useRouter();
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.side}>
        {back ? (
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <Icon name="ChevronLeft" size={24} color={theme.color.text} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>
        {rightActions?.map((a, i) => (
          <Pressable key={i} onPress={a.onPress} hitSlop={8} style={styles.iconBtn}>
            {a.icon ? (
              <Icon
                name={a.icon}
                size={22}
                color={a.tone === 'primary' ? theme.color.primary : a.tone === 'danger' ? theme.color.dangerFg : theme.color.text}
              />
            ) : a.label ? (
              <Text style={{ color: theme.color.primary, fontFamily: theme.fontFamily.semibold, fontSize: theme.fontSize.md }}>
                {a.label}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.color.surface,
  },
  side: { minWidth: 44, flexDirection: 'row', gap: 4, alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  iconBtn: { padding: 6 },
  center: { flex: 1, alignItems: 'center' },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.regular,
    marginTop: 1,
  },
});
