import { api, setAuthToken } from "../../lib/api";

export interface AdminUser { id: string; name: string; email: string; role: string; }
interface ApiEnvelope<T> { success: boolean; message?: string; data: T; }
interface LoginData { token: string; admin: AdminUser; }

export async function loginRequest(email: string, password: string) {
  const response = await api.post<ApiEnvelope<LoginData>>("/auth/login", { email, password });
  const payload = response.data.data;
  if (!payload?.token || !payload?.admin) throw new Error("The server returned an unexpected login response.");
  setAuthToken(payload.token);
  return payload.admin;
}

export async function currentAdminRequest() {
  const response = await api.get<ApiEnvelope<AdminUser>>("/auth/me");
  return response.data.data;
}
