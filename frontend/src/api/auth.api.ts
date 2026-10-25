import { http } from "./http";
import type { Role, User } from "../auth";

export interface LoginResponse {
  token: string;
  user: User & { email: string; role: Role };
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", { email, password });
  return data;
}
