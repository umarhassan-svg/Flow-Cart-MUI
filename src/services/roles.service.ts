// src/services/roles.service.ts
import api from "./api/axios";

export type Role = {
  id: string;
  name: string;
  pages: string[];
};

export type CreateRolePayload = {
  name: string;
  pages?: string[];
};

export type UpdateRolePayload = {
  name?: string;
  pages?: string[];
};

const rolesService = {
  async getRoles(): Promise<Role[]> {
    try {
      const resp = await api.get<Role[]>("/api/roles");
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err?.message || "Failed to load roles";
        throw new Error(msg);
      }
      throw new Error("Failed to load roles");
    }
  },

  async getRoleByName(name: string): Promise<Role | undefined> {
    if (!name) return undefined;
    try {
      const roles = await this.getRoles();
      return roles.find((r) => r.name === name);
    } catch (err: unknown) {
      // bubble up as undefined (caller can decide) or rethrow if preferred
      if (err instanceof Error) console.error("getRoleByName error", err);
      return undefined;
    }
  },

  /**
   * Return deduplicated list of pages for the provided role name or names.
   * Input can be a string or an array of strings. Returns [] if no roles or none found.
   */
  async getPagesForRoles(roleNames: string | string[]): Promise<string[]> {
    try {
      const names = Array.isArray(roleNames)
        ? roleNames.map((n) => String(n).trim()).filter(Boolean)
        : [String(roleNames).trim()];

      if (names.length === 0) return [];

      const roles = await this.getRoles();
      const pagesSet = new Set<string>();

      names.forEach((rName) => {
        const found = roles.find((r) => r.name === rName);
        if (found && Array.isArray(found.pages)) {
          found.pages.forEach((p) => {
            if (p && typeof p === "string") pagesSet.add(p);
          });
        }
      });

      return Array.from(pagesSet);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err?.message || "Failed to resolve pages for roles";
        throw new Error(msg);
      }
      throw new Error("Failed to resolve pages for roles");
    }
  },

  async createRole(payload: CreateRolePayload): Promise<Role> {
    try {
      const resp = await api.post<Role>("/api/roles", payload);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err?.message || "Failed to create role";
        throw new Error(msg);
      }
      throw new Error("Failed to create role");
    }
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
    try {
      const resp = await api.put<Role>(`/api/roles/${id}`, payload);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err?.message || "Failed to update role";
        throw new Error(msg);
      }
      throw new Error("Failed to update role");
    }
  },

  async deleteRole(id: string): Promise<void> {
    try {
      await api.delete(`/api/roles/${id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err?.message || "Failed to delete role";
        throw new Error(msg);
      }
      throw new Error("Failed to delete role");
    }
  },
};

export default rolesService;
