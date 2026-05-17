import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  renderItem,
  type AnswerInput,
} from '@/components/inspections/renderers';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { ApiCallError } from '@/lib/api/client';
import { useCurrentActor } from '@/lib/auth/actor';
import {
  CHECKLIST_ITEM_TYPE_LABEL,
  EVIDENCE_TYPE_LABEL,
} from '@/lib/checklists/types';
import { inspectionsApi } from '@/lib/inspections/api';
import {
  canComplete,
  canSaveAnswers,
  canStartInspection,
  inspectionStatusTone,
} from '@/lib/inspections/helpers';
import {
  INSPECTION_STATUS_LABEL,
  type InspectionAnswer,
  type InspectionItem,
  type InspectionStatus,
  type InspectionWithRelations,
} from '@/lib/inspections/types';

/** Tipos que ainda não são respondíveis pelo mobile (Fase D). */
const PLACEHOLDER_TYPES: ReadonlySet<string> = new Set([
  'photo',
  'signature',
  'file',
]);

function answerToInput(a: InspectionAnswer): AnswerInput {
  const input: AnswerInput = {
    checklistItemId: a.checklistItemId,
    answerType: a.answerType,
  };
  if (a.answerValue !== null) input.answerValue = a.answerValue;
  if (a.isConform !== null) input.isConform = a.isConform;
  if (a.comment !== null) input.comment = a.comment;
  return input;
}

function summarizeAnswer(a: InspectionAnswer | null): string {
  if (!a) return 'Sem resposta';
  const raw = (a.answerValue as { value?: unknown } | null)?.value;
  if (raw === 'yes') return 'Sim';
  if (raw === 'no') return 'Não';
  if (raw === 'conform') return 'Conforme';
  if (raw === 'not_conform') return 'Não conforme';
  if (typeof raw === 'string' && raw.length > 0) return raw;
  if (typeof raw === 'number') return String(raw);
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === 'string').join(', ');
  if (a.isConform === true) return 'Conforme';
  if (a.isConform === false) return 'Não conforme';
  return 'Respondido';
}

function parseMissingRequired(err: ApiCallError): number | null {
  const d = err.details;
  if (!d) return null;
  if (typeof d.missingRequired === 'number') return d.missingRequired;
  if (Array.isArray(d.missingRequired)) return d.missingRequired.length;
  if (Array.isArray(d.missing)) return d.missing.length;
  return null;
}

function statusBanner(
  status: InspectionStatus,
): { tone: 'pending' | 'conform' | 'non-conform' | 'neutral'; text: string } | null {
  switch (status) {
    case 'completed':
      return { tone: 'pending', text: 'Aguardando revisão do gestor.' };
    case 'approved':
      return { tone: 'conform', text: 'Inspeção aprovada.' };
    case 'rejected':
      return {
        tone: 'non-conform',
        text: 'Inspeção reprovada. Você pode iniciar novamente para refazer.',
      };
    case 'cancelled':
      return { tone: 'neutral', text: 'Inspeção cancelada.' };
    default:
      return null;
  }
}

const BANNER_COLORS: Record<
  'pending' | 'conform' | 'non-conform' | 'neutral',
  { bg: string; fg: string }
> = {
  pending: { bg: '#fef3c7', fg: '#92400e' },
  conform: { bg: '#dcfce7', fg: '#166534' },
  'non-conform': { bg: '#fee2e2', fg: '#991b1b' },
  neutral: { bg: '#f1f5f9', fg: '#475569' },
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
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

export default function InspecaoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const actor = useCurrentActor();

  const inspectionId = id ?? '';

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['inspection', inspectionId],
    queryFn: () => inspectionsApi.getById(inspectionId),
    enabled: !!inspectionId,
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {data?.title ?? 'Inspeção'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2563eb" />
        </View>
      ) : isError || !data ? (
        <ErrorState
          message={
            error instanceof ApiCallError
              ? error.message
              : 'Não foi possível carregar a inspeção.'
          }
          onRetry={() => void refetch()}
        />
      ) : (
        <DetailBody
          inspection={data}
          actor={actor}
          onMutated={() => {
            void qc.invalidateQueries({ queryKey: ['inspection', inspectionId] });
            void qc.invalidateQueries({ queryKey: ['inspections'] });
          }}
        />
      )}
    </SafeAreaView>
  );
}

interface DetailBodyProps {
  inspection: InspectionWithRelations;
  actor: ReturnType<typeof useCurrentActor>;
  onMutated: () => void;
}

function DetailBody({ inspection, actor, onMutated }: DetailBodyProps) {
  const actorCtx = useMemo(
    () => ({
      companyUserId: actor?.companyUserId ?? null,
      role: actor?.role ?? null,
    }),
    [actor],
  );

  const editable = canSaveAnswers(inspection, actorCtx);
  const canStart = canStartInspection(inspection, actorCtx);
  const canFinish = canComplete(inspection, actorCtx);

  const items = useMemo<InspectionItem[]>(
    () =>
      [...(inspection.checklist.items ?? [])].sort((a, b) => a.order - b.order),
    [inspection.checklist.items],
  );

  const answerByItemId = useMemo(() => {
    const m = new Map<string, InspectionAnswer>();
    (inspection.answers ?? []).forEach((a) => m.set(a.checklistItemId, a));
    return m;
  }, [inspection.answers]);

  // Buffer de respostas — hidrata com o que está persistido.
  const [buffer, setBuffer] = useState<Map<string, AnswerInput>>(() => {
    const init = new Map<string, AnswerInput>();
    (inspection.answers ?? []).forEach((a) => {
      init.set(a.checklistItemId, answerToInput(a));
    });
    return init;
  });

  // Re-hidrata quando a ref de `answers` muda (refetch após save/start).
  const lastHydratedRef = useRef<InspectionAnswer[] | null>(null);
  useEffect(() => {
    if (lastHydratedRef.current === inspection.answers) return;
    lastHydratedRef.current = inspection.answers;
    const next = new Map<string, AnswerInput>();
    (inspection.answers ?? []).forEach((a) => {
      next.set(a.checklistItemId, answerToInput(a));
    });
    setBuffer(next);
  }, [inspection.answers]);

  const handleChange = useCallback(
    (itemId: string, next: AnswerInput | null) => {
      setBuffer((prev) => {
        const copy = new Map(prev);
        if (next === null) copy.delete(itemId);
        else copy.set(itemId, next);
        return copy;
      });
    },
    [],
  );

  const startMut = useMutation({
    mutationFn: () => inspectionsApi.start(inspection.id),
    onSuccess: () => {
      onMutated();
      Alert.alert('OK', 'Inspeção iniciada.');
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiCallError ? err.message : 'Falha ao iniciar.';
      Alert.alert('Erro', msg);
    },
  });

  const saveMut = useMutation({
    mutationFn: (answers: AnswerInput[]) =>
      inspectionsApi.saveAnswers(inspection.id, answers),
    onSuccess: (resp) => {
      onMutated();
      Alert.alert('OK', `${resp.saved} resposta(s) salva(s).`);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiCallError ? err.message : 'Falha ao salvar respostas.';
      Alert.alert('Erro', msg);
    },
  });

  const completeMut = useMutation({
    mutationFn: () => inspectionsApi.complete(inspection.id),
    onSuccess: () => {
      onMutated();
      Alert.alert('OK', 'Inspeção concluída — aguardando revisão.');
    },
    onError: (err: unknown) => {
      if (err instanceof ApiCallError) {
        const missing = parseMissingRequired(err);
        if (missing && missing > 0) {
          Alert.alert(
            'Não foi possível concluir',
            `Faltam ${missing} item(ns) obrigatório(s).`,
          );
          return;
        }
        Alert.alert('Erro', err.message);
        return;
      }
      Alert.alert('Erro', 'Falha ao concluir inspeção.');
    },
  });

  function onSave() {
    if (buffer.size === 0) {
      Alert.alert('Nada a salvar', 'Você ainda não respondeu nenhum item.');
      return;
    }
    saveMut.mutate(Array.from(buffer.values()));
  }

  function onComplete() {
    Alert.alert(
      'Concluir inspeção',
      'Após concluir, a inspeção fica aguardando revisão do gestor.',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Concluir',
          style: 'default',
          onPress: () => completeMut.mutate(),
        },
      ],
    );
  }

  const banner = statusBanner(inspection.status);
  const pendingCount = buffer.size;
  const loading = startMut.isPending || saveMut.isPending || completeMut.isPending;
  const showFooter = canStart || editable;

  return (
    <>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.section}>
          <Text style={styles.h1}>{inspection.title}</Text>
          <View style={styles.metaRow}>
            <StatusBadge
              label={INSPECTION_STATUS_LABEL[inspection.status]}
              tone={inspectionStatusTone(inspection.status)}
            />
            <Text style={styles.metaText}>
              {inspection.checklist.title} · v{inspection.checklist.version}
            </Text>
          </View>
        </View>

        {banner ? (
          <View
            style={[
              styles.banner,
              { backgroundColor: BANNER_COLORS[banner.tone].bg },
            ]}
          >
            <Text style={[styles.bannerText, { color: BANNER_COLORS[banner.tone].fg }]}>
              {banner.text}
            </Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>
              {inspection.locationSnapshot?.name ?? '—'}
            </Text>
            {inspection.locationSnapshot?.code ? (
              <Text style={styles.metaText}>
                {inspection.locationSnapshot.code}
              </Text>
            ) : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Responsável</Text>
            <Text style={styles.value}>
              {inspection.assignedToSnapshot?.fullName ?? '—'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Criada em</Text>
            <Text style={styles.value}>{formatDateTime(inspection.createdAt)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Concluída em</Text>
            <Text style={styles.value}>{formatDateTime(inspection.completedAt)}</Text>
          </View>
        </View>

        {inspection.description ? (
          <View style={styles.section}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.paragraph}>{inspection.description}</Text>
          </View>
        ) : null}

        <View style={styles.itemsHeader}>
          <Text style={styles.h2}>Itens</Text>
          <Text style={styles.metaText}>{items.length} no checklist</Text>
        </View>

        <View style={styles.items}>
          {items.map((item, idx) => {
            const value = buffer.get(item.id) ?? null;
            const persisted = answerByItemId.get(item.id) ?? null;
            const isPlaceholder = PLACEHOLDER_TYPES.has(item.type);
            return (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIdx}>
                    {String(idx + 1).padStart(2, '0')}
                  </Text>
                  <View style={styles.itemTitleWrap}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.isRequired ? (
                        <View style={styles.requiredTag}>
                          <Text style={styles.requiredText}>OBRIG.</Text>
                        </View>
                      ) : null}
                      {value && !isPlaceholder ? (
                        <View style={styles.answeredTag}>
                          <Text style={styles.answeredText}>RESPONDIDO</Text>
                        </View>
                      ) : null}
                    </View>
                    {item.description ? (
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    ) : null}
                    <View style={styles.itemMetaRow}>
                      <Text style={styles.itemMeta}>
                        {CHECKLIST_ITEM_TYPE_LABEL[item.type]}
                      </Text>
                      {item.requiresEvidence && item.evidenceType ? (
                        <Text style={styles.itemMetaAccent}>
                          + {EVIDENCE_TYPE_LABEL[item.evidenceType]}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.itemBody}>
                  {editable ? (
                    renderItem(item, {
                      item,
                      value,
                      onChange: (next) => handleChange(item.id, next),
                      disabled: false,
                      inspectionId: inspection.id,
                      inspectionAnswerId: persisted?.id ?? null,
                    })
                  ) : isPlaceholder ? (
                    renderItem(item, {
                      item,
                      value,
                      onChange: () => undefined,
                      disabled: true,
                      inspectionId: inspection.id,
                      inspectionAnswerId: persisted?.id ?? null,
                    })
                  ) : (
                    <View style={styles.readOnly}>
                      <Text style={styles.readOnlyLabel}>Resposta</Text>
                      <Text style={styles.readOnlyValue}>
                        {summarizeAnswer(persisted)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {showFooter ? (
        <View style={styles.footer}>
          {canStart ? (
            <Button
              label="Iniciar inspeção"
              onPress={() => startMut.mutate()}
              loading={loading}
            />
          ) : null}
          {editable ? (
            <>
              <Button
                label={
                  pendingCount > 0
                    ? `Salvar (${pendingCount})`
                    : 'Salvar respostas'
                }
                onPress={onSave}
                variant="secondary"
                loading={saveMut.isPending}
              />
              {canFinish ? (
                <Button
                  label="Concluir inspeção"
                  onPress={onComplete}
                  loading={completeMut.isPending}
                />
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  backBtn: { minWidth: 70, paddingVertical: 6 },
  backText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, paddingBottom: 32, gap: 18 },
  section: { gap: 8 },
  h1: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  h2: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaText: { fontSize: 12, color: '#64748b' },
  banner: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bannerText: { fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 16 },
  col: { flex: 1, gap: 4 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: { fontSize: 14, color: '#0f172a' },
  paragraph: { fontSize: 14, color: '#334155', lineHeight: 20 },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  items: { gap: 10 },
  item: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    gap: 10,
  },
  itemHeader: { flexDirection: 'row', gap: 10 },
  itemIdx: {
    fontSize: 11,
    color: '#64748b',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  itemTitleWrap: { flex: 1, gap: 4 },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemDesc: { fontSize: 12.5, color: '#64748b' },
  itemMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemMeta: { fontSize: 11.5, color: '#64748b' },
  itemMetaAccent: { fontSize: 11.5, color: '#2563eb', fontWeight: '500' },
  requiredTag: {
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 3,
    backgroundColor: '#fee2e2',
  },
  requiredText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#991b1b',
    letterSpacing: 0.3,
  },
  answeredTag: {
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 3,
    backgroundColor: '#dcfce7',
  },
  answeredText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  itemBody: { marginTop: 4 },
  readOnly: {
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  readOnlyLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  readOnlyValue: { fontSize: 13, color: '#0f172a' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
});
