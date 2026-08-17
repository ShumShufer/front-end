import type { IUserService } from './interfaces/IUserService.ts';
import type { User } from '../types/user.types.ts';
import type { PaginatedData } from '../types/common.types.ts';
import { VerificationStatus } from '../types/common.types.ts';
import { mockUsers } from './mockData.ts';
import { parseRole } from '../utils/typeGuards.ts';
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class UserService implements IUserService {
  async getUsers(params?: { role?: string; search?: string }): Promise<PaginatedData<User>> {
    // return httpClient.get('/users', { params });
    let filtered = mockUsers;
    if (params?.role) filtered = filtered.filter(u => u.role === params.role);
    if (params?.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }

    return delay(500, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async getUserById(id: string): Promise<User> {
    // return httpClient.get(`/users/${id}`);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return delay(400, user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    // return httpClient.patch(`/users/${id}`, data);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = { ...mockUsers[index], ...data, updatedAt: new Date().toISOString() };
    return delay(500, mockUsers[index]);
  }

  async suspendUser(id: string): Promise<User> {
    // return httpClient.patch(`/users/${id}/suspend`);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = {
      ...mockUsers[index],
      verificationStatus: VerificationStatus.REJECTED,
      updatedAt: new Date().toISOString(),
    };
    return delay(500, mockUsers[index]);
  }

  async assignRole(id: string, role: string): Promise<User> {
    // return httpClient.patch(`/users/${id}/role`, { role });
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = {
      ...mockUsers[index],
      role: parseRole(role, mockUsers[index].role),
      updatedAt: new Date().toISOString(),
    };
    return delay(500, mockUsers[index]);
  }
}

export const userService = new UserService();
