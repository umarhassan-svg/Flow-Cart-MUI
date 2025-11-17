// src/services/auth.service.ts
import api from "./api/axios";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

const saveSession = (token: string | null, user: User | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

const getCurrentUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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

      // Persist exactly what server returned (no derived allowedPages here)
      saveSession(token, user);
      return user;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Login failed";
      throw new Error(msg);
    }
  },

  /**
   * Fetch fresh profile from server and persist it.
   */
  async getProfile(): Promise<User> {
    try {
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
