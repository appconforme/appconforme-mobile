/**
 * BottomSheet do FAB "Registrar" — pixel-perfect ao mockup
 * `Tela Ação Botão Registrar.png`. 6 ações em coluna com ícone + label.
 *
 * Algumas ações têm rota real (Nova inspeção, Registrar ocorrência);
 * outras emitem "em breve" via `soon()` até o backend existir.
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon, type IconName } from '@/components/ui/icon';
import { useFabStore } from '@/lib/ui/fab-store';
import { soon } from '@/lib/ui/soon';

interface Action {
  key: string;
  label: string;
  icon: IconName;
  tone: 'primary' | 'success' | 'accent' | 'danger' | 'warning' | 'orange';
  onSelect: (helpers: { router: ReturnType<typeof useRouter>; close: () => void }) => void;
}

const TONE_BG: Record<Action['tone'], string> = {
  primary: theme.color.primarySoft,
  success: theme.color.successBg,
  accent:  theme.color.accentBg,
  danger:  theme.color.dangerBg,
  warning: theme.color.warningBg,
  orange:  theme.color.orangeBg,
};
const TONE_FG: Record<Action['tone'], string> = {
  primary: theme.color.primary,
  success: theme.color.successFg,
  accent:  theme.color.accentFg,
  danger:  theme.color.dangerFg,
  warning: theme.color.warningFg,
  orange:  theme.color.orangeFg,
};

const ACTIONS: ReadonlyArray<Action> = [
  {
    key: 'inspecao', label: 'Nova inspeção', icon: 'ClipboardCheck', tone: 'primary',
    onSelect: ({ router, close }) => { close(); router.push('/(tabs)/inspecoes' as never); },
  },
  {
    key: 'tarefa', label: 'Nova tarefa', icon: 'CheckSquare', tone: 'success',
    onSelect: ({ close }) => { close(); soon('Criar tarefa pelo mobile'); },
  },
  {
    key: 'evidencia', label: 'Registrar evidência', icon: 'Camera', tone: 'accent',
    onSelect: ({ close }) => { close(); soon('Captura rápida de evidência'); },
  },
  {
    key: 'nc', label: 'Não conformidade', icon: 'AlertTriangle', tone: 'danger',
    onSelect: ({ router, close }) => { close(); router.push('/registrar-ocorrencia' as never); },
  },
  {
    key: 'qr', label: 'Escanear QR Code', icon: 'QrCode', tone: 'warning',
    onSelect: ({ close }) => { close(); soon('Scanner QR Code'); },
  },
  {
    key: 'ocorrencia', label: 'Registrar ocorrência', icon: 'FileWarning', tone: 'orange',
    onSelect: ({ router, close }) => { close(); router.push('/registrar-ocorrencia' as never); },
  },
];

export function RegisterFabSheet() {
  const router = useRouter();
  const open = useFabStore((s) => s.open);
  const setOpen = useFabStore((s) => s.setOpen);
  const close = () => setOpen(false);

  return (
    <BottomSheet visible={open} onClose={close}>
      <Text style={styles.title}>O que deseja registrar?</Text>
      <View style={styles.list}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.key}
            onPress={() => a.onSelect({ router, close })}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.color.bgSubtle }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: TONE_BG[a.tone] }]}>
              <Icon name={a.icon} size={22} color={TONE_FG[a.tone]} strokeWidth={2} />
            </View>
            <Text style={styles.label}>{a.label}</Text>
            <Icon name="ChevronRight" size={20} color={theme.color.textSubtle} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.text,
    marginBottom: theme.spacing[3],
  },
  list: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.radius.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.medium,
    color: theme.color.text,
  },
});
