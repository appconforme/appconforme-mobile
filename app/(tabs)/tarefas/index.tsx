import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { ApiCallError } from '@/lib/api/client';
import { useCurrentRole } from '@/lib/auth/actor';
import { tasksApi, type ListTasksQuery } from '@/lib/tasks/api';
import {
  formatDueDate,
  isManagerRole,
  priorityColor,
  taskStatusTone,
} from '@/lib/tasks/helpers';
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type Task,
  type TaskStatus,
} from '@/lib/tasks/types';

type Filter = 'all' | 'mine_open' | 'mine_progress';

const CHIPS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'mine_open', label: 'Minhas pendentes' },
  { id: 'mine_progress', label: 'Em andamento' },
];

function buildQuery(
  filter: Filter,
  onlyMine: boolean,
  forceMine: boolean,
): ListTasksQuery {
  const q: ListTasksQuery = {
    perPage: 50,
    sortBy: 'dueDate',
    sortOrder: 'asc',
  };
  const mine = onlyMine || forceMine;
  if (mine) q.assignedTo = 'me';

  if (filter === 'mine_open') {
    q.assignedTo = 'me';
    // server suporta um status; pra abertas+atribuídas+rejeitadas, vamos
    // filtrar client-side. Aqui não setamos status.
  }
  if (filter === 'mine_progress') {
    q.assignedTo = 'me';
    q.status = 'in_progress';
  }
  return q;
}

const MINE_OPEN_STATUSES: ReadonlySet<TaskStatus> = new Set([
  'open',
  'assigned',
  'rejected',
]);

export default function TarefasListScreen() {
  const router = useRouter();
  const role = useCurrentRole();
  const manager = isManagerRole(role);
  const forceMine = !manager;
  const [onlyMine, setOnlyMine] = useState<boolean>(forceMine);
  const [filter, setFilter] = useState<Filter>(forceMine ? 'mine_open' : 'all');

  const query = useMemo(
    () => buildQuery(filter, onlyMine, forceMine),
    [filter, onlyMine, forceMine],
  );

  const {
    data,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks', query],
    queryFn: () => tasksApi.list(query),
  });

  const items = useMemo<Task[]>(() => {
    const list = data?.items ?? [];
    if (filter === 'mine_open') {
      return list.filter((t) => MINE_OPEN_STATUSES.has(t.status));
    }
    return list;
  }, [data, filter]);

  const emptyTitle = manager
    ? 'Nenhuma tarefa criada ainda'
    : 'Nenhuma tarefa atribuída';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>

        <View style={styles.chips}>
          {CHIPS.map((c) => {
            const active = filter === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setFilter(c.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => {
            if (forceMine) return;
            setOnlyMine((v) => !v);
          }}
          disabled={forceMine}
          style={styles.toggle}
        >
          <View
            style={[
              styles.toggleBox,
              (onlyMine || forceMine) && styles.toggleBoxOn,
            ]}
          >
            {(onlyMine || forceMine) ? (
              <Text style={styles.toggleCheck}>✓</Text>
            ) : null}
          </View>
          <Text style={styles.toggleLabel}>
            Só minhas{forceMine ? ' (sempre)' : ''}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2563eb" />
        </View>
      ) : isError ? (
        <ErrorState
          message={
            error instanceof ApiCallError
              ? error.message
              : 'Não foi possível carregar as tarefas.'
          }
          onRetry={() => void refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          contentContainerStyle={
            items.length === 0
              ? styles.listEmpty
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={emptyTitle}
              description={
                manager
                  ? 'Crie tarefas pelo painel web — o mobile é só pra execução.'
                  : 'Quando algo for atribuído a você, aparece aqui.'
              }
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/tarefas/[id]',
                  params: { id: item.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: priorityColor(item.priority) },
                  ]}
                />
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <StatusBadge
                  label={TASK_STATUS_LABEL[item.status]}
                  tone={taskStatusTone(item.status)}
                />
                <Text style={styles.metaText}>
                  {TASK_PRIORITY_LABEL[item.priority]}
                </Text>
                <Text
                  style={[
                    styles.metaText,
                    formatDueDate(item.dueDate).overdue && styles.overdue,
                  ]}
                >
                  {formatDueDate(item.dueDate).label}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#334155' },
  chipTextActive: { color: '#fff' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  toggleBoxOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  toggleCheck: { color: '#fff', fontSize: 13, fontWeight: '700' },
  toggleLabel: { fontSize: 13, color: '#334155' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingVertical: 8 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    gap: 8,
  },
  cardPressed: { backgroundColor: '#f8fafc' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: { fontSize: 12, color: '#64748b' },
  overdue: { color: '#dc2626', fontWeight: '600' },
});
