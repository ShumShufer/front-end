import { User, AuthUser } from '../../types/user.types';

export interface IAuthService {
  login(email: string, password: string): Promise<AuthUser>;
  register(data: any): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  verifyToken(token: string): Promise<boolean>;
}
