import type { IClassroomService } from "./interfaces/IClassroomService.ts";
import type {
  Classroom,
  Announcement,
  Resource,
  ScheduleEvent,
  AttendanceRecord,
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

  async getSchedule(classroomId: string): Promise<ScheduleEvent[]> {
    const filtered = mockScheduleEvents.filter(
      (e) => e.classroomId === classroomId,
    );
    return delay(500, filtered);
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
}

export const classroomService = new ClassroomService();
