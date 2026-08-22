import type {
  IAuthService,
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
} from "./interfaces/IAuthService.ts";
import type { User } from "../types/user.types.ts";
import { Role, VerificationStatus } from "../types/common.types.ts";
import { mockUsers } from "./mockData.ts";
import { parseRole } from "../utils/typeGuards.ts";
import { getSessionUser } from "../utils/session.ts";

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// The mock user list lives in module memory and reseeds on every refresh,
// so the signed-in account must be restored from its persisted session
// snapshot instead of from mockUsers.
function getStoredSessionUser(): User {
  const user = getSessionUser();
  if (!user) throw new Error("No active session");
  return user;
}

class AuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // REAL API IMPLEMENTATION (Commented out until ready):
    // return httpClient.post<AuthResponse>('/auth/login', credentials);

    // MOCK DATA IMPLEMENTATION:
    const user = mockUsers.find((u) => u.email === credentials.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    return delay(800, { user, token: "mock-jwt-token-123" });
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    // REAL API IMPLEMENTATION:
    // return httpClient.post<AuthResponse>('/auth/register', payload);

    // MOCK DATA IMPLEMENTATION:
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: parseRole(payload.role, Role.STUDENT),
      verificationStatus: VerificationStatus.PENDING,
      dateOfBirth: "2000-01-01T00:00:00Z",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return delay(800, { user: newUser, token: "mock-jwt-token-123" });
  }

  async logout(): Promise<void> {
    // REAL API IMPLEMENTATION:
    // return httpClient.post('/auth/logout');

    // MOCK DATA IMPLEMENTATION:
    return delay(300, undefined);
  }

  async getCurrentUser(): Promise<User> {
    // REAL API IMPLEMENTATION:
    // return httpClient.get<User>('/auth/me');

    // MOCK DATA IMPLEMENTATION:
    return delay(500, getStoredSessionUser());
  }

  async requestPasswordReset(email: string): Promise<void> {
    if (!mockUsers.some((user) => user.email === email))
      throw new Error("No account exists with that email");
    return delay(600, undefined);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    if (!token || password.length < 8)
      throw new Error(
        "Please provide a valid reset link and a password of at least 8 characters",
      );
    return delay(600, undefined);
  }

  async updateCurrentUser(id: string, data: Partial<User>): Promise<User> {
    const index = mockUsers.findIndex((user) => user.id === id);
    if (index === -1) throw new Error("User not found");
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return delay(500, mockUsers[index]);
  }
}

export const authService = new AuthService();
