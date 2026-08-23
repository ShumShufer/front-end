import type { IUserService } from "./interfaces/IUserService.ts";
import type { User } from "../types/user.types.ts";
import type { PaginatedData, Role } from "../types/common.types.ts";
import httpClient from "./api/httpClient.ts";

type UsersResponse = { users: User[]; meta: PaginatedData<User>["meta"] };
class UserService implements IUserService {
  async getUsers(params?: { role?: string; search?: string }): Promise<PaginatedData<User>> { const response = await httpClient.get<UsersResponse, UsersResponse>("/users", { params }); return { data: response.users, meta: response.meta }; }
  async getUserById(id: string): Promise<User> { return httpClient.get<User, User>(`/users/${id}`); }
  async createUser(data: { email: string; firstName: string; lastName: string; role: Role; schoolId?: string | null }): Promise<User> { return httpClient.post<User, User>("/users", data); }
  async updateUser(id: string, data: Partial<User>): Promise<User> { return httpClient.patch<User, User>(`/users/${id}`, data); }
  async suspendUser(id: string): Promise<User> { return httpClient.patch<User, User>(`/users/${id}/status`, { status: "REJECTED" }); }
  async assignRole(id: string, role: string): Promise<User> { return httpClient.patch<User, User>(`/users/${id}/assign-role`, { role }); }
}
export const userService = new UserService();
