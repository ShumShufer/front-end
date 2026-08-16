import { IUserService } from '../interfaces/IUserService';
import { User } from '../../types/user.types';
import { UserRole } from '../../types/common.types';

export const mockUserService: IUserService = {
  async getById(id: string): Promise<User> {
    return {
      id,
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async update(id: string, data: any): Promise<User> {
    return {
      id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async getProfile(userId: string): Promise<User> {
    return {
      id: userId,
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async listByRole(_role: string): Promise<User[]> {
    return [];
  },
};
