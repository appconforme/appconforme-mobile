import type { CompanyUserRole } from '@/lib/api/types';

export const MANAGER_ROLES: ReadonlySet<CompanyUserRole> = new Set([
  'SUPER_ADMIN',
  'COMPANY_OWNER',
  'COMPANY_ADMIN',
  'MANAGER',
]);

export function isManagerRole(
  role: CompanyUserRole | string | null | undefined,
): boolean {
  return !!role && MANAGER_ROLES.has(role as CompanyUserRole);
}
