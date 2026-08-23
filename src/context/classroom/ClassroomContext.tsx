import { createContext } from "react";
import type {
  Classroom,
  Announcement,
  Resource,
  ScheduleEvent,
  AttendanceRecord,
  AttendanceSession,
} from "../../types/classroom.types.ts";
import type { User } from "../../types/user.types.ts";

export interface ClassroomState {
  classrooms: Classroom[];
  activeClassroom: Classroom | null;
  students: User[];
  announcements: Announcement[];
  resources: Resource[];
  schedules: ScheduleEvent[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
}

export interface ClassroomContextType extends ClassroomState {
  loadMentorClassrooms: (mentorId: string) => Promise<void>;
  loadStudentClassrooms: (studentId: string) => Promise<void>;
  loadClassroomById: (id: string) => Promise<void>;
  loadStudents: (classroomId: string) => Promise<void>;
  postAnnouncement: (
    classroomId: string,
    data: Partial<Announcement>,
  ) => Promise<void>;
  loadAnnouncements: (classroomId: string) => Promise<void>;
  loadSchoolAnnouncements: (schoolId: string) => Promise<void>;
  broadcastSchoolAnnouncement: (
    schoolId: string,
    data: { title: string; body: string; authorId: string },
  ) => Promise<void>;
  loadPlatformAnnouncements: () => Promise<void>;
  broadcastPlatformAnnouncement: (
    data: { title: string; body: string; authorId: string },
  ) => Promise<void>;
  loadResources: (classroomId: string) => Promise<void>;
  uploadResource: (
    classroomId: string,
    data: Partial<Resource>,
  ) => Promise<void>;
  loadSchedules: (classroomId: string) => Promise<void>;
  loadAttendance: (classroomId: string) => Promise<void>;
  openAttendanceSession: (classroomId: string, date: string) => Promise<void>;
  submitAttendance: (
    classroomId: string,
    sessionId: string,
    records: AttendanceRecord[],
  ) => Promise<void>;
  reportIssue: (
    classroomId: string,
    studentId: string,
    note: string,
  ) => Promise<void>;
}

export const ClassroomContext = createContext<ClassroomContextType | null>(
  null,
);
