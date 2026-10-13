import type { User } from "../../types/user.types.ts";
import type { PaginatedData, Role } from "../../types/common.types.ts";

export interface IUserService {
  getUsers(params?: {
    role?: string;
    search?: string;
  }): Promise<PaginatedData<User>>;
  getUserById(id: string): Promise<User>;
  createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    schoolId?: string | null;
  }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  suspendUser(id: string): Promise<User>;
  assignRole(id: string, role: string): Promise<User>;
}
