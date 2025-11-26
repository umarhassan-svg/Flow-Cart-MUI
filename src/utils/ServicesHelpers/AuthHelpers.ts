import type { allowedPages, User } from "../../types/User";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const saveSession = (
  token: string | null,
  user: User | null,
  effectivePermissions?: string[],
  allowedPages?: allowedPages[]
) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);

  if (effectivePermissions)
    localStorage.setItem("effectivePermissions", JSON.stringify(effectivePermissions));
  else localStorage.removeItem("effectivePermissions");

  if (allowedPages) localStorage.setItem("allowedPages", JSON.stringify(allowedPages));
  else localStorage.removeItem("allowedPages");

  // No need to set axios header here — interceptor handles it based on localStorage
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const getCurrentUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("effectivePermissions");
  localStorage.removeItem("allowedPages");
  // interceptor will no longer find token in localStorage and won't add Authorization
};

export { saveSession, getToken, getCurrentUser, clearSession };