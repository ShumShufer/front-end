import type { ISchoolService } from "./interfaces/ISchoolService.ts";
import type { School, Branch, SchoolAgreement, StaffApplication, StaffApplicationPost, Review } from "../types/school.types.ts";
import type { Classroom, ClassroomMentor } from "../types/classroom.types.ts";
import type { ApplicationStatus, PaginatedData, Role } from "../types/common.types.ts";
import type { ApplicationFormTemplate } from "../types/enrollment.types.ts";
import httpClient from "./api/httpClient.ts";

type SchoolsResponse = { schools: School[]; meta: PaginatedData<School>["meta"] };

class SchoolService implements ISchoolService {
  async getPlatformStats(): Promise<{
    totalActiveSchools: number;
    totalStudentsEnrolled: number;
    avgSchoolRating: number | null;
  }> {
    return httpClient.get("/stats/platform");
  }
  async getSchools(params?: { search?: string; status?: string }): Promise<PaginatedData<School>> { const response = await httpClient.get<SchoolsResponse, SchoolsResponse>("/schools", { params }); return { data: response.schools ?? [], meta: response.meta }; }
  async getSchoolById(id: string): Promise<School> { return httpClient.get<School, School>(`/schools/${id}`); }
  async getBranches(schoolId: string): Promise<Branch[]> { return httpClient.get<Branch[], Branch[]>(`/schools/${schoolId}/branches`); }
  async getAllBranches(): Promise<Branch[]> { return httpClient.get<Branch[], Branch[]>("/branches"); }
  async updateSchool(id: string, data: Partial<School>): Promise<School> { return httpClient.patch<School, School>(`/schools/${id}`, data); }
  async createSchool(data: Pick<School, "name" | "description">): Promise<School> { return httpClient.post<School, School>("/schools", data); }
  async createBranch(schoolId: string, data: Partial<Branch>): Promise<Branch> { return httpClient.post<Branch, Branch>(`/schools/${schoolId}/branches`, data); }
  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> { return httpClient.patch<Branch, Branch>(`/branches/${id}`, data); }
  async deleteBranch(id: string): Promise<void> { await httpClient.delete<void, void>(`/branches/${id}`); }
  async getClassrooms(schoolId: string): Promise<Classroom[]> { void schoolId; return httpClient.get<Classroom[], Classroom[]>("/classrooms"); }
  async createClassroom(schoolId: string, data: Pick<Classroom, "name">): Promise<Classroom> { return httpClient.post<Classroom, Classroom>("/classrooms", { ...data, schoolId }); }
  async deleteClassroom(id: string): Promise<void> { await httpClient.delete<void, void>(`/classrooms/${id}`); }
  async getClassroomMentors(classroomId: string): Promise<ClassroomMentor[]> { return httpClient.get<ClassroomMentor[], ClassroomMentor[]>(`/classrooms/${classroomId}/mentors`); }
  async assignMentor(classroomId: string, mentorId: string): Promise<ClassroomMentor> { return httpClient.post<ClassroomMentor, ClassroomMentor>(`/classrooms/${classroomId}/mentors`, { mentorId }); }
  async removeMentor(classroomId: string, mentorId: string): Promise<void> { await httpClient.delete<void, void>(`/classrooms/${classroomId}/mentors/${mentorId}`); }
  async getStaffPosts(schoolId?: string): Promise<StaffApplicationPost[]> {
    type PostsResponse = { posts: StaffApplicationPost[] | undefined };
    if (schoolId) {
      const response = await httpClient.get<PostsResponse, PostsResponse>(`/schools/${schoolId}/staff-posts`);
      return response.posts ?? [];
    }
    const response = await httpClient.get<PostsResponse, PostsResponse>("/staff-posts");
    return response.posts ?? [];
  }
  async createStaffPost(schoolId: string, data: Pick<StaffApplicationPost, "role" | "description">): Promise<StaffApplicationPost> { return httpClient.post<StaffApplicationPost, StaffApplicationPost>(`/schools/${schoolId}/staff-posts`, data); }
  async updateStaffPost(id: string, data: Partial<StaffApplicationPost>): Promise<StaffApplicationPost> { return httpClient.patch<StaffApplicationPost, StaffApplicationPost>(`/staff-posts/${id}`, data); }
  async deleteStaffPost(id: string): Promise<void> { await httpClient.delete<void, void>(`/staff-posts/${id}`); }
  async getStaffApplications(params?: { schoolId?: string; applicantId?: string }): Promise<StaffApplication[]> { if (!params?.schoolId) return []; return httpClient.get<StaffApplication[], StaffApplication[]>(`/schools/${params.schoolId}/staff-applications`, { params }); }
  async applyToStaffPost(postId: string, applicantId: string): Promise<StaffApplication> { void applicantId; return httpClient.post<StaffApplication, StaffApplication>(`/staff-posts/${postId}/apply`); }
  async updateStaffApplicationStatus(id: string, status: ApplicationStatus): Promise<StaffApplication> { return httpClient.patch<StaffApplication, StaffApplication>(`/staff-applications/${id}/${status === "ACCEPTED" ? "accept" : "reject"}`); }
  async assignEducationHead(schoolId: string, userId: string): Promise<void> { await httpClient.patch<void, void>(`/users/${userId}/assign-role`, { role: "EDUCATION_HEAD", schoolId }); }
  async removeEducationHead(_schoolId: string, userId: string): Promise<void> { await httpClient.patch<void, void>(`/users/${userId}/assign-role`, { role: "MENTOR" }); }
  async getSchoolStaff(_schoolId: string, roles?: Role[]): Promise<string[]> { const response = await httpClient.get<{ users: Array<{ id: string }> }, { users: Array<{ id: string }> }>("/users", { params: { roles } }); return response.users.map((user) => user.id); }
  async getAgreements(params?: { schoolId?: string }): Promise<SchoolAgreement[]> { return httpClient.get<SchoolAgreement[], SchoolAgreement[]>("/agreements", { params }); }
  async proposeAgreement(_proposerSchoolId: string, partnerSchoolId: string): Promise<SchoolAgreement> { return httpClient.post<SchoolAgreement, SchoolAgreement>("/agreements", { partnerSchoolId, feeSplit: { homeSchoolPercent: 50, hostSchoolPercent: 50 } }); }
  async respondToAgreement(id: string, accept: boolean): Promise<SchoolAgreement> { return httpClient.patch<SchoolAgreement, SchoolAgreement>(`/agreements/${id}/status`, { status: accept ? "ACCEPTED" : "REJECTED" }); }
  async terminateAgreement(id: string): Promise<SchoolAgreement> { return httpClient.patch<SchoolAgreement, SchoolAgreement>(`/agreements/${id}/status`, { status: "REJECTED" }); }
  async getReviews(params?: { schoolId?: string }): Promise<Review[]> { return httpClient.get<Review[], Review[]>(`/schools/${params?.schoolId}/reviews`); }
  async addReview(schoolId: string, _studentId: string, rating: number, comment: string): Promise<Review> { return httpClient.post<Review, Review>(`/schools/${schoolId}/reviews`, { rating, comment }); }
  async getApplicationForm(schoolId: string): Promise<ApplicationFormTemplate["fields"]> { const response = await httpClient.get<ApplicationFormTemplate, ApplicationFormTemplate>(`/schools/${schoolId}/application-form`); return response.fields; }
  async saveApplicationForm(schoolId: string, fields: ApplicationFormTemplate["fields"]): Promise<ApplicationFormTemplate["fields"]> { const response = await httpClient.put<ApplicationFormTemplate, ApplicationFormTemplate>(`/schools/${schoolId}/application-form`, { fields }); return response.fields; }
}
export const schoolService = new SchoolService();
