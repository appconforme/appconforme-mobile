import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ApiCallError } from '@/lib/api/client';
import { evidencesApi } from '@/lib/evidences/api';
import type { Evidence } from '@/lib/evidences/types';

interface EvidenceListProps {
  inspectionId: string;
  inspectionAnswerId?: string | null;
  /** Notifica o renderer pai quando a contagem muda — usado pro answerValue. */
  onCountChange?: (count: number) => void;
  /** Desabilita o botão remover (status terminal etc.). */
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconFor(e: Evidence): string {
  return e.type === 'photo' || e.type === 'annotated_image' ? 'IMG' : 'DOC';
}

export function EvidenceList({
  inspectionId,
  inspectionAnswerId,
  onCountChange,
  disabled,
}: EvidenceListProps) {
  const qc = useQueryClient();

  const queryKey = [
    'evidences',
    { inspectionId, inspectionAnswerId: inspectionAnswerId ?? null },
  ] as const;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      evidencesApi.list({
        perPage: 50,
        ...(inspectionAnswerId
          ? { inspectionAnswerId }
          : { inspectionId }),
      }),
  });

  const items = data?.items ?? [];

  useEffect(() => {
    if (data) onCountChange?.(items.length);
  }, [data, items.length, onCountChange]);

  const removeMut = useMutation({
    mutationFn: (id: string) => evidencesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['evidences'] });
      void refetch();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiCallError ? err.message : 'Falha ao remover.';
      Alert.alert('Erro', msg);
    },
  });

  function confirmRemove(e: Evidence) {
    Alert.alert(
      'Remover evidência',
      `Tem certeza que quer remover "${e.fileName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeMut.mutate(e.id),
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Falha ao carregar evidências.</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sem evidências ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((e) => (
        <View key={e.id} style={styles.row}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>{iconFor(e)}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>
              {e.fileName}
            </Text>
            <Text style={styles.sub}>{formatSize(e.fileSize)}</Text>
          </View>
          <Pressable
            onPress={() => confirmRemove(e)}
            disabled={disabled || removeMut.isPending}
            hitSlop={6}
            style={({ pressed }) => [
              styles.removeBtn,
              pressed && styles.removePressed,
              (disabled || removeMut.isPending) && styles.removeDisabled,
            ]}
          >
            <Text style={styles.removeLabel}>Remover</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  empty: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: { fontSize: 12, color: '#64748b' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 11, fontWeight: '700', color: '#3730a3' },
  meta: { flex: 1, gap: 2 },
  name: { fontSize: 13, fontWeight: '500', color: '#0f172a' },
  sub: { fontSize: 11, color: '#64748b' },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  removePressed: { backgroundColor: '#fecaca' },
  removeDisabled: { opacity: 0.5 },
  removeLabel: { fontSize: 11, fontWeight: '700', color: '#991b1b' },
});
