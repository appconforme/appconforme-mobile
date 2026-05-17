/**
 * Tipos do módulo Evidences — espelho do
 * `appconforme-web-admin/src/lib/evidences/types.ts`. Mantém o mesmo contrato
 * do backend (`/v1/evidences/*`) pra que o mobile e o web falem a mesma
 * linguagem de upload presigned + confirm.
 */
import type { EvidenceType } from '@/lib/checklists/types';

export interface Evidence {
  id: string;
  companyId: string;
  type: EvidenceType;
  taskId: string | null;
  inspectionId: string | null;
  inspectionAnswerId: string | null;
  fileKey: string;
  fileUrl: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  contentHash: string | null;
  description: string | null;
  metadataJson: Record<string, unknown> | null;
  uploadedByCompanyUserId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EvidenceWithUrl extends Evidence {
  downloadUrl: string | null;
}

export interface EvidenceTarget {
  taskId?: string;
  inspectionId?: string;
  inspectionAnswerId?: string;
}

export interface RequestUploadInput {
  type: EvidenceType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  target: EvidenceTarget;
}

export interface RequestUploadResult {
  fileKey: string;
  uploadUrl: string;
  /** Headers que o storage exige no PUT. */
  headers?: Record<string, string>;
  /** Se true, storage local (não precisa fazer PUT real). */
  localMode?: boolean;
}

export interface ConfirmUploadInput {
  type: EvidenceType;
  fileKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  contentHash?: string;
  description?: string;
  target: EvidenceTarget;
}
