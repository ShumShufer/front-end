import type { IEnrollmentService } from "./interfaces/IEnrollmentService.ts";
import type { Enrollment, PracticeElsewhereRequest } from "../types/enrollment.types.ts";
import type { ApplicationMode, PaginatedData } from "../types/common.types.ts";
import httpClient from "./api/httpClient.ts";

type ApplicationsResponse = { applications: Enrollment[]; meta: PaginatedData<Enrollment>["meta"] };

class EnrollmentService implements IEnrollmentService {
  async getEnrollments(params?: { schoolId?: string; studentId?: string; status?: string }): Promise<PaginatedData<Enrollment>> {
    if (params?.schoolId) { const response = await httpClient.get<ApplicationsResponse, ApplicationsResponse>(`/schools/${params.schoolId}/applications`, { params: { status: params.status } }); return { data: response.applications, meta: response.meta }; }
    const response = await httpClient.get<ApplicationsResponse | Enrollment[], ApplicationsResponse | Enrollment[]>(params?.studentId ? `/students/${params.studentId}/applications` : "/applications/my");
    return Array.isArray(response) ? { data: response, meta: { page: 1, pageSize: response.length, total: response.length } } : { data: response.applications ?? [], meta: response.meta };
  }
  async getEnrollmentById(id: string): Promise<Enrollment> { const applications = await this.getEnrollments(); const application = applications.data.find((item) => item.id === id); if (!application) throw new Error("Application not found"); return application; }
  async submitApplication(_studentId: string, schoolId: string, mode: ApplicationMode, formResponses: Record<string, unknown>): Promise<Enrollment> { return httpClient.post<Enrollment, Enrollment>(`/schools/${schoolId}/applications`, { mode, formResponses }); }
  async acceptApplication(id: string, classroomId?: string | null): Promise<Enrollment> { if (!classroomId) throw new Error("Select a classroom before accepting an application"); return httpClient.patch<Enrollment, Enrollment>(`/applications/${id}/accept`, { classroomId }); }
  async acceptApplications(ids: string[]): Promise<Enrollment[]> { return Promise.all(ids.map((id) => this.acceptApplication(id))); }
  async rejectApplication(id: string): Promise<Enrollment> { return httpClient.patch<Enrollment, Enrollment>(`/applications/${id}/reject`); }
  async withdrawApplication(id: string): Promise<Enrollment> { return httpClient.post<Enrollment, Enrollment>(`/applications/${id}/withdraw`); }
  async getPracticeRequests(params?: { schoolId?: string; studentId?: string }): Promise<PracticeElsewhereRequest[]> { return httpClient.get<PracticeElsewhereRequest[], PracticeElsewhereRequest[]>("/practice-requests", { params }); }
  async submitPracticeRequest(homeSchoolId: string, hostSchoolId: string, fee: number): Promise<PracticeElsewhereRequest> { return httpClient.post<PracticeElsewhereRequest, PracticeElsewhereRequest>("/practice-requests", { homeSchoolId, hostSchoolId, fee }); }
  async approvePracticeRequest(id: string): Promise<PracticeElsewhereRequest> { return httpClient.patch<PracticeElsewhereRequest, PracticeElsewhereRequest>(`/practice-requests/${id}/status`, { status: "ACCEPTED" }); }
  async rejectPracticeRequest(id: string): Promise<PracticeElsewhereRequest> { return httpClient.patch<PracticeElsewhereRequest, PracticeElsewhereRequest>(`/practice-requests/${id}/status`, { status: "REJECTED" }); }
}
export const enrollmentService = new EnrollmentService();
