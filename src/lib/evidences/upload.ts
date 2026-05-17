import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import type { EvidenceType } from '@/lib/checklists/types';
import { evidencesApi } from './api';
import { sha256Hex } from './hash';
import type { Evidence, EvidenceTarget } from './types';

export type UploadStep = 'hashing' | 'uploading' | 'confirming';

export interface UploadInput {
  /** URI local do asset (ex.: `file:///...`). */
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  type: EvidenceType;
  target: EvidenceTarget;
  description?: string;
  onProgress?: (step: UploadStep) => void;
}

function isLocalUpload(url: string, localMode: boolean | undefined): boolean {
  if (localMode) return true;
  return url.startsWith('local:');
}

/**
 * Pipeline de upload de evidência (mobile):
 *   1. hash do arquivo (SHA-256 da base64 — ver `hash.ts` pra dívida)
 *   2. POST /evidences/upload-url → presigned + headers
 *   3. PUT do blob direto no storage (skip em local mode)
 *   4. POST /evidences/confirm com Idempotency-Key
 *
 * Espelha o web (`appconforme-web-admin/src/lib/evidences/upload.ts`), com
 * o transporte adaptado pra RN/Expo via `FileSystem.uploadAsync`.
 */
export async function uploadEvidence(input: UploadInput): Promise<Evidence> {
  const {
    uri,
    fileName,
    mimeType,
    fileSize,
    type,
    target,
    description,
    onProgress,
  } = input;

  onProgress?.('hashing');
  const contentHash = await sha256Hex(uri);

  const { fileKey, uploadUrl, headers, localMode } =
    await evidencesApi.requestUpload({
      type,
      fileName,
      mimeType,
      fileSize,
      target,
    });

  if (!isLocalUpload(uploadUrl, localMode)) {
    onProgress?.('uploading');
    const res = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: headers ?? {},
    });
    if (res.status >= 300) {
      throw new Error(
        `Falha no upload (status ${res.status}). Tente novamente.`,
      );
    }
  }

  onProgress?.('confirming');
  const idempotencyKey = Crypto.randomUUID();
  const confirmInput = {
    type,
    fileKey,
    fileName,
    mimeType,
    fileSize,
    contentHash,
    target,
    ...(description ? { description } : {}),
  };
  return evidencesApi.confirm(confirmInput, idempotencyKey);
}
