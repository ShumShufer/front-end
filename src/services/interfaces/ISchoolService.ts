import { School, Branch } from '../../types/school.types';
import { PaginationParams } from '../../types/common.types';

export interface ISchoolService {
  list(params?: PaginationParams): Promise<School[]>;
  getById(id: string): Promise<School>;
  create(data: any): Promise<School>;
  update(id: string, data: any): Promise<School>;
  delete(id: string): Promise<void>;
  getBranches(schoolId: string): Promise<Branch[]>;
}
