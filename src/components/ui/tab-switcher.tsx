/**
 * Sub-tabs internas (Checklist / Anexos / Histórico) — não confundir com
 * o BottomTab da navegação. Estilo "underline" da Apple, pixel-perfect ao
 * mockup "Tarefa - Checklist.png".
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

interface Tab<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  tabs: ReadonlyArray<Tab<T>>;
  active: T;
  onChange: (id: T) => void;
  scrollable?: boolean;
}

export function TabSwitcher<T extends string>({ tabs, active, onChange, scrollable }: Props<T>) {
  const content = (
    <View style={styles.row}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={styles.tab}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {t.label}
              {typeof t.count === 'number' ? ` (${t.count})` : ''}
            </Text>
            <View style={[styles.underline, isActive && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {content}
      </ScrollView>
    );
  }
  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  scroll: {
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  scrollContent: { paddingHorizontal: theme.spacing[3] },
  row: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.medium,
    paddingBottom: 10,
  },
  labelActive: { color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
  labelInactive: { color: theme.color.textMuted },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  underlineActive: { backgroundColor: theme.color.primary },
});
