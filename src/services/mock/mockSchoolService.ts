import { ISchoolService } from '../interfaces/ISchoolService';
import { School, Branch } from '../../types/school.types';

export const mockSchoolService: ISchoolService = {
  async list(): Promise<School[]> {
    return [];
  },

  async getById(id: string): Promise<School> {
    return {
      id,
      name: 'Mock School',
      location: 'Addis Ababa',
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async create(data: any): Promise<School> {
    return {
      id: '1',
      name: data.name,
      location: data.location,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async update(id: string, data: any): Promise<School> {
    return {
      id,
      name: data.name,
      location: data.location,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async delete(_id: string): Promise<void> {
    // Mock implementation
  },

  async getBranches(_schoolId: string): Promise<Branch[]> {
    return [];
  },
};
