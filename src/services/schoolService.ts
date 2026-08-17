import type { ISchoolService } from './interfaces/ISchoolService.ts';
import type { School, Branch } from '../types/school.types.ts';
import type { PaginatedData } from '../types/common.types.ts';
import { mockSchools, mockBranches } from './mockData.ts';
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class SchoolService implements ISchoolService {
  async getSchools(params?: { search?: string; status?: string }): Promise<PaginatedData<School>> {
    // return httpClient.get('/schools', { params });
    let filtered = mockSchools;
    if (params?.search) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(params.search!.toLowerCase()),
      );
    }
    if (params?.status) {
      filtered = filtered.filter(s => s.status === params.status);
    }
    return delay(500, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async getSchoolById(id: string): Promise<School> {
    // return httpClient.get(`/schools/${id}`);
    const school = mockSchools.find(s => s.id === id);
    if (!school) throw new Error('School not found');
    return delay(500, school);
  }

  async getBranches(schoolId: string): Promise<Branch[]> {
    // return httpClient.get(`/schools/${schoolId}/branches`);
    const branches = mockBranches.filter(b => b.schoolId === schoolId);
    return delay(400, branches);
  }

  async updateSchool(id: string, data: Partial<School>): Promise<School> {
    // return httpClient.patch(`/schools/${id}`, data);
    const index = mockSchools.findIndex(s => s.id === id);
    if (index === -1) throw new Error('School not found');
    mockSchools[index] = { ...mockSchools[index], ...data };
    return delay(600, mockSchools[index]);
  }

  async createBranch(schoolId: string, data: Partial<Branch>): Promise<Branch> {
    // return httpClient.post(`/schools/${schoolId}/branches`, data);
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      schoolId,
      name: data.name ?? '',
      address: data.address ?? '',
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
    };
    mockBranches.push(newBranch);
    return delay(600, newBranch);
  }
}

export const schoolService = new SchoolService();
