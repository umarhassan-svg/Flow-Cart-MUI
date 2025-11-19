/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts
import api from "./api/axios";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  // optional direct user permissions (stored server-side)
  permissions?: string[];
  // server computed effective permissions (union of role perms + user perms)
  effectivePermissions?: string[];
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common = api.defaults.headers.common || {};
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    if (api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common["Authorization"];
    }
  }
};


const saveSession = (token: string | null, user: User | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);

  // always update axios header based on token
  setAuthHeader(token);
};

const getToken = (): string | null => {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) {
    // ensure axios has it (useful when page reloads)
    setAuthHeader(t);
  }
  return t;
};

const getCurrentUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setAuthHeader(null);
};

const authService = {
  /**
   * Login and persist token + user in localStorage.
   * Returns the user object returned by the API.
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const resp = await api.post("/auth/login", { email, password });
      const { token, user } = resp.data as { token: string; user: User };

      // Persist exactly what server returned (including effectivePermissions)
      saveSession(token, user);
      return user;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Login failed";
      throw new Error(msg);
    }
  },

  /**
   * Fetch fresh profile from server and persist it.
   * Server returns user object with effectivePermissions.
   */
  async getProfile(): Promise<User> {
    try {
      // Ensure header set before calling (in case caller didn't)
      const token = getToken();
      if (token) setAuthHeader(token);

      const resp = await api.get("/auth/me");
      const user = resp.data.user as User;
      // persist the fresh profile (keep existing token)
      saveSession(getToken(), user);
      return user;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Failed to get profile";
      throw new Error(msg);
    }
  },

  logout() {
    clearSession();
  },

  getToken,
  getCurrentUser,
  isAuthenticated(): boolean {
    return Boolean(getToken());
  },
};

export default authService;
