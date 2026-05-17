import type { CompanyUserRole } from '@/lib/api/types';
import { isManagerRole } from '@/lib/permissions/roles';
import type { Tone } from '@/lib/permissions/tone';
import type { Inspection, InspectionStatus } from './types';

export function inspectionStatusTone(status: InspectionStatus): Tone {
  switch (status) {
    case 'approved':
      return 'conform';
    case 'in_progress':
      return 'primary';
    case 'completed':
    case 'pending':
      return 'pending';
    case 'rejected':
      return 'non-conform';
    case 'cancelled':
      return 'neutral';
  }
}

export interface ActorContext {
  companyUserId: string | null;
  role: CompanyUserRole | null | undefined;
}

/** Assignee corrente ou manager. */
export function canAct(
  insp: Pick<Inspection, 'assignedToCompanyUserId'>,
  actor: ActorContext,
): boolean {
  if (isManagerRole(actor.role)) return true;
  return (
    !!actor.companyUserId &&
    insp.assignedToCompanyUserId === actor.companyUserId
  );
}

export function canStartInspection(
  insp: Pick<Inspection, 'status' | 'assignedToCompanyUserId'>,
  actor: ActorContext,
): boolean {
  if (insp.status !== 'pending' && insp.status !== 'rejected') return false;
  return canAct(insp, actor);
}

export function canSaveAnswers(
  insp: Pick<Inspection, 'status' | 'assignedToCompanyUserId'>,
  actor: ActorContext,
): boolean {
  return insp.status === 'in_progress' && canAct(insp, actor);
}

export function canComplete(
  insp: Pick<Inspection, 'status' | 'assignedToCompanyUserId'>,
  actor: ActorContext,
): boolean {
  return insp.status === 'in_progress' && canAct(insp, actor);
}

export function isTerminal(status: InspectionStatus): boolean {
  return status === 'approved' || status === 'cancelled';
}
