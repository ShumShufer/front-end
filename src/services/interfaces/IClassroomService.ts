import type {
  Classroom,
  Announcement,
  Resource,
  ScheduleEvent,
  AttendanceRecord,
} from '../../types/classroom.types.ts';
import type { User } from '../../types/user.types.ts';

export interface IClassroomService {
  getById(id: string): Promise<Classroom>;
  listForMentor(mentorId: string): Promise<Classroom[]>;
  listForStudent(studentId: string): Promise<Classroom[]>;
  getStudents(classroomId: string): Promise<User[]>;
  getAnnouncements(classroomId: string): Promise<Announcement[]>;
  createAnnouncement(classroomId: string, data: Partial<Announcement>): Promise<Announcement>;
  getResources(classroomId: string): Promise<Resource[]>;
  getSchedule(classroomId: string): Promise<ScheduleEvent[]>;
  markAttendance(
    classroomId: string,
    sessionId: string,
    records: AttendanceRecord[],
  ): Promise<void>;
  reportStudent(classroomId: string, studentId: string, note: string): Promise<void>;
}
