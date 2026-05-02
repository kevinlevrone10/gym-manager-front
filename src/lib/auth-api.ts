import { api } from "./api";
import { tokenStorage } from "./storage";
import type { AuthUser, LoginResponse } from "@/types/api";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
  tokenStorage.setUser(data.user);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  tokenStorage.setUser(data);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post("/api/auth/change-password", { currentPassword, newPassword });
}
