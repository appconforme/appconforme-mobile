/**
 * Tipos de domínio do módulo Tarefas. Espelham o schema Prisma da API
 * e o tipo equivalente em `appconforme-web-admin/src/lib/tasks/types.ts`.
 */

export type TaskStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'waiting_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  companyId: string;
  locationId: string | null;
  inspectionId: string | null;
  createdByCompanyUserId: string | null;
  assignedToCompanyUserId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Evento reconstruído a partir do audit log da tarefa.
 * Responde "quem (actor), fez o quê (action), quando (occurredAt) e por quê (reason)".
 */
export interface TaskEvent {
  id: string;
  /** ex.: 'task.created', 'task.started', 'task.submitted', 'task.approved', 'task.rejected', 'task.cancelled'. */
  action: string;
  occurredAt: string;
  actor: { companyUserId: string; userId: string; name: string } | null;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus | null;
  reason: string | null;
}

/** Task detalhada — inclui linha do tempo de eventos. */
export interface TaskWithEvents extends Task {
  events: TaskEvent[];
}

// --- Labels pt-BR ---

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Aberta',
  assigned: 'Atribuída',
  in_progress: 'Em andamento',
  waiting_approval: 'Aguardando aprovação',
  approved: 'Aprovada',
  rejected: 'Reprovada',
  cancelled: 'Cancelada',
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

/** Estados finais — sem ações de transição disponíveis. */
export const TERMINAL_STATUSES: Set<TaskStatus> = new Set([
  'approved',
  'cancelled',
]);

/** Labels pt-BR pros eventos da timeline. */
export const TASK_EVENT_ACTION_LABEL: Record<string, string> = {
  'task.created': 'Criada',
  'task.assigned': 'Atribuída',
  'task.updated': 'Atualizada',
  'task.started': 'Iniciada',
  'task.submitted': 'Enviada para aprovação',
  'task.approved': 'Aprovada',
  'task.rejected': 'Reprovada',
  'task.cancelled': 'Cancelada',
  'task.deleted': 'Excluída',
};
