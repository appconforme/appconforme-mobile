/**
 * Card grande de tarefa — usado em "Minhas tarefas" e "Todas tarefas".
 * Inclui ícone com tone do status, título, área, badges de prioridade e status,
 * prazo com indicador de atraso.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { StatusPill, type PillTone } from '@/components/ui/status-pill';
import type { Task, TaskPriority, TaskStatus } from '@/lib/tasks/types';
import { formatDueDate } from '@/lib/tasks/helpers';

interface Props {
  task: Task;
  onPress: () => void;
}

function statusLabel(s: TaskStatus): string {
  return ({
    open: 'Pendente',
    assigned: 'Pendente',
    in_progress: 'Em andamento',
    waiting_approval: 'Aguardando',
    approved: 'Concluída',
    rejected: 'Reaberta',
    cancelled: 'Cancelada',
  } as const)[s];
}

function statusTone(s: TaskStatus): PillTone {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'danger';
  if (s === 'in_progress') return 'info';
  if (s === 'waiting_approval') return 'orange';
  if (s === 'cancelled') return 'neutral';
  return 'warning';
}

function statusIcon(s: TaskStatus): { name: IconName; bg: string; fg: string } {
  if (s === 'approved') return { name: 'CheckCircle2', bg: theme.color.successBg, fg: theme.color.successFg };
  if (s === 'rejected') return { name: 'AlertCircle',  bg: theme.color.dangerBg,  fg: theme.color.dangerFg };
  if (s === 'cancelled') return { name: 'XCircle',     bg: theme.color.neutralBg, fg: theme.color.neutralFg };
  if (s === 'in_progress') return { name: 'PlayCircle', bg: theme.color.primarySoft, fg: theme.color.primary };
  if (s === 'waiting_approval') return { name: 'Hourglass', bg: theme.color.orangeBg, fg: theme.color.orangeFg };
  // open / assigned: pendente
  return { name: 'ClipboardList', bg: theme.color.warningBg, fg: theme.color.warningFg };
}

function priorityLabel(p: TaskPriority): string {
  return ({ low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Crítica' } as const)[p];
}

function priorityTone(p: TaskPriority): PillTone {
  if (p === 'urgent') return 'danger';
  if (p === 'high')   return 'orange';
  if (p === 'medium') return 'warning';
  return 'success';
}

export function TaskCardFull({ task, onPress }: Props) {
  const ico = statusIcon(task.status);
  const due = formatDueDate(task.dueDate);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: theme.color.bgSubtle }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: ico.bg }]}>
        <Icon name={ico.name} size={20} color={ico.fg} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
        {task.locationId ? (
          <Text style={styles.area} numberOfLines={1}>
            Área: {task.locationId}
          </Text>
        ) : null}
        <Text
          style={[styles.due, due.overdue && { color: theme.color.dangerFg }]}
          numberOfLines={1}
        >
          {due.overdue ? 'Atrasada ' : 'Prazo: '}{due.label}
        </Text>
      </View>
      <View style={styles.right}>
        <StatusPill label={statusLabel(task.status)} tone={statusTone(task.status)} />
        <StatusPill label={priorityLabel(task.priority)} tone={priorityTone(task.priority)} />
        <Icon name="ChevronRight" size={18} color={theme.color.textSubtle} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontSize: theme.fontSize.md,
    color: theme.color.text,
    fontFamily: theme.fontFamily.semibold,
    lineHeight: theme.lineHeight.md,
  },
  area: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.regular,
    marginTop: 1,
  },
  due: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.medium,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end', gap: 4, justifyContent: 'space-between', minHeight: 60 },
});
