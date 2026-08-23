import type { IAuthService, LoginCredentials, RegisterPayload, AuthResponse } from "./interfaces/IAuthService.ts";
import type { User } from "../types/user.types.ts";
import httpClient from "./api/httpClient.ts";

type ApiAuthResponse = { user: User; accessToken: string };

class AuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<ApiAuthResponse, ApiAuthResponse>("/auth/login", credentials);
    return { user: response.user, token: response.accessToken };
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const response = await httpClient.post<ApiAuthResponse, ApiAuthResponse>("/auth/register", {
      email: payload.email,
      password: payload.password,
      passwordConfirm: payload.password,
      fullName,
      // Registration requires a phone number; the onboarding form supplies it when available.
      phone: (payload as RegisterPayload & { phone?: string }).phone,
    });
    return { user: response.user, token: response.accessToken };
  }

  async logout(): Promise<void> { await httpClient.post<void, void>("/auth/logout"); }
  async getCurrentUser(): Promise<User> { return httpClient.get<User, User>("/auth/me"); }
  async requestPasswordReset(email: string): Promise<void> { await httpClient.post<void, void>("/auth/forgot-password", { email }); }
  async resetPassword(token: string, password: string): Promise<void> { await httpClient.post<void, void>("/auth/reset-password", { token, password, passwordConfirm: password }); }

  async updateCurrentUser(id: string, data: Partial<User>): Promise<User> {
    return httpClient.patch<User, User>(`/users/${id}`, data);
  }
}

export const authService = new AuthService();
