import { ICourseService } from '../interfaces/ICourseService';
import { Course, Topic } from '../../types/course.types';

export const mockCourseService: ICourseService = {
  async getById(id: string): Promise<Course> {
    return {
      id,
      classroomId: '1',
      name: 'Mock Course',
      topicIds: [],
      price: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async listByClassroom(_classroomId: string): Promise<Course[]> {
    return [];
  },

  async create(data: any): Promise<Course> {
    return {
      id: '1',
      classroomId: data.classroomId,
      name: data.name,
      topicIds: [],
      price: data.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async update(id: string, data: any): Promise<Course> {
    return {
      id,
      classroomId: data.classroomId ?? '',
      name: data.name ?? '',
      topicIds: [],
      price: data.price ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async delete(_id: string): Promise<void> {
    // Mock implementation
  },

  async getTopics(_courseId: string): Promise<Topic[]> {
    return [];
  },

  async getTopic(topicId: string): Promise<Topic> {
    return {
      id: topicId,
      courseId: '1',
      title: 'Mock Topic',
      order: 1,
      mandatory: true,
      createdAt: new Date(),
    };
  },
};
