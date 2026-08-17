import type { Role, VerificationStatus } from './common.types.ts';

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  role: Role;
  faydaId?: string | null;
  verificationStatus: VerificationStatus;
  dateOfBirth: string; // ISO string
  avatarUrl?: string | null;
  schoolId?: string | null;
  createdAt: string;
  updatedAt: string;
}
