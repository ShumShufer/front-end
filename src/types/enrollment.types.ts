import type { ApplicationMode, ApplicationStatus } from "./common.types.ts";

export interface Enrollment {
  id: string;
  studentId: string;
  schoolId: string;
  classroomId?: string | null;
  mode: ApplicationMode;
  status: ApplicationStatus;
  formResponses: Record<string, unknown>;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
}

export interface ApplicationFormTemplate {
  id: string;
  schoolId: string;
  fields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }>; // form field definitions
}

export interface PracticeElsewhereRequest {
  id: string;
  studentId: string;
  homeSchoolId: string;
  hostSchoolId: string;
  status: ApplicationStatus;
  fee: number;
  createdAt: string;
}
