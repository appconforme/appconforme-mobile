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
import { useAuthStore } from '@/lib/auth/store';
import { inspectionsApi, type ListInspectionsQuery } from '@/lib/inspections/api';
import { inspectionStatusTone } from '@/lib/inspections/helpers';
import {
  INSPECTION_STATUS_LABEL,
  type Inspection,
  type InspectionStatus,
} from '@/lib/inspections/types';
import { isManagerRole } from '@/lib/permissions/roles';

type Chip = { id: 'all' | InspectionStatus; label: string };

const CHIPS: Chip[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'in_progress', label: 'Em andamento' },
  { id: 'completed', label: 'Concluídas' },
];

function buildQuery(
  chip: Chip['id'],
  onlyMine: boolean,
  forceMine: boolean,
): ListInspectionsQuery {
  const q: ListInspectionsQuery = {
    perPage: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };
  if (onlyMine || forceMine) q.assignedTo = 'me';
  if (chip !== 'all') q.status = chip;
  return q;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function InspecoesListScreen() {
  const router = useRouter();
  const role = useCurrentRole();
  const manager = isManagerRole(role);
  const forceMine = !manager;
  const [onlyMine, setOnlyMine] = useState<boolean>(forceMine);
  const [chip, setChip] = useState<Chip['id']>('all');

  const query = useMemo(
    () => buildQuery(chip, onlyMine, forceMine),
    [chip, onlyMine, forceMine],
  );

  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);

  const { data, isLoading, isRefetching, isError, error, refetch } = useQuery({
    queryKey: ['inspections', activeCompanyId, query],
    queryFn: () => inspectionsApi.list(query),
    enabled: !!activeCompanyId,
  });

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(
      `[inspecoes] activeCompanyId=${activeCompanyId} role=${role} forceMine=${forceMine} chip=${chip} loading=${isLoading} error=${isError} items=${data?.items?.length ?? 'null'} query=${JSON.stringify(query)}`,
    );
  }

  const items: Inspection[] = data?.items ?? [];

  const emptyTitle = manager
    ? 'Nenhuma inspeção encontrada'
    : 'Nenhuma inspeção atribuída';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspeções</Text>

        <View style={styles.chips}>
          {CHIPS.map((c) => {
            const active = chip === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setChip(c.id)}
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
            {onlyMine || forceMine ? (
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
              : 'Não foi possível carregar as inspeções.'
          }
          onRetry={() => void refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          contentContainerStyle={
            items.length === 0 ? styles.listEmpty : styles.listContent
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
                  ? 'Crie e atribua inspeções pelo painel web.'
                  : 'Quando uma inspeção for atribuída a você, aparece aqui.'
              }
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/inspecoes/[id]',
                  params: { id: item.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.cardMeta}>
                <StatusBadge
                  label={INSPECTION_STATUS_LABEL[item.status]}
                  tone={inspectionStatusTone(item.status)}
                />
                {item.assignedToSnapshot ? (
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.assignedToSnapshot.fullName}
                  </Text>
                ) : (
                  <Text style={styles.metaText}>Sem responsável</Text>
                )}
                <Text style={styles.metaText}>{formatDate(item.updatedAt)}</Text>
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
    gap: 10,
  },
  cardPressed: { backgroundColor: '#f8fafc' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: { fontSize: 12, color: '#64748b' },
});
