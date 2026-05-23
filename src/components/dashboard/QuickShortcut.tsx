/**
 * Atalho rápido — cartão pequeno usado na seção "Atalhos rápidos" do Dashboard.
 * 4 atalhos por linha (Nova inspeção, Enviar evidência, Assinatura, Ler QR Code).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from '@/components/ui/icon';

interface Props {
  icon: IconName;
  label: string;
  tone?: 'primary' | 'success' | 'accent' | 'orange';
  onPress: () => void;
}

const TONE_BG: Record<NonNullable<Props['tone']>, { bg: string; fg: string }> = {
  primary: { bg: theme.color.primarySoft, fg: theme.color.primary },
  success: { bg: theme.color.successBg,  fg: theme.color.successFg },
  accent:  { bg: theme.color.accentBg,   fg: theme.color.accentFg },
  orange:  { bg: theme.color.orangeBg,   fg: theme.color.orangeFg },
};

export function QuickShortcut({ icon, label, tone = 'primary', onPress }: Props) {
  const t = TONE_BG[tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { backgroundColor: theme.color.bgSubtle }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: t.bg }]}>
        <Icon name={icon} size={20} color={t.fg} strokeWidth={2} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.color.text,
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
  },
});
