import type { Role, ScheduleScope } from './common.types.ts';

export interface Classroom {
  id: string;
  schoolId: string;
  name: string;
  createdAt: string;
}

export interface ClassroomMentor {
  classroomId: string;
  mentorId: string;
}

export interface Resource {
  id: string;
  classroomId?: string | null;
  topicId?: string | null;
  title: string;
  type: string; // PDF | PPT | VIDEO | LINK
  url: string;
  mandatory: boolean;
  uploadedAt: string;
}

export interface AttendanceSession {
  id: string;
  classroomId: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: string; // PRESENT | ABSENT | LATE | EXCUSED
}

export interface StudentReport {
  id: string;
  classroomId: string;
  reportedById: string;
  reportedStudentId: string;
  note: string;
  createdAt: string;
}

export interface ScheduleEvent {
  id: string;
  schoolId?: string | null;
  classroomId?: string | null;
  scope: ScheduleScope;
  createdByRole: Role;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
}

export interface Announcement {
  id: string;
  schoolId?: string | null;
  classroomId?: string | null;
  authorId: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
}
