import { createContext } from 'react';
import type { Classroom, Announcement, ScheduleEvent, AttendanceRecord } from '../../types/classroom.types.ts';

export interface ClassroomState {
  classrooms: Classroom[];
  activeClassroom: Classroom | null;
  announcements: Announcement[];
  schedules: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;
}

export interface ClassroomContextType extends ClassroomState {
  loadMentorClassrooms: (mentorId: string) => Promise<void>;
  loadStudentClassrooms: (studentId: string) => Promise<void>;
  loadClassroomById: (id: string) => Promise<void>;
  postAnnouncement: (classroomId: string, data: Partial<Announcement>) => Promise<void>;
  loadSchedules: (classroomId: string) => Promise<void>;
  submitAttendance: (classroomId: string, sessionId: string, records: AttendanceRecord[]) => Promise<void>;
  reportIssue: (classroomId: string, studentId: string, note: string) => Promise<void>;
}

export const ClassroomContext = createContext<ClassroomContextType | null>(null);
