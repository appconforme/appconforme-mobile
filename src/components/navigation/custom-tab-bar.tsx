/**
 * BottomTabBar pixel-perfect ao mockup "Tela Principal.png".
 * 5 slots: Início | Tarefas | [FAB Registrar] | Relatórios | Mais
 *
 * O 4º slot visual é um FAB elevado e azul que abre o BottomSheet de ações
 * via `useFabStore`. Não é uma rota.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { theme } from '@/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { useFabStore } from '@/lib/ui/fab-store';

interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  route: string;
}

const TABS: ReadonlyArray<TabItem> = [
  { key: 'inicio',      label: 'Início',     icon: 'Home',         route: '/(tabs)/inicio' },
  { key: 'tarefas',     label: 'Tarefas',    icon: 'ListChecks',   route: '/(tabs)/tarefas' },
  { key: 'relatorios',  label: 'Relatórios', icon: 'BarChart3',    route: '/(tabs)/relatorios' },
  { key: 'mais',        label: 'Mais',       icon: 'Menu',         route: '/(tabs)/mais' },
];

export function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const openFab = useFabStore((s) => s.setOpen);

  // segments tipicamente: ['(tabs)', 'inicio'] | ['(tabs)', 'tarefas', '[id]'] etc.
  const activeSegment = segments[1] ?? 'inicio';

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {/* Renderiza tabs em 2 grupos: [esq] [FAB] [dir] */}
      <View style={styles.row}>
        {TABS.slice(0, 2).map((t) => (
          <TabButton
            key={t.key}
            item={t}
            active={activeSegment === t.key}
            onPress={() => router.replace(t.route as never)}
          />
        ))}

        <View style={styles.fabSlot}>
          <Pressable
            onPress={() => openFab(true)}
            style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.96 }] }]}
            accessibilityRole="button"
            accessibilityLabel="Registrar nova ocorrência"
          >
            <Icon name="Plus" size={28} color={theme.color.textOnPrimary} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.fabLabel}>Registrar</Text>
        </View>

        {TABS.slice(2).map((t) => (
          <TabButton
            key={t.key}
            item={t}
            active={activeSegment === t.key}
            onPress={() => router.replace(t.route as never)}
          />
        ))}
      </View>
    </View>
  );
}

function TabButton({
  item,
  active,
  onPress,
}: {
  item: TabItem;
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? theme.color.primary : theme.color.textMuted;
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Icon name={item.icon} size={22} color={color} strokeWidth={active ? 2.2 : 1.8} />
      <Text style={[styles.label, { color, fontFamily: active ? theme.fontFamily.semibold : theme.fontFamily.medium }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.color.surface,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22, // eleva acima da barra
    borderWidth: 4,
    borderColor: theme.color.surface,
    ...theme.shadow.fab,
  },
  fabLabel: {
    fontSize: 11,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.primary,
  },
});
