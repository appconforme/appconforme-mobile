/**
 * Tipos de domínio do módulo Inspeções — espelho do
 * `appconforme-web-admin/src/lib/inspections/types.ts`.
 */
import type { ChecklistItemType, EvidenceType } from '@/lib/checklists/types';

export type InspectionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface LocationSnapshot {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
}

export interface AssignedToSnapshot {
  id: string;
  fullName: string;
  role: string;
}

export interface Inspection {
  id: string;
  companyId: string;
  checklistId: string;
  checklistVersionId: string;
  locationId: string | null;
  assignedToCompanyUserId: string | null;
  startedByCompanyUserId: string | null;
  reviewedByCompanyUserId: string | null;
  title: string;
  description: string | null;
  status: InspectionStatus;
  locationSnapshot: LocationSnapshot | null;
  assignedToSnapshot: AssignedToSnapshot | null;
  startedAt: string | null;
  completedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Item da inspeção como devolvido por GET /:id — vem do snapshot da versão
 * congelada. Não filtra deletedAt (snapshot é imutável).
 */
export interface InspectionItem {
  id: string;
  title: string;
  description: string | null;
  type: ChecklistItemType;
  isRequired: boolean;
  requiresEvidence: boolean;
  evidenceType: EvidenceType | null;
  order: number;
  optionsJson: { options?: Array<{ label: string; value?: string }> } | null;
}

export interface InspectionAnswer {
  id: string;
  companyId: string;
  inspectionId: string;
  checklistItemId: string;
  answerType: ChecklistItemType;
  answerValue: Record<string, unknown> | null;
  isConform: boolean | null;
  comment: string | null;
  answeredByCompanyUserId: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface InspectionWithRelations extends Inspection {
  answers: InspectionAnswer[];
  checklist: {
    id: string;
    title: string;
    version: number;
    items: InspectionItem[];
  };
}

export const INSPECTION_STATUS_LABEL: Record<InspectionStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  approved: 'Aprovada',
  rejected: 'Reprovada',
  cancelled: 'Cancelada',
};

export const TERMINAL_INSPECTION_STATUSES: ReadonlySet<InspectionStatus> =
  new Set(['approved', 'cancelled']);
