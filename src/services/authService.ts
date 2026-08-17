import type { IAuthService, LoginCredentials, RegisterPayload, AuthResponse } from './interfaces/IAuthService.ts';
import type { User } from '../types/user.types.ts';
import { Role, VerificationStatus } from '../types/common.types.ts';
import { mockUsers } from './mockData.ts';
import { parseRole } from '../utils/typeGuards.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class AuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // REAL API IMPLEMENTATION (Commented out until ready):
    // return httpClient.post<AuthResponse>('/auth/login', credentials);

    // MOCK DATA IMPLEMENTATION:
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return delay(800, { user, token: 'mock-jwt-token-123' });
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
      dateOfBirth: '2000-01-01T00:00:00Z',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return delay(800, { user: newUser, token: 'mock-jwt-token-123' });
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
    return delay(500, mockUsers[0]); // Returns the admin by default for testing
  }
}

export const authService = new AuthService();
