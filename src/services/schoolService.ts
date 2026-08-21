import type { ISchoolService } from "./interfaces/ISchoolService.ts";
import type {
  School,
  Branch,
  StaffApplication,
  StaffApplicationPost,
} from "../types/school.types.ts";
import type { Classroom, ClassroomMentor } from "../types/classroom.types.ts";
import type { ApplicationStatus, Role } from "../types/common.types.ts";
import type { PaginatedData } from "../types/common.types.ts";
import {
  mockSchools,
  mockBranches,
  mockClassrooms,
  mockClassroomMentors,
  mockStaffApplications,
  mockStaffPosts,
  mockUsers,
} from "./mockData.ts";
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

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

  async getStaffPosts(schoolId: string): Promise<StaffApplicationPost[]> {
    return delay(
      400,
      mockStaffPosts.filter((post) => post.schoolId === schoolId),
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

  async getStaffApplications(schoolId: string): Promise<StaffApplication[]> {
    const postIds = mockStaffPosts
      .filter((post) => post.schoolId === schoolId)
      .map((post) => post.id);
    return delay(
      400,
      mockStaffApplications.filter((application) =>
        postIds.includes(application.postId),
      ),
    );
  }

  async updateStaffApplicationStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<StaffApplication> {
    const index = mockStaffApplications.findIndex(
      (application) => application.id === id,
    );
    if (index === -1) throw new Error("Staff application not found");
    mockStaffApplications[index] = { ...mockStaffApplications[index], status };
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
}

export const schoolService = new SchoolService();
