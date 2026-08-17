import { createContext } from 'react';
import type { User } from '../../types/user.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface UserState {
  users: PaginatedData<User> | null;
  activeUser: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserContextType extends UserState {
  loadUsers: (params?: { role?: string; search?: string }) => Promise<void>;
  loadUserById: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  assignRole: (id: string, role: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);
