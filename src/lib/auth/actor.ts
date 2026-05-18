import { useMemo } from 'react';
import { useAuthStore } from './store';
import type { CompanyUserRole } from '@/lib/api/types';
import type { Actor } from '@/lib/tasks/helpers';

/**
 * Retorna o ator atual: vínculo CompanyUser ativo (companyUserId + role).
 *
 * Seletores Zustand precisam retornar referência estável; retornar
 * `{ companyUserId, role }` direto cria objeto novo a cada chamada e
 * o store reporta "mudou" → loop infinito ("Maximum update depth").
 * Por isso: dois seletores primitivos + useMemo para compor.
 */
export function useCurrentActor(): Actor | null {
  const companyUserId = useAuthStore((s) => {
    const link = s.companies.find((c) => c.companyId === s.activeCompanyId);
    return link?.companyUserId ?? null;
  });
  const role = useAuthStore((s) => {
    const link = s.companies.find((c) => c.companyId === s.activeCompanyId);
    return (link?.role as CompanyUserRole | undefined) ?? null;
  });
  return useMemo(
    () => (companyUserId && role ? { companyUserId, role } : null),
    [companyUserId, role],
  );
}

export function useCurrentRole(): CompanyUserRole | null {
  return useAuthStore(
    (s) =>
      (s.companies.find((c) => c.companyId === s.activeCompanyId)
        ?.role as CompanyUserRole | undefined) ?? null,
  );
}
