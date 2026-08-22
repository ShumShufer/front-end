import type { IEnrollmentService } from "./interfaces/IEnrollmentService.ts";
import type {
  Enrollment,
  PracticeElsewhereRequest,
} from "../types/enrollment.types.ts";
import type {
  ApplicationMode,
  PaginatedData,
} from "../types/common.types.ts";
import { ApplicationStatus, NotificationTopic, Role } from "../types/common.types.ts";
import {
  mockClassrooms,
  mockEnrollments,
  mockPracticeRequests,
  mockSchools,
  mockUsers,
} from "./mockData.ts";
import { notificationService } from "./notificationService.ts";
import { getSessionUser } from "../utils/session.ts";
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const schoolNameOf = (schoolId: string): string =>
  mockSchools.find((school) => school.id === schoolId)?.name ?? "the school";

const schoolAdminIds = (schoolId: string): string[] =>
  mockUsers
    .filter((user) => user.role === Role.ADMIN && user.schoolId === schoolId)
    .map((user) => user.id);

// Acceptance makes the applicant an enrolled member of the school, so keep
// their profile's school affiliation in sync for every school-scoped view.
function attachStudentToSchool(studentId: string, schoolId: string): void {
  const student = mockUsers.find((user) => user.id === studentId);
  if (student && !student.schoolId) {
    student.schoolId = schoolId;
    student.updatedAt = new Date().toISOString();
  }
}

function resolveClassroom(
  schoolId: string,
  requested?: string | null,
): string | null {
  if (requested) {
    const classroom = mockClassrooms.find((item) => item.id === requested);
    if (!classroom || classroom.schoolId !== schoolId)
      throw new Error("The selected classroom does not belong to this school");
    return classroom.id;
  }
  // Auto-placement falls back to the school's first classroom so approval
  // always results in a usable roster entry, even without a picked cohort.
  return (
    mockClassrooms.find((item) => item.schoolId === schoolId)?.id ?? null
  );
}

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
    studentId: string,
    schoolId: string,
    mode: ApplicationMode,
    formResponses: Record<string, unknown>,
  ): Promise<Enrollment> {
    // return httpClient.post('/enrollments', { schoolId, mode, formResponses });
    const hasActiveApplication = mockEnrollments.some(
      (item) =>
        item.studentId === studentId &&
        item.schoolId === schoolId &&
        (item.status === ApplicationStatus.PENDING ||
          item.status === ApplicationStatus.ACCEPTED),
    );
    if (hasActiveApplication)
      throw new Error("You already have an active application with this school");

    const newEnrollment: Enrollment = {
      id: `enrollment-${Date.now()}`,
      studentId,
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
    const applicant = mockUsers.find((user) => user.id === studentId);
    const applicantName = applicant
      ? `${applicant.firstName} ${applicant.lastName}`
      : "A student";
    // Fan-out that the backend will own once integrated.
    await notificationService.create({
      topic: NotificationTopic.APPLICATION,
      title: "New enrollment application",
      body: `${applicantName} applied to join ${schoolNameOf(schoolId)} (${mode.toLowerCase().replace("_", " ")}).`,
      recipientIds: schoolAdminIds(schoolId),
      relatedEntityId: newEnrollment.id,
    });
    return delay(800, newEnrollment);
  }

  async acceptApplication(
    id: string,
    classroomId?: string | null,
  ): Promise<Enrollment> {
    // return httpClient.patch(`/enrollments/${id}/accept`, { classroomId });
    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Enrollment not found");
    const enrollment = mockEnrollments[index];
    if (enrollment.status !== ApplicationStatus.PENDING)
      throw new Error("Only pending applications can be approved");

    mockEnrollments[index] = {
      ...enrollment,
      status: ApplicationStatus.ACCEPTED,
      classroomId: resolveClassroom(enrollment.schoolId, classroomId),
      reviewedAt: new Date().toISOString(),
    };
    attachStudentToSchool(enrollment.studentId, enrollment.schoolId);
    await notificationService.create({
      topic: NotificationTopic.APPLICATION,
      title: "Enrollment accepted",
      body: `Your application to ${schoolNameOf(enrollment.schoolId)} was accepted. Your classroom workspace is now open.`,
      recipientIds: [enrollment.studentId],
      relatedEntityId: id,
    });
    return delay(500, mockEnrollments[index]);
  }

  async acceptApplications(ids: string[]): Promise<Enrollment[]> {
    // return httpClient.patch('/enrollments/accept-bulk', { ids });
    const reviewedAt = new Date().toISOString();
    const accepted: Enrollment[] = [];
    ids.forEach((id) => {
      const index = mockEnrollments.findIndex((item) => item.id === id);
      if (index === -1) return;
      if (mockEnrollments[index].status !== ApplicationStatus.PENDING) return;
      const enrollment = mockEnrollments[index];
      mockEnrollments[index] = {
        ...enrollment,
        status: ApplicationStatus.ACCEPTED,
        classroomId: resolveClassroom(enrollment.schoolId),
        reviewedAt,
      };
      attachStudentToSchool(enrollment.studentId, enrollment.schoolId);
      accepted.push(mockEnrollments[index]);
    });
    if (!accepted.length)
      throw new Error("No pending enrollment applications were found");
    await notificationService.create({
      topic: NotificationTopic.APPLICATION,
      title: "Enrollment accepted",
      body: accepted
        .map(
          (item) =>
            `Your application to ${schoolNameOf(item.schoolId)} was accepted.`,
        )
        .join(" "),
      recipientIds: [...new Set(accepted.map((item) => item.studentId))],
      relatedEntityId: accepted[0]?.id ?? null,
    });
    return delay(550, accepted);
  }

  async rejectApplication(id: string): Promise<Enrollment> {
    // return httpClient.patch(`/enrollments/${id}/reject`);
    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Enrollment not found");
    const enrollment = mockEnrollments[index];
    if (enrollment.status !== ApplicationStatus.PENDING)
      throw new Error("Only pending applications can be rejected");
    mockEnrollments[index] = {
      ...enrollment,
      status: ApplicationStatus.REJECTED,
      reviewedAt: new Date().toISOString(),
    };
    await notificationService.create({
      topic: NotificationTopic.APPLICATION,
      title: "Enrollment declined",
      body: `Your application to ${schoolNameOf(enrollment.schoolId)} was not accepted this time.`,
      recipientIds: [enrollment.studentId],
      relatedEntityId: id,
    });
    return delay(500, mockEnrollments[index]);
  }

  async withdrawApplication(id: string): Promise<Enrollment> {
    // return httpClient.patch(`/enrollments/${id}/withdraw`);
    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Enrollment not found");
    if (mockEnrollments[index].status !== ApplicationStatus.PENDING)
      throw new Error("Only pending applications can be withdrawn");
    mockEnrollments[index] = {
      ...mockEnrollments[index],
      status: ApplicationStatus.WITHDRAWN,
    };
    return delay(400, mockEnrollments[index]);
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
    const sessionStudent = getSessionUser();
    const newRequest: PracticeElsewhereRequest = {
      id: `practice-${Date.now()}`,
      studentId: sessionStudent ? sessionStudent.id : "user-2",
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

  async rejectPracticeRequest(id: string): Promise<PracticeElsewhereRequest> {
    // return httpClient.patch(`/practice-requests/${id}/reject`);
    const index = mockPracticeRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Practice request not found");
    if (mockPracticeRequests[index].status !== ApplicationStatus.PENDING)
      throw new Error("Only pending requests can be rejected");
    mockPracticeRequests[index] = {
      ...mockPracticeRequests[index],
      status: ApplicationStatus.REJECTED,
    };
    return delay(500, mockPracticeRequests[index]);
  }
}

export const enrollmentService = new EnrollmentService();
