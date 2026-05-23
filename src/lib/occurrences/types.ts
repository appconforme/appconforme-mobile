/**
 * Domínio "Ocorrência" — feature nova do mobile. Hoje é mock-layer; quando
 * o backend implementar `POST /occurrences`, manter este shape no payload.
 *
 * Conceitualmente parente de "non-conformity": uma ocorrência levantada
 * pelo inspector com evidências, análise de causa-raiz e ações imediatas.
 */

export type OccurrenceSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface OccurrenceEvidenceRef {
  id: string;
  kind: 'photo' | 'video' | 'audio' | 'document';
  uri: string;        // local file:// até envio real
  filename: string;
  sizeBytes?: number;
  durationSec?: number;
  takenAt: string;
}

export interface OccurrencePayloadStep1 {
  title: string;
  occurredAt: string;
  locationId: string | null;
  locationName?: string;
  type: string | null;
  typeLabel?: string;
  severity: OccurrenceSeverity | null;
  description: string;
  involvedPeople: ReadonlyArray<{ id: string; name: string }>;
  tags: ReadonlyArray<string>;
}

export interface OccurrencePayloadStep2 {
  evidences: ReadonlyArray<OccurrenceEvidenceRef>;
}

export interface OccurrencePayloadStep3 {
  rootCause: string;
  contributingCauses: ReadonlyArray<string>;
  impacts: ReadonlyArray<string>;
  immediateActions: string;
  riskLevel: OccurrenceSeverity | null;
  responsibleId: string | null;
  responsibleName?: string;
}

export interface OccurrenceDraft
  extends OccurrencePayloadStep1, OccurrencePayloadStep2, OccurrencePayloadStep3 {
  id: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export const SEVERITY_LABEL: Record<OccurrenceSeverity, string> = {
  low:      'Baixa',
  medium:   'Média',
  high:     'Alta',
  critical: 'Crítica',
};

export const SEVERITY_TONE: Record<OccurrenceSeverity, 'success' | 'warning' | 'danger' | 'neutral'> = {
  low:      'success',
  medium:   'warning',
  high:     'danger',
  critical: 'danger',
};

export const OCCURRENCE_TYPES: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'leak',      label: 'Vazamento' },
  { id: 'equipment', label: 'Falha de equipamento' },
  { id: 'safety',    label: 'Segurança' },
  { id: 'hygiene',   label: 'Higiene' },
  { id: 'fall',      label: 'Queda de material' },
  { id: 'other',     label: 'Outro' },
];

export const COMMON_CONTRIBUTING_CAUSES: ReadonlyArray<string> = [
  'Manutenção preventiva inadequada',
  'Desgaste natural do equipamento',
  'Procedimento não seguido',
  'Treinamento inadequado',
];

export const COMMON_IMPACTS: ReadonlyArray<string> = [
  'Parada não planejada',
  'Perda de produção',
  'Risco à segurança',
  'Impacto ambiental',
];
