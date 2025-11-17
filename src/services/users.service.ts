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
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roles?: string[];
}

/**
 * Role type
 */
export interface Role {
  id: string;
  name: string;
  pages: string[];
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
      if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to fetch users";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to fetch users"); // Throw an error if an error occurs
    }
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    try {
      const resp = await api.post<User>("/api/users", payload);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to create user";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to create user"); // Throw an error if an error occurs
    }
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    try {
      const resp = await api.put<User>(`/api/users/${id}`, payload);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to update user";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to update user"); // Throw an error if an error occurs
    }
  },

  async deleteUser(id: string): Promise<User> {
    try {
      const resp = await api.delete<{ deleted: User }>(`/api/users/${id}`);
      return resp.data.deleted;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to delete user";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to delete user"); // Throw an error if an error occurs
    }
  },

  async getRoles(): Promise<Role[]> {
    try {
      const resp = await api.get<Role[]>("/api/roles");
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to fetch roles";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to fetch roles"); // Throw an error if an error occurs
    }
  },

  async createRole(payload: { name: string; pages?: string[] }): Promise<Role> {
    try {
      const resp = await api.post<Role>("/api/roles", payload);
      return resp.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to create role";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to create role"); // Throw an error if an error occurs
    }
  },

  async updateRole(id: string, payload: { name?: string; pages?: string[] }): Promise<Role> {
    try {
      const resp = await api.put<Role>(`/api/roles/${id}`, payload);
      return resp.data;
    } catch (err: unknown) {

       if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to create role";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to create role"); // Throw an error if an error occurs

    }
  },

  async deleteRole(id: string): Promise<Role> {
    try {
      const resp = await api.delete<{ deleted: Role }>(`/api/roles/${id}`);
      return resp.data.deleted;
    } catch (err: unknown) {
       if (err instanceof Error) {
        // Handle the error
        const msg = err?.message || "Failed to create role";
        throw new Error(msg);
      } else {
        // Handle other types of errors
      }
      throw new Error("Failed to create role"); // Throw an error if an error occurs
    }
  }
};

export default usersService;
