import type { School, Branch, StaffApplication, StaffApplicationPost } from '../../types/school.types.ts';
import type { Classroom, ClassroomMentor } from '../../types/classroom.types.ts';
import type { ApplicationStatus, Role } from '../../types/common.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface ISchoolService {
  getSchools(params?: { search?: string; status?: string }): Promise<PaginatedData<School>>;
  getSchoolById(id: string): Promise<School>;
  getBranches(schoolId: string): Promise<Branch[]>;
  getAllBranches(): Promise<Branch[]>;
  updateSchool(id: string, data: Partial<School>): Promise<School>;
  createBranch(schoolId: string, data: Partial<Branch>): Promise<Branch>;
  updateBranch(id: string, data: Partial<Branch>): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  getClassrooms(schoolId: string): Promise<Classroom[]>;
  createClassroom(schoolId: string, data: Pick<Classroom, 'name'>): Promise<Classroom>;
  deleteClassroom(id: string): Promise<void>;
  getClassroomMentors(classroomId: string): Promise<ClassroomMentor[]>;
  assignMentor(classroomId: string, mentorId: string): Promise<ClassroomMentor>;
  removeMentor(classroomId: string, mentorId: string): Promise<void>;
  getStaffPosts(schoolId: string): Promise<StaffApplicationPost[]>;
  createStaffPost(schoolId: string, data: Pick<StaffApplicationPost, 'role' | 'description'>): Promise<StaffApplicationPost>;
  updateStaffPost(id: string, data: Partial<StaffApplicationPost>): Promise<StaffApplicationPost>;
  deleteStaffPost(id: string): Promise<void>;
  getStaffApplications(schoolId: string): Promise<StaffApplication[]>;
  updateStaffApplicationStatus(id: string, status: ApplicationStatus): Promise<StaffApplication>;
  assignEducationHead(schoolId: string, userId: string): Promise<void>;
  removeEducationHead(schoolId: string, userId: string): Promise<void>;
  getSchoolStaff(schoolId: string, roles?: Role[]): Promise<string[]>;
}
