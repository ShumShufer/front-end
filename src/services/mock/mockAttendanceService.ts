import { IAttendanceService } from '../interfaces/IAttendanceService';

export const mockAttendanceService: IAttendanceService = {
  async getAttendanceHistory(_studentId: string, _classroomId: string): Promise<any[]> {
    return [];
  },

  async markAttendance(_classroomId: string, _sessionId: string, _records: any[]): Promise<void> {
    // Mock implementation
  },
};
