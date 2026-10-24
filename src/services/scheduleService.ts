import type { IScheduleService } from "./interfaces/IScheduleService.ts";
import type { ScheduleEvent } from "../types/classroom.types.ts";
import type { Role } from "../types/common.types.ts";
import httpClient from "./api/httpClient.ts";

class ScheduleService implements IScheduleService {
  async getSchoolEvents(schoolId: string): Promise<ScheduleEvent[]> {
    if (!schoolId) return [];
    return httpClient.get<ScheduleEvent[], ScheduleEvent[]>("/schedules", { params: { schoolId } });
  }
  async getClassroomEvents(classroomId: string): Promise<ScheduleEvent[]> {
    if (!classroomId) return [];
    return httpClient.get<ScheduleEvent[], ScheduleEvent[]>("/schedules", { params: { classroomId } });
  }
  async createEvent(data: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent> {
    const cleanData = {
      ...data,
      schoolId: data.schoolId || undefined,
      classroomId: data.classroomId || undefined,
      location: data.location || undefined,
    };
    return httpClient.post<ScheduleEvent, ScheduleEvent>("/schedules", cleanData);
  }
  async updateEvent(id: string, role: Role, data: Partial<ScheduleEvent>): Promise<ScheduleEvent> {
    void role;
    const cleanData = {
      ...data,
      location: data.location || undefined,
    };
    return httpClient.patch<ScheduleEvent, ScheduleEvent>(`/schedules/${id}`, cleanData);
  }
  async deleteEvent(id: string, role: Role): Promise<void> { void role; await httpClient.delete<void, void>(`/schedules/${id}`); }
}

export const scheduleService = new ScheduleService();
