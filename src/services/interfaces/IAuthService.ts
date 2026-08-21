import { type User } from "../../types/user.types.ts";

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role?: string; // STUDENT by default
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  updateCurrentUser(id: string, data: Partial<User>): Promise<User>;
}
