// src/services/users.service.ts
import api from "./api/axios";
import type { User } from "../types/User";
import type { PaginatedResponse, UpdateUserPayload, CreateUserPayload } from "../types/UsersService";
import type { Role } from "../types/Roles";
import { 
  handleApiCall, 
  handleGetUserWithFallback, 
  handleCardUrlResponse 
} from "../utils/ServicesHelpers/UsersHelpers"; // Import the helper

const usersService = {
  getUsers(opts?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    const params = {
      page: opts?.page ?? 1,
      limit: opts?.limit ?? 10,
      search: opts?.search ?? ""
    };
    // Simply pass the function definition to the helper
    return handleApiCall<PaginatedResponse<User>>(
      () => api.get("/api/users", { params }), 
      "Failed to fetch users"
    );
  },

  getUser(id: string): Promise<User> {
    // Uses the specialized helper to handle the specific fallback logic
    return handleGetUserWithFallback(
      () => api.get(`/api/users/${id}`),
      // We define the fallback call here (fetching list of 1000)
      () => api.get("/api/users", { params: { page: 1, limit: 1000, search: "" } }),
      id
    );
  },

  createUser(payload: CreateUserPayload): Promise<User> {
    return handleApiCall<User>(
      () => api.post("/api/users", payload), 
      "Failed to create user"
    );
  },

  updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    return handleApiCall<User>(
      () => api.put(`/api/users/${id}`, payload), 
      "Failed to update user"
    );
  },

  deleteUser(id: string): Promise<User> {
    // Note: We use a small inline transform here because the helper expects the return type T
    // but the API returns { deleted: User }. We extract .deleted inside the callback.
    return handleApiCall<User>(
      async () => {
        const res = await api.delete<{ deleted: User }>(`/api/users/${id}`);
        return { ...res, data: res.data.deleted }; // Adapt response to match generic
      }, 
      "Failed to delete user"
    );
  },

  getRoles(): Promise<Role[]> {
    return handleApiCall<Role[]>(
      () => api.get("/api/roles"), 
      "Failed to fetch roles"
    );
  },

  createRole(payload: { name: string; pages?: string[]; permissions?: string[] }): Promise<Role> {
    return handleApiCall<Role>(
      () => api.post("/api/roles", payload), 
      "Failed to create role"
    );
  },

  updateRole(id: string, payload: { name?: string; pages?: string[]; permissions?: string[] }): Promise<Role> {
    return handleApiCall<Role>(
      () => api.put(`/api/roles/${id}`, payload), 
      "Failed to update role"
    );
  },

  deleteRole(id: string): Promise<Role> {
    return handleApiCall<Role>(
      async () => {
        const res = await api.delete<{ deleted: Role }>(`/api/roles/${id}`);
        return { ...res, data: res.data.deleted };
      }, 
      "Failed to delete role"
    );
  },

  uploadEmployeeCard(userId: string, file: File): Promise<{ url: string }> {
    const fd = new FormData();
    fd.append("file", file);

    return handleApiCall<{ url: string }>(
      () => api.post(`/api/users/${encodeURIComponent(userId)}/employee-card`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }),
      "Failed to upload employee card"
    );
  },

  getEmployeeCardUrl(userId: string): Promise<string | null> {
    return handleCardUrlResponse(
      () => api.get(`/api/users/${encodeURIComponent(userId)}/employee-card/download`, {
        withCredentials: true,
      }),
      userId
    );
  }
};

export default usersService;