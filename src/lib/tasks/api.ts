import * as Crypto from 'expo-crypto';
import { apiCall } from '@/lib/api/client';
import type { PaginatedData } from '@/lib/api/types';
import type { Task, TaskPriority, TaskStatus, TaskWithEvents } from './types';

export interface ListTasksQuery {
  page?: number;
  perPage?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  locationId?: string;
  /** UUID do company_user OU "me" pra filtrar pelas próprias. */
  assignedTo?: string;
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

function idemHeaders(): Record<string, string> {
  return { 'Idempotency-Key': Crypto.randomUUID() };
}

/**
 * Wrapper de tarefas — espelha o web admin, mas restrito ao escopo do
 * mobile MVP: listar, ver detalhe, iniciar, enviar e cancelar.
 * Approve/reject/create/update ficam no painel web.
 */
export const tasksApi = {
  list: (query: ListTasksQuery) =>
    apiCall<PaginatedData<Task>>('tasks', {
      query: query as Record<string, unknown>,
    }),

  getById: (id: string) => apiCall<TaskWithEvents>(`tasks/${id}`),

  start: (id: string, comment?: string) =>
    apiCall<Task>(`tasks/${id}/start`, {
      method: 'POST',
      body: comment ? { comment } : {},
      headers: idemHeaders(),
    }),

  submit: (id: string, comment?: string) =>
    apiCall<Task>(`tasks/${id}/submit`, {
      method: 'POST',
      body: comment ? { comment } : {},
      headers: idemHeaders(),
    }),

  cancel: (id: string, comment?: string) =>
    apiCall<Task>(`tasks/${id}/cancel`, {
      method: 'POST',
      body: comment ? { comment } : {},
      headers: idemHeaders(),
    }),
};
