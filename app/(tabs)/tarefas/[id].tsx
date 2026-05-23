/**
 * Detalhe de Tarefa — pixel-perfect aos mockups Tarefa-{Checklist,Anexos,Histórico}.png.
 * Sub-tabs internas reaproveitam:
 *   - Checklist: renderers de inspections (se task.inspectionId existir)
 *   - Anexos:    EvidenceList por inspection
 *   - Histórico: timeline dos task.events
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatusPill } from '@/components/ui/status-pill';
import { TabSwitcher } from '@/components/ui/tab-switcher';
import { TaskHistoryTimeline } from '@/components/tasks/TaskHistoryTimeline';
import {
  renderItem,
  type AnswerInput,
} from '@/components/inspections/renderers';
import { EvidenceList } from '@/components/inspections/evidence/EvidenceList';
import { EvidenceUploader } from '@/components/inspections/evidence/EvidenceUploader';
import { ApiCallError } from '@/lib/api/client';
import { useCurrentActor } from '@/lib/auth/actor';
import { inspectionsApi } from '@/lib/inspections/api';
import {
  canComplete,
  canSaveAnswers,
  canStartInspection,
} from '@/lib/inspections/helpers';
import type {
  InspectionAnswer,
  InspectionItem,
  InspectionWithRelations,
} from '@/lib/inspections/types';
import { tasksApi } from '@/lib/tasks/api';
import {
  canCancelTask,
  canStartTask,
  canSubmitTask,
} from '@/lib/tasks/helpers';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';
import type { TaskWithEvents } from '@/lib/tasks/types';

type SubTab = 'checklist' | 'anexos' | 'historico';

export default function TarefaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = id ?? '';
  const [tab, setTab] = useState<SubTab>('checklist');

  const { data: task, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
    enabled: !!taskId,
  });

  // Carrega inspection relacionada (se houver). Permite renderizar checklist completo.
  const inspectionId = task?.inspectionId ?? null;
  const { data: inspection } = useQuery({
    queryKey: ['inspection', inspectionId],
    queryFn: () => inspectionsApi.getById(inspectionId as string),
    enabled: !!inspectionId,
  });

  const items = useMemo<InspectionItem[]>(
    () => inspection ? [...(inspection.checklist.items ?? [])].sort((a, b) => a.order - b.order) : [],
    [inspection],
  );

  const answeredCount = inspection?.answers?.length ?? 0;
  const progress = items.length > 0 ? answeredCount / items.length : 0;

  return (
    <Screen bg="app" edges={['top']}>
      <ScreenHeader
        back
        title={task?.title ?? 'Tarefa'}
        subtitle={task?.locationId ? `Área: ${task.locationId}` : undefined}
        rightActions={[{ icon: 'MoreVertical', onPress: () => soon('Mais ações da tarefa') }]}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.color.primary} />
        </View>
      ) : isError || !task ? (
        <ErrorState
          message={error instanceof ApiCallError ? error.message : 'Não foi possível carregar a tarefa.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          {inspection ? (
            <View style={styles.progressWrap}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progresso</Text>
                <Text style={styles.progressValue}>{answeredCount}/{items.length}</Text>
              </View>
              <ProgressBar value={progress} />
            </View>
          ) : null}

          <TabSwitcher<SubTab>
            tabs={[
              { id: 'checklist', label: 'Checklist' },
              { id: 'anexos',    label: 'Anexos' },
              { id: 'historico', label: 'Histórico' },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === 'checklist' ? (
            <ChecklistTab task={task} inspection={inspection ?? null} items={items} />
          ) : tab === 'anexos' ? (
            <AnexosTab inspection={inspection ?? null} />
          ) : (
            <HistoricoTab task={task} />
          )}
        </>
      )}
    </Screen>
  );
}

// =====================================================================
// Sub-tab: Checklist
// =====================================================================

function ChecklistTab({
  task,
  inspection,
  items,
}: {
  task: TaskWithEvents;
  inspection: InspectionWithRelations | null;
  items: InspectionItem[];
}) {
  const qc = useQueryClient();
  const actor = useCurrentActor();
  const actorCanStartTask = !!actor && canStartTask(task, actor);
  const actorCanSubmitTask = !!actor && canSubmitTask(task, actor);
  const actorCanCancelTask = !!actor && canCancelTask(task, actor);
  const [submitComment, setSubmitComment] = useState<string>('');

  const actorCtx = useMemo(
    () => ({ companyUserId: actor?.companyUserId ?? null, role: actor?.role ?? null }),
    [actor],
  );

  // Para inspection vinculada
  const editable = inspection ? canSaveAnswers(inspection, actorCtx) : false;
  const canStartIns = inspection ? canStartInspection(inspection, actorCtx) : false;
  const canFinishIns = inspection ? canComplete(inspection, actorCtx) : false;

  // Buffer de respostas
  const [buffer, setBuffer] = useState<Map<string, AnswerInput>>(() => {
    const m = new Map<string, AnswerInput>();
    inspection?.answers?.forEach((a) => m.set(a.checklistItemId, answerToInput(a)));
    return m;
  });

  const lastHydratedRef = useRef<InspectionAnswer[] | null>(null);
  useEffect(() => {
    if (!inspection) return;
    if (lastHydratedRef.current === inspection.answers) return;
    lastHydratedRef.current = inspection.answers;
    const next = new Map<string, AnswerInput>();
    inspection.answers?.forEach((a) => next.set(a.checklistItemId, answerToInput(a)));
    setBuffer(next);
  }, [inspection]);

  const handleChange = useCallback((itemId: string, next: AnswerInput | null) => {
    setBuffer((prev) => {
      const copy = new Map(prev);
      if (next === null) copy.delete(itemId);
      else copy.set(itemId, next);
      return copy;
    });
  }, []);

  const startInsMut = useMutation({
    mutationFn: () => inspectionsApi.start(inspection!.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inspection', inspection!.id] });
      Alert.alert('OK', 'Inspeção iniciada.');
    },
    onError: (e) => Alert.alert('Erro', e instanceof ApiCallError ? e.message : 'Falha ao iniciar.'),
  });

  const saveMut = useMutation({
    mutationFn: (answers: AnswerInput[]) => inspectionsApi.saveAnswers(inspection!.id, answers),
    onSuccess: (resp) => {
      void qc.invalidateQueries({ queryKey: ['inspection', inspection!.id] });
      Alert.alert('OK', `${resp.saved} resposta(s) salva(s).`);
    },
    onError: (e) => Alert.alert('Erro', e instanceof ApiCallError ? e.message : 'Falha ao salvar.'),
  });

  const completeMut = useMutation({
    mutationFn: () => inspectionsApi.complete(inspection!.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inspection', inspection!.id] });
      void qc.invalidateQueries({ queryKey: ['task', task.id] });
      Alert.alert('Concluído', 'Checklist finalizado e enviado para revisão.');
    },
    onError: (e) => Alert.alert('Erro', e instanceof ApiCallError ? e.message : 'Falha ao concluir.'),
  });

  const taskActionMut = useMutation({
    mutationFn: async (action: 'start' | 'submit' | 'cancel') => {
      if (action === 'start')  return tasksApi.start(task.id);
      if (action === 'submit') return tasksApi.submit(task.id, submitComment.trim() || undefined);
      return tasksApi.cancel(task.id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['task', task.id] });
      setSubmitComment('');
    },
    onError: (e) => Alert.alert('Erro', e instanceof ApiCallError ? e.message : 'Falha.'),
  });

  async function flushAndComplete() {
    if (!inspection) return;
    if (buffer.size > 0) {
      try {
        await inspectionsApi.saveAnswers(inspection.id, Array.from(buffer.values()));
      } catch (err) {
        const msg = err instanceof ApiCallError ? err.message : 'Falha ao salvar.';
        Alert.alert('Erro ao salvar', msg);
        return;
      }
    }
    completeMut.mutate();
  }

  if (!inspection) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.h2}>{task.title}</Text>
          {task.description ? <Text style={styles.body}>{task.description}</Text> : null}
        </Card>

        <EmptyState
          icon="ClipboardList"
          title="Esta tarefa não possui checklist"
          description="Esta tarefa é direta — não há itens para responder. Use os botões abaixo para iniciar, enviar ou cancelar."
          compact
        />

        {actorCanSubmitTask ? (
          <Card>
            <Text style={styles.label}>Comentário (opcional)</Text>
            <TextInput
              value={submitComment}
              onChangeText={setSubmitComment}
              placeholder="O que você concluiu?"
              placeholderTextColor={theme.color.textSubtle}
              style={styles.commentInput}
              multiline
            />
          </Card>
        ) : null}

        <View style={styles.footerActions}>
          {actorCanStartTask ? (
            <Button label="Iniciar tarefa" leftIcon="PlayCircle" onPress={() => taskActionMut.mutate('start')} loading={taskActionMut.isPending} full />
          ) : null}
          {actorCanSubmitTask ? (
            <Button label="Enviar para aprovação" leftIcon="Send" onPress={() => taskActionMut.mutate('submit')} loading={taskActionMut.isPending} full />
          ) : null}
          {actorCanCancelTask ? (
            <Button label="Cancelar tarefa" leftIcon="Ban" variant="danger" onPress={() => Alert.alert('Cancelar', 'Tem certeza?', [
              { text: 'Voltar', style: 'cancel' },
              { text: 'Sim, cancelar', style: 'destructive', onPress: () => taskActionMut.mutate('cancel') },
            ])} loading={taskActionMut.isPending} full />
          ) : null}
        </View>
      </ScrollView>
    );
  }

  // === Checklist com items ===
  const groups = groupItemsBySection(items);
  const pendingCount = buffer.size;
  const loading = startInsMut.isPending || saveMut.isPending || completeMut.isPending;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.checklistHeaderRow}>
          <View style={[styles.cardIconWrap, { backgroundColor: theme.color.primarySoft }]}>
            <Icon name="ClipboardCheck" size={20} color={theme.color.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{inspection.checklist.title}</Text>
            <Text style={styles.cardMeta}>
              Ver. {inspection.checklist.version} · Publicado em {new Date(inspection.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <StatusPill label="Conforme" tone="success" />
        </View>
      </Card>

      {canStartIns ? (
        <Banner
          tone="info"
          title="Pronto para começar?"
          message="Toque em Iniciar inspeção para liberar a edição dos itens."
        />
      ) : null}

      {groups.map((g, gi) => (
        <View key={gi} style={{ gap: 10 }}>
          <Text style={styles.sectionHeader}>{gi + 1}. {g.title}</Text>
          {g.items.map((item, idx) => (
            <ChecklistItemRow
              key={item.id}
              index={`${gi + 1}.${idx + 1}`}
              item={item}
              value={buffer.get(item.id) ?? null}
              onChange={(next) => handleChange(item.id, next)}
              disabled={!editable}
              inspectionId={inspection.id}
              inspectionAnswerId={inspection.answers.find((a) => a.checklistItemId === item.id)?.id ?? null}
            />
          ))}
        </View>
      ))}

      <View style={styles.footerActions}>
        {canStartIns ? (
          <Button label="Iniciar inspeção" leftIcon="PlayCircle" onPress={() => startInsMut.mutate()} loading={loading} full />
        ) : null}
        {editable ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              label={pendingCount > 0 ? `Salvar rascunho (${pendingCount})` : 'Salvar rascunho'}
              variant="secondary"
              leftIcon="Save"
              onPress={() => {
                if (buffer.size === 0) return Alert.alert('Nada a salvar', 'Você ainda não respondeu nenhum item.');
                saveMut.mutate(Array.from(buffer.values()));
              }}
              loading={saveMut.isPending}
              style={{ flex: 1 }}
            />
            {canFinishIns ? (
              <Button
                label="Finalizar checklist"
                leftIcon="CheckCircle2"
                onPress={() => Alert.alert('Finalizar', 'O checklist será enviado para revisão. Continuar?', [
                  { text: 'Voltar', style: 'cancel' },
                  { text: 'Finalizar', onPress: () => void flushAndComplete() },
                ])}
                loading={completeMut.isPending}
                style={{ flex: 1.4 }}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function answerToInput(a: InspectionAnswer): AnswerInput {
  const input: AnswerInput = { checklistItemId: a.checklistItemId, answerType: a.answerType };
  if (a.answerValue !== null) input.answerValue = a.answerValue;
  if (a.isConform !== null) input.isConform = a.isConform;
  if (a.comment !== null) input.comment = a.comment;
  return input;
}

function groupItemsBySection(items: InspectionItem[]): Array<{ title: string; items: InspectionItem[] }> {
  // Estratégia simples: 1 grupo "Itens" se não há sectionId; caso contrário,
  // agrupa por sectionId preservando ordem.
  const sections = new Map<string, InspectionItem[]>();
  for (const it of items) {
    const k = (it as unknown as { sectionId?: string | null }).sectionId ?? 'default';
    if (!sections.has(k)) sections.set(k, []);
    sections.get(k)!.push(it);
  }
  return Array.from(sections.entries()).map(([k, items], i) => ({
    title: k === 'default' ? (i === 0 ? 'Itens do checklist' : `Seção ${i + 1}`) : `Seção`,
    items,
  }));
}

function ChecklistItemRow({
  index,
  item,
  value,
  onChange,
  disabled,
  inspectionId,
  inspectionAnswerId,
}: {
  index: string;
  item: InspectionItem;
  value: AnswerInput | null;
  onChange: (n: AnswerInput | null) => void;
  disabled: boolean;
  inspectionId: string;
  inspectionAnswerId: string | null;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemIndex}>{index}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.isRequired ? (
          <StatusPill label="Obrigatório" tone="danger" />
        ) : null}
      </View>
      {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
      <View style={{ marginTop: 8 }}>
        {renderItem(item, {
          item,
          value,
          onChange,
          disabled,
          inspectionId,
          inspectionAnswerId,
        })}
      </View>
    </View>
  );
}

// =====================================================================
// Sub-tab: Anexos
// =====================================================================

function AnexosTab({ inspection }: { inspection: InspectionWithRelations | null }) {
  if (!inspection) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="Paperclip"
          title="Sem anexos"
          description="Esta tarefa não possui checklist vinculado — anexos são gerenciados em inspeções."
          compact
        />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.checklistHeaderRow}>
          <View style={[styles.cardIconWrap, { backgroundColor: theme.color.accentBg }]}>
            <Icon name="Paperclip" size={20} color={theme.color.accentFg} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cardTitle}>Anexos do checklist</Text>
            <Text style={styles.cardMeta}>Todas as evidências enviadas a esta inspeção</Text>
          </View>
        </View>
      </Card>

      <Card padded="sm">
        <EvidenceUploader
          target={{ inspectionId: inspection.id }}
          defaultType="photo"
        />
      </Card>

      <EvidenceList inspectionId={inspection.id} />
    </ScrollView>
  );
}

// =====================================================================
// Sub-tab: Histórico
// =====================================================================

function HistoricoTab({ task }: { task: TaskWithEvents }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.checklistHeaderRow}>
          <View style={[styles.cardIconWrap, { backgroundColor: theme.color.warningBg }]}>
            <Icon name="History" size={20} color={theme.color.warningFg} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cardTitle}>Histórico</Text>
            <Text style={styles.cardMeta}>Todas as atividades e alterações</Text>
          </View>
        </View>
      </Card>

      {task.events.length === 0 ? (
        <EmptyState
          icon="History"
          title="Sem eventos ainda"
          description="A timeline aparecerá conforme a tarefa for executada."
          compact
        />
      ) : (
        <TaskHistoryTimeline events={task.events} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressWrap: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    gap: 4,
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium },
  progressValue: { fontSize: theme.fontSize.sm, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  content: {
    padding: theme.spacing[4],
    paddingBottom: 120,
    gap: theme.spacing[3],
  },
  h2: { fontSize: theme.fontSize.lg, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  body: { marginTop: 6, fontSize: theme.fontSize.md, color: theme.color.textBody, lineHeight: theme.lineHeight.md },
  label: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium, marginBottom: 6 },
  commentInput: {
    borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: theme.fontSize.md,
    color: theme.color.text, minHeight: 80, textAlignVertical: 'top',
  },
  cardIconWrap: {
    width: 40, height: 40, borderRadius: theme.radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  checklistHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  cardMeta: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.regular },
  sectionHeader: {
    fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.semibold,
    color: theme.color.text, marginTop: 4,
  },
  itemRow: {
    padding: 14,
    backgroundColor: theme.color.surface,
    borderWidth: 1, borderColor: theme.color.border,
    borderRadius: theme.radius.lg,
    gap: 4,
  },
  itemHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemIndex: { fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.bold, color: theme.color.primary },
  itemTitle: { flex: 1, fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  itemDesc:  { fontSize: theme.fontSize.sm, color: theme.color.textMuted },
  footerActions: { gap: 8, marginTop: theme.spacing[3] },
});
