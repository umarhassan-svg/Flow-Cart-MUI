/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/users.service.ts
import api from "./api/axios";
import type { User } from "./auth.service";

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

/**
 * Helper to extract server error message (if present)
 */
function extractErrorMessage(err: unknown, fallback = "Request failed") {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    fallback
  );
}

/**
 * Users API
 */
const usersService = {
  async getUsers(opts?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    try {
      const params = {
        page: opts?.page ?? 1,
        limit: opts?.limit ?? 10,
        search: opts?.search ?? ""
      };
      const resp = await api.get<PaginatedResponse<User>>("/api/users", { params });
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to fetch users"));
    }
  },

  async getUser(id: string): Promise<User> {
    try {
      // Preferred: try single-user endpoint (add to backend if missing)
      const resp = await api.get<{ user?: User; id?: string }>(`/api/users/${id}`);
      // If backend returns { user: ... } or the user directly, handle both.
      // Many simple APIs return the user object directly in resp.data
      const data = resp.data;
      if (data && typeof data === "object") {
        if (data.user) return data.user as User;
        // If server returned plain user object:
        if (data.id) return data as User;
      }
      // fall back to treating resp.data as the user
      return data as User;
    } catch (err: unknown) {
      // If single-user route doesn't exist, fall back to search in list (best-effort)
      try {
        const list = await this.getUsers({ page: 1, limit: 1000, search: "" });
        const found = list.data.find((u) => u.id === id);
        if (found) return found;
      } catch (e) {
        // ignore fallback errors
        console.error(e);
      }
      throw new Error(extractErrorMessage(err, "Failed to fetch user"));
    }
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    try {
      const resp = await api.post<User>("/api/users", payload);
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to create user"));
    }
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    try {
      const resp = await api.put<User>(`/api/users/${id}`, payload);
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to update user"));
    }
  },

  async deleteUser(id: string): Promise<User> {
    try {
      const resp = await api.delete<{ deleted: User }>(`/api/users/${id}`);
      return resp.data.deleted;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to delete user"));
    }
  },

  async getRoles(): Promise<Role[]> {
    try {
      const resp = await api.get<Role[]>("/api/roles");
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to fetch roles"));
    }
  },

  async createRole(payload: { name: string; pages?: string[]; permissions?: string[] }): Promise<Role> {
    try {
      const resp = await api.post<Role>("/api/roles", payload);
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to create role"));
    }
  },

  async updateRole(id: string, payload: { name?: string; pages?: string[]; permissions?: string[] }): Promise<Role> {
    try {
      const resp = await api.put<Role>(`/api/roles/${id}`, payload);
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to update role"));
    }
  },

  async deleteRole(id: string): Promise<Role> {
    try {
      const resp = await api.delete<{ deleted: Role }>(`/api/roles/${id}`);
      return resp.data.deleted;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to delete role"));
    }
  }
};

export default usersService;
