import { useAuthStore } from './store';
import type { CompanyUserRole } from '@/lib/api/types';
import type { Actor } from '@/lib/tasks/helpers';

/**
 * Retorna o ator atual: vínculo CompanyUser ativo (companyUserId + role).
 * Pode ser null se nenhuma empresa ativa estiver selecionada.
 */
export function useCurrentActor(): Actor | null {
  return useAuthStore((s) => {
    const link = s.companies.find((c) => c.companyId === s.activeCompanyId);
    if (!link) return null;
    return {
      companyUserId: link.companyUserId,
      role: link.role as CompanyUserRole,
    };
  });
}

export function useCurrentRole(): CompanyUserRole | null {
  return useAuthStore(
    (s) =>
      (s.companies.find((c) => c.companyId === s.activeCompanyId)
        ?.role as CompanyUserRole | undefined) ?? null,
  );
}
