import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);

  if (isFormData) headers.delete("Content-Type");
  else if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const baseURL = API_BASE_URL.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message ?? `Request failed with status ${response.status}.`);
  }
  return result as ApiResponse<T>;
}
