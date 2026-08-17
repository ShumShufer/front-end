import { createContext } from 'react';
import type { School, Branch } from '../../types/school.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface SchoolState {
  schools: PaginatedData<School> | null;
  activeSchool: School | null;
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
}

export interface SchoolContextType extends SchoolState {
  loadSchools: (params?: { search?: string; status?: string }) => Promise<void>;
  loadSchoolById: (id: string) => Promise<void>;
  loadBranches: (schoolId: string) => Promise<void>;
  updateSchoolInfo: (id: string, data: Partial<School>) => Promise<void>;
  addBranch: (schoolId: string, data: Partial<Branch>) => Promise<void>;
}

export const SchoolContext = createContext<SchoolContextType | null>(null);
