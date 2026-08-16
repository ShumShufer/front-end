import { IAuthService } from '../interfaces/IAuthService';
import { AuthUser, User } from '../../types/user.types';
import { UserRole } from '../../types/common.types';

export const mockAuthService: IAuthService = {
  async login(email: string, _password: string): Promise<AuthUser> {
    return {
      id: '1',
      email,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      token: 'mock-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async register(data: any): Promise<AuthUser> {
    return {
      id: '1',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.STUDENT,
      token: 'mock-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async logout(): Promise<void> {
    // Mock implementation
  },

  async getCurrentUser(): Promise<User> {
    return {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async verifyToken(_token: string): Promise<boolean> {
    return true;
  },
};
