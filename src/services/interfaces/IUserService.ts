import { User } from '../../types/user.types';

export interface IUserService {
  getById(id: string): Promise<User>;
  update(id: string, data: any): Promise<User>;
  getProfile(userId: string): Promise<User>;
  listByRole(role: string): Promise<User[]>;
}
