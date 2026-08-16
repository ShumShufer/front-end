import { IClassroomService } from '../interfaces/IClassroomService';
import { Classroom, Announcement, ScheduleEvent } from '../../types/classroom.types';

export const mockClassroomService: IClassroomService = {
  async getById(id: string): Promise<Classroom> {
    return {
      id,
      schoolId: '1',
      name: 'Mock Classroom',
      mentorId: '1',
      studentIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async listForMentor(_mentorId: string): Promise<Classroom[]> {
    return [];
  },

  async listForStudent(_studentId: string): Promise<Classroom[]> {
    return [];
  },

  async createAnnouncement(classroomId: string, data: any): Promise<Announcement> {
    return {
      id: '1',
      classroomId,
      title: data.title,
      content: data.content,
      createdAt: new Date(),
    };
  },

  async getSchedule(_classroomId: string): Promise<ScheduleEvent[]> {
    return [];
  },

  async markAttendance(_classroomId: string, _sessionId: string, _records: any[]): Promise<void> {
    // Mock implementation
  },
};
