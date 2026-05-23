/**
 * Persistência local de rascunhos de Ocorrência (SecureStore).
 * Permite o inspector salvar e voltar depois — UX padrão "Salvar rascunho"
 * do mockup `Nova Ocorrência - *`.
 *
 * Chave: `occ_draft_<id>`. Lista: `occ_drafts_index` (array de IDs).
 */
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import type { OccurrenceDraft } from './types';

const INDEX_KEY = 'occ_drafts_index';
const PREFIX = 'occ_draft_';

async function readIndex(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(INDEX_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

async function writeIndex(ids: string[]): Promise<void> {
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids));
}

export function newDraft(): OccurrenceDraft {
  const now = new Date().toISOString();
  return {
    id: Crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    title: '',
    occurredAt: now,
    locationId: null,
    type: null,
    severity: null,
    description: '',
    involvedPeople: [],
    tags: [],
    evidences: [],
    rootCause: '',
    contributingCauses: [],
    impacts: [],
    immediateActions: '',
    riskLevel: null,
    responsibleId: null,
  };
}

export const occurrenceDrafts = {
  async list(): Promise<OccurrenceDraft[]> {
    const ids = await readIndex();
    const items = await Promise.all(ids.map((id) => SecureStore.getItemAsync(PREFIX + id)));
    return items
      .map((s) => { try { return s ? JSON.parse(s) as OccurrenceDraft : null; } catch { return null; } })
      .filter((d): d is OccurrenceDraft => !!d);
  },
  async get(id: string): Promise<OccurrenceDraft | null> {
    const raw = await SecureStore.getItemAsync(PREFIX + id);
    if (!raw) return null;
    try { return JSON.parse(raw) as OccurrenceDraft; } catch { return null; }
  },
  async save(draft: OccurrenceDraft): Promise<OccurrenceDraft> {
    const updated: OccurrenceDraft = { ...draft, updatedAt: new Date().toISOString() };
    await SecureStore.setItemAsync(PREFIX + draft.id, JSON.stringify(updated));
    const ids = await readIndex();
    if (!ids.includes(draft.id)) await writeIndex([...ids, draft.id]);
    return updated;
  },
  async remove(id: string): Promise<void> {
    await SecureStore.deleteItemAsync(PREFIX + id);
    const ids = await readIndex();
    await writeIndex(ids.filter((x) => x !== id));
  },
};
