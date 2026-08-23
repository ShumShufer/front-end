import { createContext } from "react";
import type {
  Enrollment,
  PracticeElsewhereRequest,
} from "../../types/enrollment.types.ts";
import type {
  ApplicationMode,
  PaginatedData,
} from "../../types/common.types.ts";

export interface EnrollmentState {
  enrollments: PaginatedData<Enrollment> | null;
  practiceRequests: PracticeElsewhereRequest[];
  isLoading: boolean;
  error: string | null;
}

export interface EnrollmentContextType extends EnrollmentState {
  loadEnrollments: (params?: {
    schoolId?: string;
    studentId?: string;
    status?: string;
  }) => Promise<void>;
  submitApplication: (
    studentId: string,
    schoolId: string,
    mode: ApplicationMode,
    formResponses: Record<string, unknown>,
  ) => Promise<void>;
  acceptApplication: (id: string, classroomId?: string | null) => Promise<void>;
  acceptApplications: (ids: string[]) => Promise<void>;
  rejectApplication: (id: string) => Promise<void>;
  withdrawApplication: (id: string) => Promise<void>;
  loadPracticeRequests: (params?: {
    schoolId?: string;
    studentId?: string;
  }) => Promise<void>;
  submitPracticeRequest: (
    homeSchoolId: string,
    hostSchoolId: string,
    fee: number,
  ) => Promise<void>;
  approvePracticeRequest: (id: string) => Promise<void>;
  rejectPracticeRequest: (id: string) => Promise<void>;
}

export const EnrollmentContext = createContext<EnrollmentContextType | null>(
  null,
);
