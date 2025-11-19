// src/services/roles.service.ts
import api from "./api/axios";

export interface Role {
  id: string;
  name: string;
  pages: string[];
  permissions?: string[];
}

/**
 * Helper to extract server error message (if present)
 */
function extractErrorMessage(err: unknown, fallback = "Request failed") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  return anyErr?.response?.data?.error || anyErr?.message || fallback;
}

const rolesService = {
  async getRoles(): Promise<Role[]> {
    try {
      const resp = await api.get<Role[]>("/api/roles");
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to fetch roles"));
    }
  },

  async getRole(id: string): Promise<Role> {
    try {
      // Try single-role endpoint first
      const resp = await api.get<Role>(`/api/roles/${id}`);
      return resp.data as Role;
    } catch (err: unknown) {
      // Fallback: fetch all roles and find by id
      try {
        const list = await this.getRoles();
        const found = list.find((r) => r.id === id);
        if (found) return found;
      } catch {
        // ignore
      }
      throw new Error(extractErrorMessage(err, "Failed to fetch role"));
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
  },

  async getPermissions(): Promise<string[]> {
    try {
      const resp = await api.get<string[]>("/api/permissions");
      return resp.data;
    } catch (err: unknown) {
      throw new Error(extractErrorMessage(err, "Failed to fetch permissions"));
    }
  },
};

export default rolesService;
