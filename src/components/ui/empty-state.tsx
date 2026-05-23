import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Button, type ButtonVariant } from './button';
import { Icon, type IconName } from './icon';

interface Action {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
}

interface Props {
  icon?: IconName;
  title: string;
  description?: string;
  action?: Action;
  secondaryAction?: Action;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, compact && styles.compact, style]}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={32} color={theme.color.primary} strokeWidth={1.8} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {action ? (
        <View style={styles.actions}>
          <Button
            label={action.label}
            onPress={action.onPress}
            variant={action.variant ?? 'primary'}
            leftIcon={action.icon}
            size="md"
          />
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant={secondaryAction.variant ?? 'ghost'}
              leftIcon={secondaryAction.icon}
              size="md"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  compact: { paddingVertical: theme.spacing[5] },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.text,
    textAlign: 'center',
  },
  desc: {
    fontSize: theme.fontSize.md,
    color: theme.color.textMuted,
    textAlign: 'center',
    fontFamily: theme.fontFamily.regular,
    lineHeight: theme.lineHeight.md,
    maxWidth: 320,
  },
  actions: { marginTop: theme.spacing[3], gap: 8, alignItems: 'stretch', alignSelf: 'stretch' },
});
