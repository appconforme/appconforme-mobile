import { apiCall } from '@/lib/api/client';
import type { PaginatedData } from '@/lib/api/types';
import type { EvidenceType } from '@/lib/checklists/types';
import type {
  ConfirmUploadInput,
  Evidence,
  EvidenceWithUrl,
  RequestUploadInput,
  RequestUploadResult,
} from './types';

export interface ListEvidencesQuery {
  page?: number;
  perPage?: number;
  inspectionId?: string;
  inspectionAnswerId?: string;
  taskId?: string;
  type?: EvidenceType;
}

/**
 * Wrapper do módulo Evidences — espelha o web admin, mas roda em RN/Expo.
 * Os endpoints e o envelope são idênticos; o que muda é só o transporte do
 * binário (mobile usa `FileSystem.uploadAsync`, web usa fetch+Blob).
 */
export const evidencesApi = {
  list: (query: ListEvidencesQuery) =>
    apiCall<PaginatedData<Evidence>>('evidences', {
      query: query as Record<string, unknown>,
    }),

  getById: (id: string) => apiCall<EvidenceWithUrl>(`evidences/${id}`),

  requestUpload: (input: RequestUploadInput) =>
    apiCall<RequestUploadResult>('evidences/upload-url', {
      method: 'POST',
      body: input,
    }),

  confirm: (input: ConfirmUploadInput, idempotencyKey?: string) =>
    apiCall<Evidence>('evidences/confirm', {
      method: 'POST',
      body: input,
      headers: idempotencyKey
        ? { 'Idempotency-Key': idempotencyKey }
        : undefined,
    }),

  remove: (id: string) =>
    apiCall<{ id: string; deletedAt: string }>(`evidences/${id}`, {
      method: 'DELETE',
    }),
};
