import { User } from "@shared/schema";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  removeAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
  
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const isAuthenticated = (): boolean => {
  return !!authStorage.getAccessToken();
};

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
function toApiUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE}${path}`;
}

let ongoingRefresh: Promise<boolean> | null = null;

export async function refreshTokens(): Promise<boolean> {
  if (ongoingRefresh) {
    return ongoingRefresh;
  }
  const refresh = authStorage.getRefreshToken();
  if (!refresh) return false;
  ongoingRefresh = (async () => {
    try {
      const res = await fetch(toApiUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.access) authStorage.setAccessToken(data.access);
      if (data?.refresh) authStorage.setRefreshToken(data.refresh);
      return true;
    } catch {
      return false;
    } finally {
      ongoingRefresh = null;
    }
  })();
  return ongoingRefresh;
}
