import type { IClassroomService, AttendanceSheet } from "./interfaces/IClassroomService.ts";
import type { Classroom, Announcement, Resource, ScheduleEvent, AttendanceRecord, AttendanceSession } from "../types/classroom.types.ts";
import type { User } from "../types/user.types.ts";
import httpClient from "./api/httpClient.ts";

class ClassroomService implements IClassroomService {
  async getById(id: string): Promise<Classroom> { return httpClient.get<Classroom, Classroom>(`/classrooms/${id}`); }
  async listForMentor(mentorId: string): Promise<Classroom[]> { void mentorId; return httpClient.get<Classroom[], Classroom[]>("/classrooms"); }
  async listForStudent(studentId: string): Promise<Classroom[]> { void studentId; return httpClient.get<Classroom[], Classroom[]>("/classrooms"); }
  async getStudents(classroomId: string): Promise<User[]> { return httpClient.get<User[], User[]>(`/classrooms/${classroomId}/students`); }
  async getAnnouncements(classroomId: string): Promise<Announcement[]> { return httpClient.get<Announcement[], Announcement[]>(`/classrooms/${classroomId}/announcements`); }
  async createAnnouncement(classroomId: string, data: Partial<Announcement>): Promise<Announcement> { return httpClient.post<Announcement, Announcement>(`/classrooms/${classroomId}/announcements`, data); }
  async getResources(classroomId: string): Promise<Resource[]> { return httpClient.get<Resource[], Resource[]>(`/classrooms/${classroomId}/resources`); }
  async uploadResource(classroomId: string, data: Partial<Resource>): Promise<Resource> { return httpClient.post<Resource, Resource>(`/classrooms/${classroomId}/resources`, data); }
  async getSchedule(classroomId: string): Promise<ScheduleEvent[]> { return httpClient.get<ScheduleEvent[], ScheduleEvent[]>("/schedules", { params: { classroomId } }); }
  async getAttendance(classroomId: string): Promise<AttendanceSheet> { return httpClient.get<AttendanceSheet, AttendanceSheet>(`/classrooms/${classroomId}/attendance`); }
  async createAttendanceSession(classroomId: string, date: string): Promise<AttendanceSession> { return httpClient.post<AttendanceSession, AttendanceSession>("/attendance-sessions", { classroomId, date }); }
  async markAttendance(_classroomId: string, sessionId: string, records: AttendanceRecord[]): Promise<void> { await httpClient.post<void, void>(`/attendance-sessions/${sessionId}/records`, { records }); }
  async reportStudent(classroomId: string, studentId: string, note: string): Promise<void> { await httpClient.post<void, void>(`/classrooms/${classroomId}/reports`, { studentId, note }); }
  async getSchoolAnnouncements(schoolId: string): Promise<Announcement[]> { return httpClient.get<Announcement[], Announcement[]>(`/schools/${schoolId}/announcements`); }
  async broadcastSchoolAnnouncement(schoolId: string, data: { title: string; body: string; authorId: string }): Promise<void> { await httpClient.post<void, void>(`/schools/${schoolId}/announcements`, data); }
  async getPlatformAnnouncements(): Promise<Announcement[]> { return httpClient.get<Announcement[], Announcement[]>("/announcements/platform"); }
  async broadcastPlatformAnnouncement(data: { title: string; body: string; authorId: string }): Promise<void> { await httpClient.post<void, void>("/announcements/platform", data); }
}
export const classroomService = new ClassroomService();
