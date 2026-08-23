import type {
  Enrollment,
  PracticeElsewhereRequest,
} from "../../types/enrollment.types.ts";
import type {
  ApplicationMode,
  PaginatedData,
} from "../../types/common.types.ts";

export interface IEnrollmentService {
  getEnrollments(params?: {
    schoolId?: string;
    studentId?: string;
    status?: string;
  }): Promise<PaginatedData<Enrollment>>;
  getEnrollmentById(id: string): Promise<Enrollment>;
  submitApplication(
    studentId: string,
    schoolId: string,
    mode: ApplicationMode,
    formResponses: Record<string, unknown>,
  ): Promise<Enrollment>;
  acceptApplication(
    id: string,
    classroomId?: string | null,
  ): Promise<Enrollment>;
  acceptApplications(ids: string[]): Promise<Enrollment[]>;
  rejectApplication(id: string): Promise<Enrollment>;
  withdrawApplication(id: string): Promise<Enrollment>;

  getPracticeRequests(params?: {
    schoolId?: string;
    studentId?: string;
  }): Promise<PracticeElsewhereRequest[]>;
  submitPracticeRequest(
    homeSchoolId: string,
    hostSchoolId: string,
    fee: number,
  ): Promise<PracticeElsewhereRequest>;
  approvePracticeRequest(id: string): Promise<PracticeElsewhereRequest>;
  rejectPracticeRequest(id: string): Promise<PracticeElsewhereRequest>;
}
