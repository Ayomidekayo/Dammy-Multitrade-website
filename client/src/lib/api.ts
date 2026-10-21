import axios, {
} from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Keep the token in memory.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

// Attach the authentication token to requests when available.
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

// Consistent API response format.
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Shared request function used by the dashboard and other pages.
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  // Let the browser set the multipart boundary for FormData.
  if (isFormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const baseURL =
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:5000/api/v1";

  const response = await fetch(
    `${baseURL.replace(/\/$/, "")}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ??
        `Request failed with status ${response.status}.`,
    );
  }

  return result as ApiResponse<T>;
}