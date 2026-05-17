import type { CompanyUserRole } from '@/lib/api/types';
import { isManagerRole } from '@/lib/permissions/roles';
import type { Task, TaskPriority, TaskStatus } from './types';

export type Tone = 'conform' | 'pending' | 'neutral' | 'non-conform' | 'primary';

/** Cores RN por tone — coerentes com a paleta do login. */
export const TONE_COLORS: Record<Tone, { bg: string; fg: string }> = {
  conform: { bg: '#dcfce7', fg: '#15803d' }, // verde
  pending: { bg: '#fef3c7', fg: '#b45309' }, // âmbar
  neutral: { bg: '#f1f5f9', fg: '#475569' }, // cinza
  'non-conform': { bg: '#fee2e2', fg: '#991b1b' }, // vermelho
  primary: { bg: '#dbeafe', fg: '#1d4ed8' }, // azul
};

/** Mapeia status de tarefa pro tone do StatusBadge. */
export function taskStatusTone(status: TaskStatus): Tone {
  switch (status) {
    case 'approved':
      return 'conform';
    case 'in_progress':
      return 'primary';
    case 'waiting_approval':
    case 'assigned':
      return 'pending';
    case 'rejected':
      return 'non-conform';
    case 'open':
    case 'cancelled':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/** Cor sólida da prioridade (dot). */
export function priorityColor(p: TaskPriority): string {
  switch (p) {
    case 'urgent':
      return '#dc2626';
    case 'high':
      return '#f59e0b';
    case 'medium':
      return '#2563eb';
    case 'low':
    default:
      return '#64748b';
  }
}

/**
 * Formata dueDate pra um label curto relativo + indicador de atraso.
 */
export function formatDueDate(iso: string | null): {
  label: string;
  overdue: boolean;
} {
  if (!iso) return { label: 'sem prazo', overdue: false };
  const due = new Date(iso);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const overdue = diffMs < 0;

  const fmt = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(due);

  if (overdue) {
    const abs = Math.abs(diffDays);
    return {
      label: `${fmt} · ${abs === 0 ? 'hoje (vencida)' : `${abs}d atrasada`}`,
      overdue: true,
    };
  }
  if (diffDays === 0) return { label: `${fmt} · hoje`, overdue: false };
  if (diffDays === 1) return { label: `${fmt} · amanhã`, overdue: false };
  if (diffDays < 7) return { label: `${fmt} · em ${diffDays}d`, overdue: false };
  return { label: fmt, overdue: false };
}

/** Formata data/hora absoluta curta (timeline). */
export function formatDateTime(iso: string): string {
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

/** Ator atual — quem clica em "iniciar/enviar/cancelar" no mobile. */
export interface Actor {
  companyUserId: string;
  role: CompanyUserRole | null;
}

function isAssigneeOrManager(task: Task, actor: Actor): boolean {
  if (isManagerRole(actor.role)) return true;
  return (
    !!task.assignedToCompanyUserId &&
    task.assignedToCompanyUserId === actor.companyUserId
  );
}

/** Pode iniciar: status em {open, assigned, rejected} e (assignee ou manager). */
export function canStartTask(task: Task, actor: Actor): boolean {
  if (!['open', 'assigned', 'rejected'].includes(task.status)) return false;
  return isAssigneeOrManager(task, actor);
}

/** Pode enviar pra aprovação: status === in_progress e (assignee ou manager). */
export function canSubmitTask(task: Task, actor: Actor): boolean {
  if (task.status !== 'in_progress') return false;
  return isAssigneeOrManager(task, actor);
}

/** Pode cancelar: manager e status não terminal. */
export function canCancelTask(task: Task, actor: Actor): boolean {
  if (!isManagerRole(actor.role)) return false;
  return !['approved', 'cancelled'].includes(task.status);
}

export { isManagerRole };
