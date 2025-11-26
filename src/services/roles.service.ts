// src/services/roles.service.ts
import api from "./api/axios";
import type { Role } from "../types/Roles";
import { handleApiCall, handleGetWithFallback } from "../utils/ServicesHelpers/RolesHelpers";

const rolesService = {
  getRoles(): Promise<Role[]> {
    return handleApiCall<Role[]>(
      async () => (await api.get<Role[]>("/api/roles")).data,
      "Failed to fetch roles"
    );
  },

  getRole(id: string): Promise<Role> {
    // Uses the specialized fallback helper
    return handleGetWithFallback<Role>(
      () => api.get<Role>(`/api/roles/${id}`), // Target Call
      () => api.get<Role[]>("/api/roles"),     // Fallback Call
      id,
      "Failed to fetch role"
    );
  },

  createRole(payload: { name: string; pages?: string[]; permissions?: string[] }): Promise<Role> {
    return handleApiCall<Role>(
      async () => (await api.post<Role>("/api/roles", payload)).data,
      "Failed to create role"
    );
  },

  updateRole(id: string, payload: { name?: string; pages?: string[]; permissions?: string[] }): Promise<Role> {
    return handleApiCall<Role>(
      async () => (await api.put<Role>(`/api/roles/${id}`, payload)).data,
      "Failed to update role"
    );
  },

  deleteRole(id: string): Promise<Role> {
    // We handle the specific response structure { deleted: Role } here
    return handleApiCall<Role>(
      async () => {
        const resp = await api.delete<{ deleted: Role }>(`/api/roles/${id}`);
        return resp.data.deleted;
      },
      "Failed to delete role"
    );
  },

  getPermissions(): Promise<string[]> {
    return handleApiCall<string[]>(
      async () => (await api.get<string[]>("/api/permissions")).data,
      "Failed to fetch permissions"
    );
  },
};

export default rolesService;