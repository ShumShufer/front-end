import type { School, Branch } from '../../types/school.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface ISchoolService {
  getSchools(params?: { search?: string; status?: string }): Promise<PaginatedData<School>>;
  getSchoolById(id: string): Promise<School>;
  getBranches(schoolId: string): Promise<Branch[]>;
  updateSchool(id: string, data: Partial<School>): Promise<School>;
  createBranch(schoolId: string, data: Partial<Branch>): Promise<Branch>;
}
