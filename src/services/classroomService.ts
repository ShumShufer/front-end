import type { IClassroomService, AttendanceSheet } from "./interfaces/IClassroomService.ts";
import type {
  Classroom,
  Announcement,
  Resource,
  ScheduleEvent,
  AttendanceRecord,
  AttendanceSession,
  StudentReport,
} from "../types/classroom.types.ts";
import type { User } from "../types/user.types.ts";
import { ApplicationStatus, Role } from "../types/common.types.ts";
import {
  mockClassrooms,
  mockAnnouncements,
  mockResources,
  mockScheduleEvents,
  mockUsers,
  mockClassroomMentors,
  mockEnrollments,
  mockAttendanceSessions,
  mockAttendanceRecords,
  mockStudentReports,
} from "./mockData.ts";

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class ClassroomService implements IClassroomService {
  async getById(id: string): Promise<Classroom> {
    const classroom = mockClassrooms.find((c) => c.id === id);
    if (!classroom) throw new Error("Classroom not found");
    return delay(400, classroom);
  }

  async listForMentor(mentorId: string): Promise<Classroom[]> {
    const classroomIds = mockClassroomMentors
      .filter((link) => link.mentorId === mentorId)
      .map((link) => link.classroomId);
    const filtered = mockClassrooms.filter((c) => classroomIds.includes(c.id));
    return delay(500, filtered);
  }

  async listForStudent(studentId: string): Promise<Classroom[]> {
    const classroomIds = mockEnrollments
      .filter(
        (e) =>
          e.studentId === studentId &&
          e.status === ApplicationStatus.ACCEPTED &&
          e.classroomId !== null &&
          e.classroomId !== undefined,
      )
      .map((e) => e.classroomId as string);
    const filtered = mockClassrooms.filter((c) => classroomIds.includes(c.id));
    return delay(500, filtered);
  }

  async getStudents(classroomId: string): Promise<User[]> {
    const classroom = mockClassrooms.find((c) => c.id === classroomId);
    if (!classroom) throw new Error("Classroom not found");

    const studentIds = mockEnrollments
      .filter(
        (e) =>
          e.classroomId === classroomId &&
          e.status === ApplicationStatus.ACCEPTED,
      )
      .map((e) => e.studentId);

    const students = mockUsers.filter(
      (u) => u.role === Role.STUDENT && studentIds.includes(u.id),
    );
    return delay(500, students);
  }

  async getAnnouncements(classroomId: string): Promise<Announcement[]> {
    const filtered = mockAnnouncements.filter(
      (a) => a.classroomId === classroomId,
    );
    return delay(500, filtered);
  }

  async createAnnouncement(
    classroomId: string,
    data: Partial<Announcement>,
  ): Promise<Announcement> {
    const newAnnouncement: Announcement = {
      id: `announcement-${Date.now()}`,
      classroomId,
      authorId: data.authorId ?? "user-3",
      title: data.title ?? "",
      body: data.body ?? "",
      audience: data.audience ?? "ALL",
      createdAt: new Date().toISOString(),
    };
    mockAnnouncements.push(newAnnouncement);
    return delay(600, newAnnouncement);
  }

  async getResources(classroomId: string): Promise<Resource[]> {
    const filtered = mockResources.filter((r) => r.classroomId === classroomId);
    return delay(500, filtered);
  }

  async uploadResource(
    classroomId: string,
    data: Partial<Resource>,
  ): Promise<Resource> {
    const resource: Resource = {
      id: `resource-${Date.now()}`,
      classroomId,
      topicId: data.topicId ?? null,
      title: data.title ?? "",
      type: data.type ?? "LINK",
      url: data.url ?? "",
      mandatory: data.mandatory ?? false,
      uploadedAt: new Date().toISOString(),
    };
    mockResources.push(resource);
    return delay(600, resource);
  }

  async getSchedule(classroomId: string): Promise<ScheduleEvent[]> {
    const filtered = mockScheduleEvents.filter(
      (e) => e.classroomId === classroomId,
    );
    return delay(500, filtered);
  }

  async getAttendance(classroomId: string): Promise<AttendanceSheet> {
    const sessions = mockAttendanceSessions.filter(
      (s) => s.classroomId === classroomId,
    );
    const sessionIds = sessions.map((s) => s.id);
    const records = mockAttendanceRecords.filter((r) =>
      sessionIds.includes(r.sessionId),
    );
    return delay(500, { sessions, records });
  }

  async createAttendanceSession(
    classroomId: string,
    date: string,
  ): Promise<AttendanceSession> {
    const existing = mockAttendanceSessions.find(
      (s) => s.classroomId === classroomId && s.date === date,
    );
    if (existing) throw new Error("A session for this date already exists");
    const session: AttendanceSession = {
      id: `session-${Date.now()}`,
      classroomId,
      date,
    };
    mockAttendanceSessions.push(session);
    return delay(600, session);
  }

  async markAttendance(
    classroomId: string,
    sessionId: string,
    records: AttendanceRecord[],
  ): Promise<void> {
    const session = mockAttendanceSessions.find(
      (s) => s.id === sessionId && s.classroomId === classroomId,
    );
    if (!session) throw new Error("Attendance session not found");

    for (const record of records) {
      const existingIndex = mockAttendanceRecords.findIndex(
        (r) => r.sessionId === sessionId && r.studentId === record.studentId,
      );

      if (existingIndex >= 0) {
        mockAttendanceRecords[existingIndex] = {
          ...mockAttendanceRecords[existingIndex],
          status: record.status,
        };
      } else {
        mockAttendanceRecords.push({
          id: record.id || `att-${Date.now()}-${record.studentId}`,
          sessionId,
          studentId: record.studentId,
          status: record.status,
        });
      }
    }

    return delay(500, undefined);
  }

  async reportStudent(
    classroomId: string,
    studentId: string,
    note: string,
  ): Promise<void> {
    const classroom = mockClassrooms.find((c) => c.id === classroomId);
    if (!classroom) throw new Error("Classroom not found");

    const student = mockUsers.find((u) => u.id === studentId);
    if (!student) throw new Error("Student not found");

    const mentorLink = mockClassroomMentors.find(
      (link) => link.classroomId === classroomId,
    );
    const reportedById = mentorLink?.mentorId ?? "user-3";

    const report: StudentReport = {
      id: `report-${Date.now()}`,
      classroomId,
      reportedById,
      reportedStudentId: studentId,
      note,
      createdAt: new Date().toISOString(),
    };
    mockStudentReports.push(report);
    return delay(500, undefined);
  }

  async getSchoolAnnouncements(schoolId: string): Promise<Announcement[]> {
    const classroomIds = mockClassrooms
      .filter((c) => c.schoolId === schoolId)
      .map((c) => c.id);
    const announcements = mockAnnouncements.filter(
      (a) => a.classroomId && classroomIds.includes(a.classroomId),
    );
    return delay(500, [...announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async broadcastSchoolAnnouncement(
    schoolId: string,
    data: { title: string; body: string; authorId: string },
  ): Promise<void> {
    const classrooms = mockClassrooms.filter((c) => c.schoolId === schoolId);
    if (classrooms.length === 0) throw new Error("No classrooms to announce to");
    const now = new Date().toISOString();
    classrooms.forEach((classroom, index) => {
      mockAnnouncements.push({
        id: `ann-${Date.now()}-${index}`,
        schoolId,
        classroomId: classroom.id,
        authorId: data.authorId,
        title: data.title,
        body: data.body,
        audience: "ALL",
        createdAt: now,
      });
    });
    return delay(600, undefined);
  }

  async getPlatformAnnouncements(): Promise<Announcement[]> {
    const announcements = mockAnnouncements.filter(
      (a) => a.classroomId === null && a.schoolId === null,
    );
    return delay(
      400,
      [...announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  async broadcastPlatformAnnouncement(data: {
    title: string;
    body: string;
    authorId: string;
  }): Promise<void> {
    mockAnnouncements.push({
      id: `ann-${Date.now()}`,
      schoolId: null,
      classroomId: null,
      authorId: data.authorId,
      title: data.title,
      body: data.body,
      audience: "PLATFORM",
      createdAt: new Date().toISOString(),
    });
    return delay(500, undefined);
  }
}

export const classroomService = new ClassroomService();
