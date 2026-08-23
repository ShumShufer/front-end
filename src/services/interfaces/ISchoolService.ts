import type {
  School,
  Branch,
  SchoolAgreement,
  StaffApplication,
  StaffApplicationPost,
  Review,
} from "../../types/school.types.ts";
import type {
  Classroom,
  ClassroomMentor,
} from "../../types/classroom.types.ts";
import type { ApplicationStatus, Role } from "../../types/common.types.ts";
import type { PaginatedData } from "../../types/common.types.ts";
import type { ApplicationFormTemplate } from "../../types/enrollment.types.ts";

export interface ISchoolService {
  getPlatformStats(): Promise<{
    totalActiveSchools: number;
    totalStudentsEnrolled: number;
    avgSchoolRating: number | null;
  }>;
  getSchools(params?: {
    search?: string;
    status?: string;
  }): Promise<PaginatedData<School>>;
  getSchoolById(id: string): Promise<School>;
  getBranches(schoolId: string): Promise<Branch[]>;
  getAllBranches(): Promise<Branch[]>;
  updateSchool(id: string, data: Partial<School>): Promise<School>;
  createSchool(
    data: Pick<School, "name" | "description">,
  ): Promise<School>;
  createBranch(schoolId: string, data: Partial<Branch>): Promise<Branch>;
  updateBranch(id: string, data: Partial<Branch>): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  getClassrooms(schoolId: string): Promise<Classroom[]>;
  createClassroom(
    schoolId: string,
    data: Pick<Classroom, "name">,
  ): Promise<Classroom>;
  deleteClassroom(id: string): Promise<void>;
  getClassroomMentors(classroomId: string): Promise<ClassroomMentor[]>;
  assignMentor(classroomId: string, mentorId: string): Promise<ClassroomMentor>;
  removeMentor(classroomId: string, mentorId: string): Promise<void>;
  getStaffPosts(schoolId?: string): Promise<StaffApplicationPost[]>;
  createStaffPost(
    schoolId: string,
    data: Pick<StaffApplicationPost, "role" | "description">,
  ): Promise<StaffApplicationPost>;
  updateStaffPost(
    id: string,
    data: Partial<StaffApplicationPost>,
  ): Promise<StaffApplicationPost>;
  deleteStaffPost(id: string): Promise<void>;
  getStaffApplications(params?: {
    schoolId?: string;
    applicantId?: string;
  }): Promise<StaffApplication[]>;
  applyToStaffPost(postId: string, applicantId: string): Promise<StaffApplication>;
  updateStaffApplicationStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<StaffApplication>;
  assignEducationHead(schoolId: string, userId: string): Promise<void>;
  removeEducationHead(schoolId: string, userId: string): Promise<void>;
  getSchoolStaff(schoolId: string, roles?: Role[]): Promise<string[]>;

  getAgreements(params?: { schoolId?: string }): Promise<SchoolAgreement[]>;
  proposeAgreement(
    proposerSchoolId: string,
    partnerSchoolId: string,
  ): Promise<SchoolAgreement>;
  respondToAgreement(id: string, accept: boolean): Promise<SchoolAgreement>;
  terminateAgreement(id: string): Promise<SchoolAgreement>;

  getReviews(params?: { schoolId?: string }): Promise<Review[]>;
  addReview(
    schoolId: string,
    studentId: string,
    rating: number,
    comment: string,
  ): Promise<Review>;

  getApplicationForm(
    schoolId: string,
  ): Promise<ApplicationFormTemplate["fields"]>;
  saveApplicationForm(
    schoolId: string,
    fields: ApplicationFormTemplate["fields"],
  ): Promise<ApplicationFormTemplate["fields"]>;
}
