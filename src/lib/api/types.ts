export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type CompanyUserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_OWNER'
  | 'COMPANY_ADMIN'
  | 'MANAGER'
  | 'INSPECTOR'
  | 'WORKER'
  | 'CLIENT_VIEWER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface AuthCompany {
  /** UUID do vínculo CompanyUser (não do usuário nem da empresa). */
  companyUserId: string;
  companyId: string;
  companyName: string;
  role: CompanyUserRole;
  status: string;
}
