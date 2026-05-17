import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { ApiCallError } from '@/lib/api/client';
import { useCurrentActor } from '@/lib/auth/actor';
import { tasksApi } from '@/lib/tasks/api';
import {
  canCancelTask,
  canStartTask,
  canSubmitTask,
  formatDateTime,
  formatDueDate,
  priorityColor,
  taskStatusTone,
} from '@/lib/tasks/helpers';
import {
  TASK_EVENT_ACTION_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type TaskEvent,
  type TaskWithEvents,
} from '@/lib/tasks/types';

type ActionKind = 'start' | 'submit' | 'cancel';

export default function TarefaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const actor = useCurrentActor();
  const [submitComment, setSubmitComment] = useState<string>('');

  const taskId = id ?? '';

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
    enabled: !!taskId,
  });

  const mutation = useMutation({
    mutationFn: async (input: { kind: ActionKind; comment?: string }) => {
      if (input.kind === 'start') return tasksApi.start(taskId, input.comment);
      if (input.kind === 'submit') return tasksApi.submit(taskId, input.comment);
      return tasksApi.cancel(taskId, input.comment);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['task', taskId] });
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      setSubmitComment('');
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiCallError
          ? err.message
          : 'Não foi possível executar a ação.';
      Alert.alert('Erro', msg);
    },
  });

  function onStart() {
    mutation.mutate({ kind: 'start' });
  }

  function onSubmit() {
    mutation.mutate({
      kind: 'submit',
      comment: submitComment.trim() || undefined,
    });
  }

  function onCancel() {
    Alert.alert(
      'Cancelar tarefa',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar tarefa',
          style: 'destructive',
          onPress: () => mutation.mutate({ kind: 'cancel' }),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {data?.title ?? 'Tarefa'}
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
              : 'Não foi possível carregar a tarefa.'
          }
          onRetry={() => void refetch()}
        />
      ) : (
        <DetailBody
          task={data}
          submitComment={submitComment}
          setSubmitComment={setSubmitComment}
          actorCanStart={!!actor && canStartTask(data, actor)}
          actorCanSubmit={!!actor && canSubmitTask(data, actor)}
          actorCanCancel={!!actor && canCancelTask(data, actor)}
          loading={mutation.isPending}
          onStart={onStart}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </SafeAreaView>
  );
}

interface DetailBodyProps {
  task: TaskWithEvents;
  submitComment: string;
  setSubmitComment: (v: string) => void;
  actorCanStart: boolean;
  actorCanSubmit: boolean;
  actorCanCancel: boolean;
  loading: boolean;
  onStart: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function DetailBody({
  task,
  submitComment,
  setSubmitComment,
  actorCanStart,
  actorCanSubmit,
  actorCanCancel,
  loading,
  onStart,
  onSubmit,
  onCancel,
}: DetailBodyProps) {
  const due = formatDueDate(task.dueDate);
  const hasActions = actorCanStart || actorCanSubmit || actorCanCancel;

  return (
    <>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.section}>
          <Text style={styles.h1}>{task.title}</Text>
          <View style={styles.meta}>
            <StatusBadge
              label={TASK_STATUS_LABEL[task.status]}
              tone={taskStatusTone(task.status)}
            />
            <View style={styles.priority}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: priorityColor(task.priority) },
                ]}
              />
              <Text style={styles.metaText}>
                {TASK_PRIORITY_LABEL[task.priority]}
              </Text>
            </View>
          </View>
        </View>

        {task.description ? (
          <View style={styles.section}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.paragraph}>{task.description}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Prazo</Text>
            <Text style={[styles.value, due.overdue && styles.overdue]}>
              {due.label}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>
              {task.locationId ? task.locationId : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Responsável</Text>
          <Text style={styles.value}>
            {task.assignedToCompanyUserId ?? 'Não atribuído'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Histórico</Text>
          {task.events.length === 0 ? (
            <EmptyState title="Sem eventos ainda" />
          ) : (
            <View style={styles.timeline}>
              {task.events.map((ev) => (
                <TimelineRow key={ev.id} ev={ev} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {hasActions ? (
        <View style={styles.footer}>
          {actorCanSubmit ? (
            <View style={styles.commentWrap}>
              <Text style={styles.commentLabel}>
                Comentário (opcional)
              </Text>
              <TextInput
                value={submitComment}
                onChangeText={setSubmitComment}
                placeholder="O que você concluiu?"
                placeholderTextColor="#94a3b8"
                style={styles.commentInput}
                multiline
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            {actorCanStart ? (
              <View style={styles.actionItem}>
                <Button
                  label="Iniciar"
                  onPress={onStart}
                  loading={loading}
                />
              </View>
            ) : null}
            {actorCanSubmit ? (
              <View style={styles.actionItem}>
                <Button
                  label="Enviar para aprovação"
                  onPress={onSubmit}
                  loading={loading}
                />
              </View>
            ) : null}
            {actorCanCancel ? (
              <View style={styles.actionItem}>
                <Button
                  label="Cancelar tarefa"
                  onPress={onCancel}
                  variant="danger"
                  loading={loading}
                />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </>
  );
}

function TimelineRow({ ev }: { ev: TaskEvent }) {
  const label = TASK_EVENT_ACTION_LABEL[ev.action] ?? ev.action;
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineDot} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineAction}>{label}</Text>
        <Text style={styles.timelineMeta}>
          {ev.actor?.name ?? 'Sistema'} · {formatDateTime(ev.occurredAt)}
        </Text>
        {ev.reason ? (
          <Text style={styles.timelineReason}>“{ev.reason}”</Text>
        ) : null}
      </View>
    </View>
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
  body: { padding: 20, paddingBottom: 40, gap: 20 },
  section: { gap: 8 },
  h1: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  h2: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: { fontSize: 14, color: '#0f172a' },
  paragraph: { fontSize: 14, color: '#334155', lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: '#334155' },
  priority: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  row: { flexDirection: 'row', gap: 16 },
  col: { flex: 1, gap: 4 },
  overdue: { color: '#dc2626', fontWeight: '600' },
  timeline: { gap: 12, marginTop: 8 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    marginTop: 6,
  },
  timelineContent: { flex: 1, gap: 2 },
  timelineAction: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  timelineMeta: { fontSize: 12, color: '#64748b' },
  timelineReason: {
    marginTop: 4,
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  commentWrap: { gap: 6 },
  commentLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actions: { gap: 8 },
  actionItem: {},
});
