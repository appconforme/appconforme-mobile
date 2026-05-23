/**
 * Tela "Minhas tarefas" / "Todas as tarefas" — pixel-perfect aos mockups
 * `Minhas Tarefas.png` e `Todas Tarefas.png`. Inspector vê "Minhas"; manager
 * pode alternar para "Todas".
 *
 * Layout: header + busca + chips de contagem + grupos colapsáveis por status.
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchField } from '@/components/ui/search-field';
import { TaskCardFull } from '@/components/tasks/TaskCardFull';
import { TaskGroupHeader, type GroupTone } from '@/components/tasks/TaskGroupHeader';
import { ApiCallError } from '@/lib/api/client';
import { useCurrentRole } from '@/lib/auth/actor';
import { useAuthStore } from '@/lib/auth/store';
import { isManagerRole } from '@/lib/permissions/roles';
import { tasksApi, type ListTasksQuery } from '@/lib/tasks/api';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';
import type { Task, TaskStatus } from '@/lib/tasks/types';

type ChipId = 'all' | 'pendentes' | 'atrasadas' | 'concluidas' | 'reabertas';

const PENDING_STATUSES: ReadonlySet<TaskStatus> = new Set(['open', 'assigned']);
const REOPENED_STATUSES: ReadonlySet<TaskStatus> = new Set(['rejected']);
const DONE_STATUSES: ReadonlySet<TaskStatus> = new Set(['approved']);

function isOverdue(t: Task): boolean {
  if (!t.dueDate) return false;
  if (DONE_STATUSES.has(t.status) || t.status === 'cancelled') return false;
  return new Date(t.dueDate).getTime() < Date.now();
}

export default function TarefasListScreen() {
  const router = useRouter();
  const role = useCurrentRole();
  const manager = isManagerRole(role);
  const [mode, setMode] = useState<'mine' | 'all'>(manager ? 'mine' : 'mine');
  const [chip, setChip] = useState<ChipId>('all');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);

  const query = useMemo<ListTasksQuery>(() => {
    const q: ListTasksQuery = { perPage: 100, sortBy: 'dueDate', sortOrder: 'asc' };
    if (mode === 'mine') q.assignedTo = 'me';
    return q;
  }, [mode]);

  const { data, isLoading, isRefetching, isError, error, refetch } = useQuery({
    queryKey: ['tasks', activeCompanyId, query],
    queryFn: () => tasksApi.list(query),
    enabled: !!activeCompanyId,
  });

  const allItems = data?.items ?? [];
  const searchLow = search.trim().toLowerCase();
  const filteredBySearch = useMemo(
    () => (searchLow ? allItems.filter((t) => t.title.toLowerCase().includes(searchLow)) : allItems),
    [allItems, searchLow],
  );

  const counts = useMemo(() => {
    const c = { all: filteredBySearch.length, pendentes: 0, atrasadas: 0, concluidas: 0, reabertas: 0 };
    for (const t of filteredBySearch) {
      if (PENDING_STATUSES.has(t.status)) c.pendentes++;
      if (DONE_STATUSES.has(t.status)) c.concluidas++;
      if (REOPENED_STATUSES.has(t.status)) c.reabertas++;
      if (isOverdue(t)) c.atrasadas++;
    }
    return c;
  }, [filteredBySearch]);

  const visible = useMemo(() => {
    if (chip === 'all') return filteredBySearch;
    if (chip === 'pendentes') return filteredBySearch.filter((t) => PENDING_STATUSES.has(t.status));
    if (chip === 'atrasadas') return filteredBySearch.filter(isOverdue);
    if (chip === 'concluidas') return filteredBySearch.filter((t) => DONE_STATUSES.has(t.status));
    return filteredBySearch.filter((t) => REOPENED_STATUSES.has(t.status));
  }, [filteredBySearch, chip]);

  const grouped = useMemo(() => {
    if (chip !== 'all') return null;
    const atrasadas: Task[] = [];
    const pendentes: Task[] = [];
    const concluidas: Task[] = [];
    const reabertas: Task[] = [];
    const outras: Task[] = [];
    for (const t of visible) {
      if (isOverdue(t)) atrasadas.push(t);
      else if (PENDING_STATUSES.has(t.status)) pendentes.push(t);
      else if (DONE_STATUSES.has(t.status)) concluidas.push(t);
      else if (REOPENED_STATUSES.has(t.status)) reabertas.push(t);
      else outras.push(t);
    }
    return { atrasadas, pendentes, concluidas, reabertas, outras };
  }, [visible, chip]);

  return (
    <Screen bg="app" edges={['top']}>
      <ScreenHeader
        title={mode === 'mine' ? 'Minhas tarefas' : 'Todas as tarefas'}
        subtitle={`${counts.all} tarefa${counts.all === 1 ? '' : 's'}`}
        rightActions={[{ icon: 'SlidersHorizontal', onPress: () => soon('Filtros avançados') }]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={theme.color.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar tarefas..."
          onClear={() => setSearch('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <Chip label="Todas"      count={counts.all}        active={chip === 'all'}       onPress={() => setChip('all')}        tone="default" />
          <Chip label="Pendentes"  count={counts.pendentes}  active={chip === 'pendentes'} onPress={() => setChip('pendentes')}  tone="warning" />
          <Chip label="Atrasadas"  count={counts.atrasadas}  active={chip === 'atrasadas'} onPress={() => setChip('atrasadas')}  tone="danger" />
          <Chip label="Concluídas" count={counts.concluidas} active={chip === 'concluidas'} onPress={() => setChip('concluidas')} tone="success" />
          <Chip label="Reabertas"  count={counts.reabertas}  active={chip === 'reabertas'} onPress={() => setChip('reabertas')}  tone="neutral" />
        </ScrollView>

        {manager ? (
          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode('mine')} style={[styles.modeBtn, mode === 'mine' && styles.modeBtnActive]}>
              <Text style={[styles.modeText, mode === 'mine' && styles.modeTextActive]}>Só minhas</Text>
            </Pressable>
            <Pressable onPress={() => setMode('all')} style={[styles.modeBtn, mode === 'all' && styles.modeBtnActive]}>
              <Text style={[styles.modeText, mode === 'all' && styles.modeTextActive]}>Todas da unidade</Text>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? null : isError ? (
          <ErrorState
            message={error instanceof ApiCallError ? error.message : 'Não foi possível carregar as tarefas.'}
            onRetry={() => void refetch()}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="ClipboardList"
            title={mode === 'mine' ? 'Nenhuma tarefa atribuída' : 'Nenhuma tarefa encontrada'}
            description={mode === 'mine'
              ? 'Quando uma tarefa for atribuída a você, aparece aqui.'
              : 'Não há tarefas que correspondam ao filtro selecionado.'}
            compact
          />
        ) : grouped ? (
          <View style={{ gap: 16 }}>
            <Group label="Atrasadas"  tone="danger"  items={grouped.atrasadas}  collapsed={collapsed} setCollapsed={setCollapsed}
                   onCard={(t) => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })} />
            <Group label="Pendentes"  tone="warning" items={grouped.pendentes}  collapsed={collapsed} setCollapsed={setCollapsed}
                   onCard={(t) => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })} />
            <Group label="Reabertas"  tone="info"    items={grouped.reabertas}  collapsed={collapsed} setCollapsed={setCollapsed}
                   onCard={(t) => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })} />
            <Group label="Concluídas" tone="success" items={grouped.concluidas} collapsed={collapsed} setCollapsed={setCollapsed}
                   onCard={(t) => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })} />
            <Group label="Outras"     tone="neutral" items={grouped.outras}     collapsed={collapsed} setCollapsed={setCollapsed}
                   onCard={(t) => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })} />
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {visible.map((t) => (
              <TaskCardFull
                key={t.id}
                task={t}
                onPress={() => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })}
              />
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mostrando {visible.length} de {counts.all} tarefas
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Group({
  label,
  tone,
  items,
  collapsed,
  setCollapsed,
  onCard,
}: {
  label: string;
  tone: GroupTone;
  items: Task[];
  collapsed: Record<string, boolean>;
  setCollapsed: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  onCard: (t: Task) => void;
}) {
  if (items.length === 0) return null;
  const isCollapsed = !!collapsed[label];
  return (
    <View style={{ gap: 8 }}>
      <TaskGroupHeader
        label={label}
        count={items.length}
        tone={tone}
        collapsed={isCollapsed}
        onToggle={() => setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))}
      />
      {!isCollapsed ? (
        <View style={{ gap: 8 }}>
          {items.slice(0, 3).map((t) => (
            <TaskCardFull key={t.id} task={t} onPress={() => onCard(t)} />
          ))}
          {items.length > 3 ? (
            <Pressable style={styles.moreBtn}>
              <Text style={styles.moreText}>+{items.length - 3} mais</Text>
              <Icon name="ChevronDown" size={14} color={theme.color.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    paddingBottom: 120,
    gap: theme.spacing[4],
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: theme.color.bgSubtle,
    borderRadius: theme.radius.md,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: theme.color.surface, ...theme.shadow.sm },
  modeText: {
    fontSize: theme.fontSize.base,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.medium,
  },
  modeTextActive: { color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: theme.color.primarySoft,
    borderRadius: theme.radius.md,
  },
  moreText: { fontSize: theme.fontSize.base, color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
  footer: {
    paddingTop: theme.spacing[3],
    alignItems: 'center',
  },
  footerText: { fontSize: theme.fontSize.sm, color: theme.color.textMuted },
});
