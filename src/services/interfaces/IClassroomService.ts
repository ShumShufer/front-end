import { Classroom, Announcement, ScheduleEvent } from '../../types/classroom.types';

export interface IClassroomService {
  getById(id: string): Promise<Classroom>;
  listForMentor(mentorId: string): Promise<Classroom[]>;
  listForStudent(studentId: string): Promise<Classroom[]>;
  createAnnouncement(classroomId: string, data: any): Promise<Announcement>;
  getSchedule(classroomId: string): Promise<ScheduleEvent[]>;
  markAttendance(classroomId: string, sessionId: string, records: any[]): Promise<void>;
}
