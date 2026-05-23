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

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:   'Super admin',
  COMPANY_OWNER: 'Dono da empresa',
  COMPANY_ADMIN: 'Administrador',
  MANAGER:       'Gestor',
  INSPECTOR:     'Inspetor',
  WORKER:        'Operador',
  VIEWER:        'Visualizador',
};

export function roleLabel(role: CompanyUserRole | string | null | undefined): string {
  if (!role) return '—';
  return ROLE_LABEL[role] ?? String(role);
}
