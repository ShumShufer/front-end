import { createContext } from "react";
import type {
  School,
  Branch,
  StaffApplication,
  StaffApplicationPost,
} from "../../types/school.types.ts";
import type {
  Classroom,
  ClassroomMentor,
} from "../../types/classroom.types.ts";
import type { ApplicationStatus, Role } from "../../types/common.types.ts";
import type { PaginatedData } from "../../types/common.types.ts";

export interface SchoolState {
  schools: PaginatedData<School> | null;
  activeSchool: School | null;
  branches: Branch[];
  classrooms: Classroom[];
  classroomMentors: ClassroomMentor[];
  staffPosts: StaffApplicationPost[];
  staffApplications: StaffApplication[];
  isLoading: boolean;
  error: string | null;
}

export interface SchoolContextType extends SchoolState {
  loadSchools: (params?: { search?: string; status?: string }) => Promise<void>;
  loadSchoolById: (id: string) => Promise<void>;
  loadBranches: (schoolId?: string) => Promise<void>;
  updateSchoolInfo: (id: string, data: Partial<School>) => Promise<void>;
  addBranch: (schoolId: string, data: Partial<Branch>) => Promise<void>;
  editBranch: (id: string, data: Partial<Branch>) => Promise<void>;
  removeBranch: (id: string) => Promise<void>;
  loadClassrooms: (schoolId: string) => Promise<void>;
  addClassroom: (schoolId: string, name: string) => Promise<void>;
  removeClassroom: (id: string) => Promise<void>;
  loadClassroomMentors: (classroomId: string) => Promise<void>;
  assignClassroomMentor: (
    classroomId: string,
    mentorId: string,
  ) => Promise<void>;
  removeClassroomMentor: (
    classroomId: string,
    mentorId: string,
  ) => Promise<void>;
  loadStaffPosts: (schoolId: string) => Promise<void>;
  addStaffPost: (
    schoolId: string,
    role: Role,
    description: string,
  ) => Promise<void>;
  updateStaffPost: (
    id: string,
    data: Partial<StaffApplicationPost>,
  ) => Promise<void>;
  removeStaffPost: (id: string) => Promise<void>;
  loadStaffApplications: (schoolId: string) => Promise<void>;
  updateStaffApplication: (
    id: string,
    status: ApplicationStatus,
  ) => Promise<void>;
  assignEducationHead: (schoolId: string, userId: string) => Promise<void>;
  removeEducationHead: (schoolId: string, userId: string) => Promise<void>;
}

export const SchoolContext = createContext<SchoolContextType | null>(null);
