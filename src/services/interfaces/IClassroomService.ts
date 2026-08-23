import type {
  Classroom,
  Announcement,
  Resource,
  ScheduleEvent,
  AttendanceRecord,
  AttendanceSession,
} from "../../types/classroom.types.ts";
import type { User } from "../../types/user.types.ts";

export interface AttendanceSheet {
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
}

export interface IClassroomService {
  getById(id: string): Promise<Classroom>;
  listForMentor(mentorId: string): Promise<Classroom[]>;
  listForStudent(studentId: string): Promise<Classroom[]>;
  getStudents(classroomId: string): Promise<User[]>;
  getAnnouncements(classroomId: string): Promise<Announcement[]>;
  createAnnouncement(
    classroomId: string,
    data: Partial<Announcement>,
  ): Promise<Announcement>;
  getResources(classroomId: string): Promise<Resource[]>;
  uploadResource(
    classroomId: string,
    data: Partial<Resource>,
  ): Promise<Resource>;
  getSchedule(classroomId: string): Promise<ScheduleEvent[]>;
  getAttendance(classroomId: string): Promise<AttendanceSheet>;
  createAttendanceSession(
    classroomId: string,
    date: string,
  ): Promise<AttendanceSession>;
  markAttendance(
    classroomId: string,
    sessionId: string,
    records: AttendanceRecord[],
  ): Promise<void>;
  reportStudent(
    classroomId: string,
    studentId: string,
    note: string,
  ): Promise<void>;
  getSchoolAnnouncements(schoolId: string): Promise<Announcement[]>;
  broadcastSchoolAnnouncement(
    schoolId: string,
    data: { title: string; body: string; authorId: string },
  ): Promise<void>;
  getPlatformAnnouncements(): Promise<Announcement[]>;
  broadcastPlatformAnnouncement(
    data: { title: string; body: string; authorId: string },
  ): Promise<void>;
}
