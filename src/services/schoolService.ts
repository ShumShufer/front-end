import type { ISchoolService } from "./interfaces/ISchoolService.ts";
import type {
  School,
  Branch,
  SchoolAgreement,
  StaffApplication,
  StaffApplicationPost,
  Review,
} from "../types/school.types.ts";
import type { Classroom, ClassroomMentor } from "../types/classroom.types.ts";
import type { PaginatedData } from "../types/common.types.ts";
import type { ApplicationFormTemplate } from "../types/enrollment.types.ts";
import {
  ApplicationStatus,
  NotificationTopic,
  Role,
} from "../types/common.types.ts";
import {
  mockSchools,
  mockBranches,
  mockClassrooms,
  mockClassroomMentors,
  mockStaffApplications,
  mockStaffPosts,
  mockUsers,
  mockSchoolAgreements,
  mockReviews,
  mockApplicationFormTemplates,
} from "./mockData.ts";
import { notificationService } from "./notificationService.ts";
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const schoolAdminIds = (schoolId: string): string[] =>
  mockUsers
    .filter((user) => user.role === Role.ADMIN && user.schoolId === schoolId)
    .map((user) => user.id);

class SchoolService implements ISchoolService {
  async getSchools(params?: {
    search?: string;
    status?: string;
  }): Promise<PaginatedData<School>> {
    // return httpClient.get('/schools', { params });
    let filtered = mockSchools;
    if (params?.search) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(params.search!.toLowerCase()),
      );
    }
    if (params?.status) {
      filtered = filtered.filter((s) => s.status === params.status);
    }
    return delay(500, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async getSchoolById(id: string): Promise<School> {
    // return httpClient.get(`/schools/${id}`);
    const school = mockSchools.find((s) => s.id === id);
    if (!school) throw new Error("School not found");
    return delay(500, school);
  }

  async getBranches(schoolId: string): Promise<Branch[]> {
    // return httpClient.get(`/schools/${schoolId}/branches`);
    const branches = mockBranches.filter((b) => b.schoolId === schoolId);
    return delay(400, branches);
  }

  async getAllBranches(): Promise<Branch[]> {
    // return httpClient.get('/branches');
    return delay(400, mockBranches);
  }

  async createSchool(
    data: Pick<School, "name" | "description">,
  ): Promise<School> {
    const school: School = {
      id: `school-${Date.now()}`,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      rating: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    mockSchools.push(school);
    return delay(500, school);
  }

  async updateSchool(id: string, data: Partial<School>): Promise<School> {
    // return httpClient.patch(`/schools/${id}`, data);
    const index = mockSchools.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("School not found");
    mockSchools[index] = { ...mockSchools[index], ...data };
    return delay(600, mockSchools[index]);
  }

  async createBranch(schoolId: string, data: Partial<Branch>): Promise<Branch> {
    // return httpClient.post(`/schools/${schoolId}/branches`, data);
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      schoolId,
      name: data.name ?? "",
      address: data.address ?? "",
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
    };
    mockBranches.push(newBranch);
    return delay(600, newBranch);
  }

  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    const index = mockBranches.findIndex((branch) => branch.id === id);
    if (index === -1) throw new Error("Branch not found");
    mockBranches[index] = { ...mockBranches[index], ...data };
    return delay(450, mockBranches[index]);
  }

  async deleteBranch(id: string): Promise<void> {
    const index = mockBranches.findIndex((branch) => branch.id === id);
    if (index === -1) throw new Error("Branch not found");
    mockBranches.splice(index, 1);
    return delay(450, undefined);
  }

  async getClassrooms(schoolId: string): Promise<Classroom[]> {
    return delay(
      400,
      mockClassrooms.filter((classroom) => classroom.schoolId === schoolId),
    );
  }

  async createClassroom(
    schoolId: string,
    data: Pick<Classroom, "name">,
  ): Promise<Classroom> {
    const classroom: Classroom = {
      id: `classroom-${Date.now()}`,
      schoolId,
      name: data.name.trim(),
      createdAt: new Date().toISOString(),
    };
    mockClassrooms.push(classroom);
    return delay(500, classroom);
  }

  async deleteClassroom(id: string): Promise<void> {
    const index = mockClassrooms.findIndex((classroom) => classroom.id === id);
    if (index === -1) throw new Error("Classroom not found");
    mockClassrooms.splice(index, 1);
    for (
      let mentorIndex = mockClassroomMentors.length - 1;
      mentorIndex >= 0;
      mentorIndex -= 1
    ) {
      if (mockClassroomMentors[mentorIndex].classroomId === id)
        mockClassroomMentors.splice(mentorIndex, 1);
    }
    return delay(450, undefined);
  }

  async getClassroomMentors(classroomId: string): Promise<ClassroomMentor[]> {
    return delay(
      350,
      mockClassroomMentors.filter((link) => link.classroomId === classroomId),
    );
  }

  async assignMentor(
    classroomId: string,
    mentorId: string,
  ): Promise<ClassroomMentor> {
    const classroom = mockClassrooms.find((item) => item.id === classroomId);
    const mentor = mockUsers.find(
      (user) => user.id === mentorId && user.role === "MENTOR",
    );
    if (!classroom || !mentor || mentor.schoolId !== classroom.schoolId)
      throw new Error("Mentor is not available for this classroom");
    const existing = mockClassroomMentors.find(
      (link) => link.classroomId === classroomId && link.mentorId === mentorId,
    );
    if (existing) return delay(350, existing);
    const link = { classroomId, mentorId };
    mockClassroomMentors.push(link);
    return delay(350, link);
  }

  async removeMentor(classroomId: string, mentorId: string): Promise<void> {
    const index = mockClassroomMentors.findIndex(
      (link) => link.classroomId === classroomId && link.mentorId === mentorId,
    );
    if (index === -1) throw new Error("Mentor assignment not found");
    mockClassroomMentors.splice(index, 1);
    return delay(350, undefined);
  }

  async getStaffPosts(schoolId?: string): Promise<StaffApplicationPost[]> {
    return delay(
      400,
      mockStaffPosts.filter((post) => !schoolId || post.schoolId === schoolId),
    );
  }

  async createStaffPost(
    schoolId: string,
    data: Pick<StaffApplicationPost, "role" | "description">,
  ): Promise<StaffApplicationPost> {
    const post: StaffApplicationPost = {
      id: `staff-post-${Date.now()}`,
      schoolId,
      role: data.role,
      description: data.description.trim(),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    mockStaffPosts.push(post);
    return delay(500, post);
  }

  async updateStaffPost(
    id: string,
    data: Partial<StaffApplicationPost>,
  ): Promise<StaffApplicationPost> {
    const index = mockStaffPosts.findIndex((post) => post.id === id);
    if (index === -1) throw new Error("Staff post not found");
    mockStaffPosts[index] = { ...mockStaffPosts[index], ...data };
    return delay(400, mockStaffPosts[index]);
  }

  async deleteStaffPost(id: string): Promise<void> {
    const index = mockStaffPosts.findIndex((post) => post.id === id);
    if (index === -1) throw new Error("Staff post not found");
    mockStaffPosts.splice(index, 1);
    return delay(400, undefined);
  }

  async getStaffApplications(params?: {
    schoolId?: string;
    applicantId?: string;
  }): Promise<StaffApplication[]> {
    let applications = mockStaffApplications;
    if (params?.schoolId) {
      const postIds = mockStaffPosts
        .filter((post) => post.schoolId === params.schoolId)
        .map((post) => post.id);
      applications = applications.filter((application) =>
        postIds.includes(application.postId),
      );
    }
    if (params?.applicantId) {
      applications = applications.filter(
        (application) => application.applicantId === params.applicantId,
      );
    }
    return delay(400, applications);
  }

  async applyToStaffPost(
    postId: string,
    applicantId: string,
  ): Promise<StaffApplication> {
    // return httpClient.post(`/staff-posts/${postId}/applications`, { applicantId });
    const post = mockStaffPosts.find((item) => item.id === postId);
    if (!post || post.status !== "OPEN")
      throw new Error("This opening is no longer accepting applications");
    const alreadyApplied = mockStaffApplications.some(
      (application) =>
        application.postId === postId &&
        application.applicantId === applicantId &&
        (application.status === ApplicationStatus.PENDING ||
          application.status === ApplicationStatus.ACCEPTED),
    );
    if (alreadyApplied)
      throw new Error("You have already applied to this opening");
    const application: StaffApplication = {
      id: `staff-app-${Date.now()}`,
      postId,
      applicantId,
      status: ApplicationStatus.PENDING,
      resumeUrl: null,
      submittedAt: new Date().toISOString(),
    };
    mockStaffApplications.push(application);
    await notificationService.create({
      topic: NotificationTopic.STAFF_POST,
      title: "New staff application",
      body: `${mockUsers.find((user) => user.id === applicantId)?.firstName ?? "A user"} applied for the ${post.role.toLowerCase().replace("_", " ")} opening.`,
      recipientIds: schoolAdminIds(post.schoolId),
      relatedEntityId: application.id,
    });
    return delay(500, application);
  }

  async updateStaffApplicationStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<StaffApplication> {
    const index = mockStaffApplications.findIndex(
      (application) => application.id === id,
    );
    if (index === -1) throw new Error("Staff application not found");
    const application = mockStaffApplications[index];
    if (application.status !== ApplicationStatus.PENDING)
      throw new Error("This application has already been reviewed");
    mockStaffApplications[index] = { ...application, status };
    const post = mockStaffPosts.find((item) => item.id === application.postId);
    if (status === ApplicationStatus.ACCEPTED && post) {
      // Hiring grants the posted role and moves the staff member into the
      // hiring school, which makes them assignable inside that school.
      const applicant = mockUsers.find((user) => user.id === application.applicantId);
      if (applicant) {
        applicant.role = post.role;
        applicant.schoolId = post.schoolId;
        applicant.updatedAt = new Date().toISOString();
      }
    }
    await notificationService.create({
      topic: NotificationTopic.STAFF_POST,
      title:
        status === ApplicationStatus.ACCEPTED
          ? "Application accepted"
          : "Application declined",
      body:
        status === ApplicationStatus.ACCEPTED && post
          ? `Welcome aboard! You have been hired as ${post.role.toLowerCase().replace("_", " ")} at the hiring school.`
          : "Your application was not accepted this time.",
      recipientIds: [application.applicantId],
      relatedEntityId: id,
    });
    return delay(400, mockStaffApplications[index]);
  }

  async assignEducationHead(schoolId: string, userId: string): Promise<void> {
    const user = mockUsers.find((item) => item.id === userId);
    if (!user) throw new Error("Staff member not found");
    user.role = "EDUCATION_HEAD";
    user.schoolId = schoolId;
    user.updatedAt = new Date().toISOString();
    return delay(400, undefined);
  }

  async removeEducationHead(schoolId: string, userId: string): Promise<void> {
    const user = mockUsers.find(
      (item) => item.id === userId && item.schoolId === schoolId,
    );
    if (!user) throw new Error("Education head not found");
    user.role = "MENTOR";
    user.updatedAt = new Date().toISOString();
    return delay(400, undefined);
  }

  async getSchoolStaff(schoolId: string, roles?: Role[]): Promise<string[]> {
    return delay(
      350,
      mockUsers
        .filter(
          (user) =>
            user.schoolId === schoolId && (!roles || roles.includes(user.role)),
        )
        .map((user) => user.id),
    );
  }

  async getAgreements(params?: {
    schoolId?: string;
  }): Promise<SchoolAgreement[]> {
    let filtered = mockSchoolAgreements;
    if (params?.schoolId) {
      filtered = filtered.filter(
        (a) => a.schoolAId === params.schoolId || a.schoolBId === params.schoolId,
      );
    }
    return delay(400, filtered);
  }

  async proposeAgreement(
    proposerSchoolId: string,
    partnerSchoolId: string,
  ): Promise<SchoolAgreement> {
    if (proposerSchoolId === partnerSchoolId)
      throw new Error("A school cannot form an agreement with itself");
    const agreement: SchoolAgreement = {
      id: `agreement-${Date.now()}`,
      schoolAId: proposerSchoolId,
      schoolBId: partnerSchoolId,
      status: "PENDING",
      feeSplit: null,
      createdAt: new Date().toISOString(),
    };
    mockSchoolAgreements.push(agreement);
    return delay(600, agreement);
  }

  async respondToAgreement(
    id: string,
    accept: boolean,
  ): Promise<SchoolAgreement> {
    const index = mockSchoolAgreements.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Agreement not found");
    if (mockSchoolAgreements[index].status !== "PENDING")
      throw new Error("Only pending agreements can be responded to");
    mockSchoolAgreements[index] = {
      ...mockSchoolAgreements[index],
      // Even split is the default commission arrangement on acceptance.
      feeSplit: accept ? { schoolA: 0.5, schoolB: 0.5 } : null,
      status: accept ? "ACTIVE" : "TERMINATED",
    };
    return delay(500, mockSchoolAgreements[index]);
  }

  async terminateAgreement(id: string): Promise<SchoolAgreement> {
    const index = mockSchoolAgreements.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Agreement not found");
    mockSchoolAgreements[index] = {
      ...mockSchoolAgreements[index],
      status: "TERMINATED",
    };
    return delay(500, mockSchoolAgreements[index]);
  }

  async getReviews(params?: { schoolId?: string }): Promise<Review[]> {
    let filtered = mockReviews;
    if (params?.schoolId)
      filtered = filtered.filter((r) => r.schoolId === params.schoolId);
    return delay(
      400,
      [...filtered].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    );
  }

  async addReview(
    schoolId: string,
    studentId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    const review: Review = {
      id: `review-${Date.now()}`,
      schoolId,
      studentId,
      rating,
      comment: comment || null,
      createdAt: new Date().toISOString(),
    };
    mockReviews.push(review);
    // Keep the school's aggregate rating roughly in sync with reviews.
    const school = mockSchools.find((s) => s.id === schoolId);
    if (school) {
      const schoolReviews = mockReviews.filter((r) => r.schoolId === schoolId);
      const average =
        schoolReviews.reduce((sum, r) => sum + r.rating, 0) /
        schoolReviews.length;
      school.rating = Math.round(average * 10) / 10;
    }
    return delay(600, review);
  }

  async getApplicationForm(schoolId: string): Promise<ApplicationFormTemplate["fields"]> {
    const template = mockApplicationFormTemplates.find(
      (t) => t.schoolId === schoolId,
    );
    return delay(400, template ? template.fields : []);
  }

  async saveApplicationForm(
    schoolId: string,
    fields: ApplicationFormTemplate["fields"],
  ): Promise<ApplicationFormTemplate["fields"]> {
    const index = mockApplicationFormTemplates.findIndex(
      (t) => t.schoolId === schoolId,
    );
    if (index > -1) {
      mockApplicationFormTemplates[index] = {
        ...mockApplicationFormTemplates[index],
        fields,
      };
    } else {
      mockApplicationFormTemplates.push({
        id: `form-template-${Date.now()}`,
        schoolId,
        fields,
      });
    }
    return delay(500, fields);
  }
}

export const schoolService = new SchoolService();
