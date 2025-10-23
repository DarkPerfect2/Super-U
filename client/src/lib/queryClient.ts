import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authStorage, refreshTokens } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = authStorage.getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
export function toApiUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE}${path}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  let res = await fetch(toApiUrl(url), {
    method,
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await fetch(toApiUrl(url), {
        method,
        headers: getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
    }
  }

  await throwIfResNotOk(res);
  
  if (res.status === 204) {
    return null;
  }
  
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = authStorage.getAccessToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    let res = await fetch(toApiUrl(queryKey.join("/") as string), {
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const retryHeaders: HeadersInit = {};
        const newToken = authStorage.getAccessToken();
        if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(toApiUrl(queryKey.join("/") as string), {
          headers: retryHeaders,
          credentials: "include",
        });
      } else if (unauthorizedBehavior === "returnNull") {
        return null;
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
