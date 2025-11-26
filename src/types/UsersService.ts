/**
 * Generic paginated response from backend
 */
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  data: T[];
}

/**
 * Payloads
 */
export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string; // server-side default exists
  roles?: string[];
  permissions?: string[]; // optional direct user permissions
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Role type
 */
export interface Role {
  id: string;
  name: string;
  pages: string[];
  permissions?: string[]; // backend supports role permissions
}
