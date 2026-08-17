import type { Role, ApplicationStatus } from './common.types.ts';

export interface School {
  id: string;
  name: string;
  description?: string | null;
  rating: number;
  status: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  schoolId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SchoolAgreement {
  id: string;
  schoolAId: string;
  schoolBId: string;
  status: string;
  feeSplit?: Record<string, number> | null; // e.g. { schoolA: 0.7, schoolB: 0.3 }
  createdAt: string;
}

export interface StaffApplicationPost {
  id: string;
  schoolId: string;
  role: Role;
  description: string;
  status: string;
  createdAt: string;
}

export interface StaffApplication {
  id: string;
  postId: string;
  applicantId: string;
  status: ApplicationStatus;
  resumeUrl?: string | null;
  submittedAt: string;
}

export interface Review {
  id: string;
  schoolId: string;
  studentId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
