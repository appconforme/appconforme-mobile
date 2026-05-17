import * as Crypto from 'expo-crypto';
import { apiCall } from '@/lib/api/client';
import type { PaginatedData } from '@/lib/api/types';
import type { ChecklistItemType } from '@/lib/checklists/types';
import type {
  Inspection,
  InspectionStatus,
  InspectionWithRelations,
} from './types';

export interface ListInspectionsQuery {
  page?: number;
  perPage?: number;
  search?: string;
  status?: InspectionStatus;
  /** UUID do company_user OU "me". */
  assignedTo?: string;
  checklistId?: string;
  locationId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SaveAnswerInput {
  checklistItemId: string;
  answerType: ChecklistItemType;
  answerValue?: Record<string, unknown>;
  isConform?: boolean;
  comment?: string;
}

/** Alias usado pelos renderers (mesmo shape de SaveAnswerInput). */
export type AnswerInput = SaveAnswerInput;

function idemHeaders(): Record<string, string> {
  return { 'Idempotency-Key': Crypto.randomUUID() };
}

/**
 * Wrapper de inspeções — espelha o web admin, mas restrito ao escopo do
 * mobile MVP: listar, ver detalhe, iniciar, salvar respostas e concluir.
 * Approve/reject/cancel ficam no painel web.
 */
export const inspectionsApi = {
  list: (query: ListInspectionsQuery) =>
    apiCall<PaginatedData<Inspection>>('inspections', {
      query: query as Record<string, unknown>,
    }),

  getById: (id: string) =>
    apiCall<InspectionWithRelations>(`inspections/${id}`),

  start: (id: string, comment?: string) =>
    apiCall<Inspection>(`inspections/${id}/start`, {
      method: 'POST',
      body: comment ? { comment } : {},
      headers: idemHeaders(),
    }),

  saveAnswers: (id: string, answers: SaveAnswerInput[]) =>
    apiCall<{ saved: number }>(`inspections/${id}/answers`, {
      method: 'POST',
      body: { answers },
      headers: idemHeaders(),
    }),

  complete: (id: string, comment?: string) =>
    apiCall<Inspection>(`inspections/${id}/complete`, {
      method: 'POST',
      body: comment ? { comment } : {},
      headers: idemHeaders(),
    }),
};
