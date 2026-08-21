import type { IEnrollmentService } from "./interfaces/IEnrollmentService.ts";
import type {
  Enrollment,
  PracticeElsewhereRequest,
} from "../types/enrollment.types.ts";
import type { ApplicationMode, PaginatedData } from "../types/common.types.ts";
import { ApplicationStatus } from "../types/common.types.ts";
import { mockEnrollments, mockPracticeRequests } from "./mockData.ts";
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class EnrollmentService implements IEnrollmentService {
  async getEnrollments(params?: {
    schoolId?: string;
    studentId?: string;
    status?: string;
  }): Promise<PaginatedData<Enrollment>> {
    // return httpClient.get('/enrollments', { params });
    let filtered = mockEnrollments;
    if (params?.schoolId)
      filtered = filtered.filter((e) => e.schoolId === params.schoolId);
    if (params?.studentId)
      filtered = filtered.filter((e) => e.studentId === params.studentId);
    if (params?.status)
      filtered = filtered.filter((e) => e.status === params.status);

    return delay(500, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async getEnrollmentById(id: string): Promise<Enrollment> {
    // return httpClient.get(`/enrollments/${id}`);
    const enrollment = mockEnrollments.find((e) => e.id === id);
    if (!enrollment) throw new Error("Enrollment not found");
    return delay(400, enrollment);
  }

  async submitApplication(
    schoolId: string,
    mode: ApplicationMode,
    formResponses: Record<string, unknown>,
  ): Promise<Enrollment> {
    // return httpClient.post('/enrollments', { schoolId, mode, formResponses });
    const newEnrollment: Enrollment = {
      id: `enrollment-${Date.now()}`,
      studentId: "user-2", // mocked current user
      schoolId,
      classroomId: null,
      mode,
      status: ApplicationStatus.PENDING,
      formResponses,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedById: null,
    };
    mockEnrollments.push(newEnrollment);
    return delay(800, newEnrollment);
  }

  async acceptApplication(id: string): Promise<Enrollment> {
    // return httpClient.patch(`/enrollments/${id}/accept`);
    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Enrollment not found");
    mockEnrollments[index] = {
      ...mockEnrollments[index],
      status: ApplicationStatus.ACCEPTED,
      reviewedAt: new Date().toISOString(),
    };
    return delay(500, mockEnrollments[index]);
  }

  async rejectApplication(id: string): Promise<Enrollment> {
    // return httpClient.patch(`/enrollments/${id}/reject`);
    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Enrollment not found");
    mockEnrollments[index] = {
      ...mockEnrollments[index],
      status: ApplicationStatus.REJECTED,
      reviewedAt: new Date().toISOString(),
    };
    return delay(500, mockEnrollments[index]);
  }

  async getPracticeRequests(params?: {
    schoolId?: string;
    studentId?: string;
  }): Promise<PracticeElsewhereRequest[]> {
    // return httpClient.get('/practice-requests', { params });
    let filtered = mockPracticeRequests;
    if (params?.studentId)
      filtered = filtered.filter((r) => r.studentId === params.studentId);
    if (params?.schoolId) {
      filtered = filtered.filter(
        (r) =>
          r.homeSchoolId === params.schoolId ||
          r.hostSchoolId === params.schoolId,
      );
    }
    return delay(400, filtered);
  }

  async submitPracticeRequest(
    homeSchoolId: string,
    hostSchoolId: string,
    fee: number,
  ): Promise<PracticeElsewhereRequest> {
    // return httpClient.post('/practice-requests', { homeSchoolId, hostSchoolId, fee });
    const newRequest: PracticeElsewhereRequest = {
      id: `practice-${Date.now()}`,
      studentId: "user-2", // mocked current user
      homeSchoolId,
      hostSchoolId,
      fee,
      status: ApplicationStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    mockPracticeRequests.push(newRequest);
    return delay(600, newRequest);
  }

  async approvePracticeRequest(id: string): Promise<PracticeElsewhereRequest> {
    // return httpClient.patch(`/practice-requests/${id}/approve`);
    const index = mockPracticeRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Practice request not found");
    mockPracticeRequests[index] = {
      ...mockPracticeRequests[index],
      status: ApplicationStatus.ACCEPTED,
    };
    return delay(500, mockPracticeRequests[index]);
  }
}

export const enrollmentService = new EnrollmentService();
