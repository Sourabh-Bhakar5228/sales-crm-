import { api } from "./client";
import type { LoginResponse, User } from "../types/auth";

export const login = (email: string, password: string) => {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const logout = () => {
  return api<{ success: boolean; message: string }>("/auth/logout", {
    method: "POST",
  });
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await api<{ success: boolean; data: { user?: User } & User }>("/auth/me");
  return res.data.user || res.data;
};
