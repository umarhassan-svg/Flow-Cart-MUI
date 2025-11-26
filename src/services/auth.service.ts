/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts
import api from "./api/axios";

const authService = {
  /**
   * Login and persist token + user in localStorage.
   *
   */
  async login(email: string, password: string): Promise<any> {
    const resp = await api.post("/auth/login", { email, password });
    return resp;
  },

  /**
   * Logout / clear session.
   */
  async logout(): Promise<any> {
    // If you need to call backend logout endpoint, do it here (optional).
    //const resp = await api.post("/auth/logout"); // optional - uncomment if needed
    
    return  null;
  },

    /**
   * Fetch fresh profile from server and persist it.
   */
  async getProfile(): Promise<any> {
    const resp = await api.get("/auth/me");
    return resp;
  },
};

export default authService;
